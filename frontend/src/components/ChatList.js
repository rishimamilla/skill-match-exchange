import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMessageSquare } from 'react-icons/fi';
import axios from 'axios';
import { format } from 'date-fns';

const ChatList = ({ onSelectChat }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 10000); // Poll for new chats
    return () => clearInterval(interval);
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chat/chats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setChats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  const getOtherUser = (chat) => {
    return chat.participants.find(p => p._id !== user._id);
  };

  const getLastMessage = (chat) => {
    if (!chat.messages.length) return 'No messages yet';
    const lastMessage = chat.messages[chat.messages.length - 1];
    return lastMessage.content;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <FiMessageSquare className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {chats.map((chat) => {
              const otherUser = getOtherUser(chat);
              const unreadCount = chat.unreadCount.get(user._id) || 0;
              
              return (
                <button
                  key={chat._id}
                  onClick={() => onSelectChat(otherUser._id)}
                  className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {otherUser.profilePicture ? (
                          <img
                            src={otherUser.profilePicture}
                            alt={otherUser.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <FiUser className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {otherUser.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(chat.lastMessage), 'HH:mm')}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {getLastMessage(chat)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList; 