import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiCircle, FiMessageSquare, FiSearch } from 'react-icons/fi';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

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

  useEffect(() => {
    fetchChats();
  }, []);

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
    const otherUser = chat.participants.find(p => p._id !== user._id);
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Online Users Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Online Users</h2>
            <div className="space-y-2">
              {onlineUsers.map((onlineUser) => (
                <div
                  key={onlineUser._id}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => startChat(onlineUser._id)}
                >
                  <FiCircle className="text-green-500" />
                  <span className="text-gray-700">{onlineUser.name}</span>
                </div>
              ))}
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
                const otherUser = chat.participants.find(p => p._id !== user._id);
                const isOnline = onlineUsers.some(u => u._id === otherUser._id);
                return (
                  <div
                    key={chat._id}
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer ${
                      currentChat?._id === chat._id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => fetchChatById(chat._id)}
                  >
                    <div className="relative">
                      <FiUser className="text-gray-400" />
                      {isOnline && (
                        <FiCircle className="absolute -bottom-1 -right-1 text-green-500 text-xs" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{otherUser.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md">
            {currentChat ? (
              <div className="flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentChat.participants.find(p => p._id !== user._id).name}
                  </h2>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentChat.messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender._id === user._id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs rounded-lg p-3 ${
                          message.sender._id === user._id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No chat selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a chat from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 