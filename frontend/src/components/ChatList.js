import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMessageSquare } from 'react-icons/fi';
import axios from 'axios';
import { format } from 'date-fns';
import io from 'socket.io-client';

const ChatList = ({ onSelectChat }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  // Request notification permission when component mounts
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
        if (permission === 'granted') {
          // Test notification to verify it's working
          new Notification('Notifications Enabled', {
            body: 'You will now receive notifications for new messages',
            icon: '/default-avatar.png'
          });
        }
      });
    } else if (Notification.permission === 'granted') {
      console.log('Notifications already enabled');
    } else {
      console.log('Notifications not enabled:', Notification.permission);
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!user?._id) return;

    console.log('Initializing socket connection in ChatList');
    const socketUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace('/api', '');
    console.log('Socket URL:', socketUrl);
    
    socketRef.current = io(socketUrl, {
      auth: {
        token: localStorage.getItem('token')
      },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected in ChatList');
      // Join user's personal room for notifications
      socketRef.current.emit('joinUserRoom', `user:${user._id}`);
      
      // Test notification when socket connects
      if (Notification.permission === 'granted') {
        new Notification('Socket Connected', {
          body: 'Real-time notifications are now active',
          icon: '/default-avatar.png'
        });
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error in ChatList:', error);
    });

    socketRef.current.on('newMessage', (data) => {
      console.log('New message received in ChatList:', data);
      
      // Always show notification for testing
      if (Notification.permission === 'granted') {
        const senderName = data?.sender?.name || 'Someone';
        const messageContent = data?.message?.content || 'New message';
        
        console.log('Showing notification for:', senderName, messageContent);
        
        new Notification(`New message from ${senderName}`, {
          body: messageContent,
          icon: data?.sender?.profilePicture || '/default-avatar.png'
        });
      } else {
        console.log('Notifications not enabled, cannot show notification');
      }
      
      // Update chat list with new message
      setChats(prevChats => {
        const updatedChats = prevChats.map(chat => {
          if (chat._id === data.chatId) {
            return {
              ...chat,
              lastMessage: data?.message?.content || 'New message',
              lastMessageTime: data?.message?.timestamp || new Date(),
              unreadCount: {
                ...chat.unreadCount,
                [user._id]: (chat.unreadCount?.[user._id] || 0) + 1
              }
            };
          }
          return chat;
        });
        
        // If chat doesn't exist yet, add it
        if (!updatedChats.some(chat => chat._id === data.chatId)) {
          // Fetch the full chat data
          fetchChatById(data.chatId);
        }
        
        return updatedChats;
      });
    });

    // Fetch chats
    fetchChats();

    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket in ChatList');
        socketRef.current.disconnect();
      }
    };
  }, [user?._id]);

  const fetchChats = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/chat`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setChats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  const fetchChatById = async (chatId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setChats(prevChats => {
        // Check if chat already exists
        if (prevChats.some(chat => chat._id === chatId)) {
          return prevChats.map(chat => 
            chat._id === chatId ? response.data : chat
          );
        }
        // Add new chat
        return [...prevChats, response.data];
      });
    } catch (error) {
      console.error('Error fetching chat by ID:', error);
    }
  };

  const getLastMessage = (chat) => {
    if (!chat?.messages || chat.messages.length === 0) return 'No messages yet';
    const lastMessage = chat.messages[chat.messages.length - 1];
    return lastMessage?.content || 'No message content';
  };

  const getOtherUser = (chat) => {
    if (!chat?.participants || !user?._id) return null;
    
    // Find the other user in the participants array
    const otherUser = chat.participants.find(p => p._id !== user._id);
    
    // If no other user is found, log an error
    if (!otherUser) {
      console.error('No other user found in chat:', chat);
    }
    
    return otherUser || null;
  };

  // Handle chat selection
  const handleChatSelect = (chat) => {
    // Make sure we have the other user
    const otherUser = getOtherUser(chat);
    if (!otherUser) {
      console.error('Cannot select chat: No other user found');
      return;
    }
    
    // Call the onSelectChat callback with the chat
    onSelectChat(chat);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <FiMessageSquare className="w-12 h-12 mb-4" />
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {chats.map((chat) => {
        const otherUser = getOtherUser(chat);
        if (!otherUser) return null;

        const lastMessage = getLastMessage(chat);
        const unreadCount = chat?.unreadCount?.[user?._id] || 0;
        
        return (
          <div
            key={chat._id}
            onClick={() => handleChatSelect(chat)}
            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                {otherUser?.profilePicture ? (
                  <img
                    src={otherUser.profilePicture}
                    alt={otherUser?.name || 'User'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <FiUser className="w-6 h-6 text-gray-500" />
                )}
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </div>
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{otherUser?.name || 'Unknown User'}</h3>
                {chat?.messages?.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {format(new Date(chat.messages[chat.messages.length - 1]?.timestamp || new Date()), 'HH:mm')}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">{lastMessage}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList; 