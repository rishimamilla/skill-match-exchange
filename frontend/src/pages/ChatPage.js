import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiCircle, FiMessageSquare, FiSearch, FiUsers } from 'react-icons/fi';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ChatPage = () => {
  const { user } = useAuth();
  const { 
    chats, 
    currentChat, 
    loading, 
    error, 
    onlineUsers,
    fetchChats, 
    fetchChatById, 
    startChat, 
    sendChatMessage 
  } = useChat();
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentChat) return;

    try {
      await sendChatMessage(currentChat._id, message);
      setMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const filteredChats = chats.filter(chat => {
    if (!chat?.participants) return false;
    const otherUser = chat.participants.find(p => p?._id !== user?._id);
    return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
  });

  const formatMessageTime = (timestamp) => {
    try {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error loading chats: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Online Users Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center space-x-2 mb-4">
              <FiUsers className="text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-900">Online Users</h2>
              <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {onlineUsers?.length || 0} online
              </span>
            </div>
            <div className="space-y-2">
              {onlineUsers?.length > 0 ? (
                onlineUsers.map((onlineUser) => (
                  <div
                    key={onlineUser?._id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                    onClick={() => startChat(onlineUser?._id)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {onlineUser?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">Click to start chat</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No users online</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat List */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              {filteredChats.map((chat) => {
                const otherUser = chat?.participants?.find(p => p?._id !== user?._id);
                const isOnline = onlineUsers?.some(u => u?._id === otherUser?._id);
                return (
                  <div
                    key={chat?._id}
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer ${
                      currentChat?._id === chat?._id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => fetchChatById(chat?._id)}
                  >
                    <div className="relative">
                      <FiUser className="w-8 h-8 text-gray-400" />
                      {isOnline && (
                        <FiCircle className="absolute bottom-0 right-0 w-3 h-3 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {otherUser?.name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {chat?.lastMessage?.text || 'No messages yet'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-4">
            {currentChat ? (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentChat?.participants?.find(p => p?._id !== user?._id)?.name || 'Unknown User'}
                  </h2>
                </div>
                <div className="h-96 overflow-y-auto mb-4">
                  {currentChat?.messages?.map((message) => (
                    <div
                      key={message?._id}
                      className={`mb-4 ${
                        message?.sender?._id === user?._id ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block p-3 rounded-lg ${
                          message?.sender?._id === user?._id
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message?.content || message?.text}
                        <div className="text-xs mt-1 opacity-70">
                          {formatMessageTime(message?.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage}>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Select a chat to start messaging</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 