import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import io from 'socket.io-client';
import { getChats, getChatById, createChat, sendMessage } from '../api/chatAPI';
import { useAuth } from '../context/AuthContext';

const ChatContext = createContext(null);
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const newSocket = io(SOCKET_URL, {
        auth: { token },
      });
      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, []);

  useEffect(() => {
    if (socket && user) {
      // Notify server that user is online
      socket.emit('userOnline', user._id);

      socket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      socket.on('message', (message) => {
        // Update chats list
        setChats((prevChats) => {
          const chatIndex = prevChats.findIndex((c) => c._id === message.chatId);
          if (chatIndex > -1) {
            const updatedChats = [...prevChats];
            if (!updatedChats[chatIndex].messages) {
              updatedChats[chatIndex].messages = [];
            }
            updatedChats[chatIndex].messages.push(message);
            return updatedChats;
          }
          return prevChats;
        });

        // Update current chat if it's the active chat
        if (currentChat && currentChat._id === message.chatId) {
          setCurrentChat(prev => ({
            ...prev,
            messages: [...(prev.messages || []), message]
          }));
        }
      });
    }
  }, [socket, user, currentChat]);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChats();
      setChats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChatById = useCallback(async (chatId) => {
    setLoading(true);
    try {
      const data = await getChatById(chatId);
      setCurrentChat(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const startChat = useCallback(async (userId) => {
    setLoading(true);
    try {
      const data = await createChat(userId);
      setChats((prev) => [...prev, data]);
      setCurrentChat(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendChatMessage = useCallback(async (chatId, content) => {
    try {
      const message = await sendMessage(chatId, content);
      
      // Update chats list
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex((c) => c._id === chatId);
        if (chatIndex > -1) {
          const updatedChats = [...prevChats];
          if (!updatedChats[chatIndex].messages) {
            updatedChats[chatIndex].messages = [];
          }
          updatedChats[chatIndex].messages.push(message);
          return updatedChats;
        }
        return prevChats;
      });

      // Update current chat
      if (currentChat && currentChat._id === chatId) {
        setCurrentChat(prev => ({
          ...prev,
          messages: [...(prev.messages || []), message]
        }));
      }

      return message;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [currentChat]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        loading,
        error,
        onlineUsers,
        fetchChats,
        fetchChatById,
        startChat,
        sendChatMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 