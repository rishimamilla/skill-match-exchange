import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const ChatPage = () => {
  const { user } = useAuth();
  const {
    chats,
    currentChat,
    loading,
    error,
    fetchChats,
    fetchChatById,
    sendChatMessage,
    setCurrentChat,
  } = useChat();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (currentChat) {
      fetchChatById(currentChat._id);
    }
  }, [currentChat, fetchChatById]);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentChat) return;

    try {
      await sendChatMessage(currentChat._id, message);
      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* Chat List */}
      <div className="w-1/3 border-r dark:border-gray-700 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Conversations</h2>
          {chats.map((chat) => {
            const otherParticipant = chat.participants.find(
              (p) => p._id !== user._id
            );
            const lastMessage = chat.messages[chat.messages.length - 1];
            const unreadCount = chat.messages.filter(
              (m) => !m.readBy.includes(user._id) && m.sender !== user._id
            ).length;

            return (
              <div
                key={chat._id}
                onClick={() => setCurrentChat(chat)}
                className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  currentChat?._id === chat._id
                    ? 'bg-blue-50 dark:bg-blue-900'
                    : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{otherParticipant.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {lastMessage
                        ? formatTime(lastMessage.timestamp)
                        : formatTime(chat.createdAt)}
                    </p>
                    {unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold">
                {currentChat.participants
                  .find((p) => p._id !== user._id)
                  .name}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentChat.messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.sender === user._id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender === user._id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === user._id
                          ? 'text-blue-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 