import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import { FiSend, FiX } from 'react-icons/fi';
import { format } from 'date-fns';

const Chat = ({ chat: chatProp, recipientId, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [chat, setChat] = useState(chatProp);
  const messagesEndRef = useRef(null);
  const socketRef = useRef();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Fetch chat data if recipientId is provided
  useEffect(() => {
    const fetchChat = async () => {
      if (!recipientId) return;
      
      try {
        console.log('Fetching chat for recipient:', recipientId);
        
        // If recipientId is a chat object, use it directly
        if (typeof recipientId === 'object' && recipientId.participants) {
          console.log('Using chat object directly');
          setChat(recipientId);
          const otherUser = recipientId.participants.find(p => p._id !== user._id);
          if (otherUser) {
            setOtherUser(otherUser);
            setMessages(recipientId.messages || []);
            setLoading(false);
            return;
          }
        }
        
        // If not a chat object, create or get a chat with this user
        const participantId = typeof recipientId === 'object' ? recipientId._id : recipientId;
        console.log('Creating or getting chat with participant ID:', participantId);
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        
        // Create or get the chat
        const response = await axios.post(`${API_URL}/chat`, {
          participantId: participantId
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        console.log('Chat fetched:', response.data);
        
        if (!response.data || !response.data.participants) {
          throw new Error('Invalid chat data received');
        }
        
        setChat(response.data);
        
        // Set other user
        const otherUser = response.data.participants.find(p => p._id !== user._id);
        if (!otherUser) {
          console.error('No other user found in chat response');
          setConnectionError('Failed to load chat: User not found');
          setLoading(false);
          return;
        }
        
        setOtherUser(otherUser);
        
        // Initialize messages
        setMessages(response.data.messages || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chat:', error);
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        let errorMessage = 'Failed to load chat. Please try again.';
        if (error.response?.data?.message) {
          errorMessage = `Error: ${error.response.data.message}`;
        }
        
        setConnectionError(errorMessage);
        setLoading(false);
      }
    };

    fetchChat();
  }, [recipientId, user._id]);

  // Initialize chat data if chat prop is provided
  useEffect(() => {
    if (!chatProp) return;

    console.log('Initializing chat from prop:', chatProp);
    setChat(chatProp);
    
    // Set other user immediately
    const otherUser = chatProp.participants.find(p => p._id !== user._id);
    setOtherUser(otherUser);

    // Initialize messages
    setMessages(chatProp.messages || []);
    setLoading(false);
  }, [chatProp, user._id]);

  // Handle socket connection
  useEffect(() => {
    if (!chat || !otherUser) return;

    const connectSocket = () => {
      if (socketRef.current?.connected) {
        console.log('Socket already connected, disconnecting first');
        socketRef.current.disconnect();
      }

      console.log('Connecting to socket server...');
      const socketUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace('/api', '');
      console.log('Socket URL:', socketUrl);
      
      socketRef.current = io(socketUrl, {
        auth: {
          token: localStorage.getItem('token')
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        path: '/socket.io'
      });

      // Connect manually after setup
      console.log('Manually connecting socket...');
      socketRef.current.connect();

      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully');
        setSocketConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        
        // Join chat room after connection
        const room = `chat:${chat._id}`;
        console.log('Joining chat room:', room);
        socketRef.current.emit('joinChat', room);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setSocketConnected(false);
        setConnectionError('Failed to connect to chat server');
        reconnectAttemptsRef.current += 1;

        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionError('Unable to connect to chat server. Please try again later.');
        }
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setSocketConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          console.log('Server initiated disconnect, attempting to reconnect...');
          socketRef.current.connect();
        }
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
        setConnectionError('An error occurred with the chat connection');
      });

      // Listen for new messages
      socketRef.current.on('newMessage', (data) => {
        console.log('Received new message:', data);
        if (data.chatId === chat._id) {
          setMessages(prev => [...prev, data.message]);
          // Mark message as read if it's from the other user
          if (data.message.sender._id !== user._id) {
            markMessagesAsRead();
          }
        }
      });

      // Listen for message read events
      socketRef.current.on('messageRead', (data) => {
        console.log('Messages marked as read:', data);
        if (data.chatId === chat._id) {
          setMessages(prev => prev.map(msg => ({
            ...msg,
            read: true
          })));
        }
      });

      // Listen for user joined events
      socketRef.current.on('userJoined', (data) => {
        console.log('User joined room:', data);
        if (data.room === `chat:${chat._id}`) {
          // Update UI to show user is online
          console.log(`User ${data.userId} joined the chat`);
        }
      });

      // Listen for user left events
      socketRef.current.on('userLeft', (data) => {
        console.log('User left room:', data);
        if (data.room === `chat:${chat._id}`) {
          // Update UI to show user is offline
          console.log(`User ${data.userId} left the chat`);
        }
      });
    };

    connectSocket();

    // Mark messages as read when opening chat
    if (chat.messages?.some(m => !m.read && m.sender._id !== user._id)) {
      markMessagesAsRead();
    }

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.emit('leaveChat', `chat:${chat._id}`);
        socketRef.current.disconnect();
      }
    };
  }, [chat?._id, otherUser, user._id]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const markMessagesAsRead = async () => {
    if (!chat?._id) return;
    
    try {
      console.log('Marking messages as read for chat:', chat._id);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await axios.put(`${API_URL}/chat/${chat._id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat?._id) return;

    try {
      setLoading(true);
      console.log('Sending message to chat:', chat._id);
      
      // Ensure the chat ID is a valid string
      const chatId = chat._id.toString();
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      // Now send the message directly
      const url = `${API_URL}/chat/${chatId}/messages`;
      console.log('Sending request to:', url);
      
      const response = await axios.post(url, {
        content: newMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('Message sent successfully:', response.data);
      
      // Add the new message to the messages array
      if (response.data) {
        setMessages(prevMessages => [...prevMessages, response.data]);
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Display more detailed error information
      let errorMessage = 'Failed to send message. Please try again.';
      if (error.response?.data?.details) {
        errorMessage = `Error: ${error.response.data.details}`;
      } else if (error.response?.data?.message) {
        errorMessage = `Error: ${error.response.data.message}`;
      }
      
      setConnectionError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryConnection = () => {
    console.log('Retrying socket connection...');
    reconnectAttemptsRef.current = 0;
    setConnectionError(null);
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!chat || !otherUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500">No chat selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            {otherUser.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-xl font-medium text-gray-600">
                {otherUser.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{otherUser.name}</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-500">
                {socketConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Connection Error Message */}
      {connectionError && (
        <div className="bg-red-50 p-4 border-b border-red-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600">{connectionError}</p>
            <button
              onClick={handleRetryConnection}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender._id === user._id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender._id === user._id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-75 mt-1 block">
                  {format(new Date(message.timestamp), 'HH:mm')}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || !socketConnected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || loading || !socketConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat; 