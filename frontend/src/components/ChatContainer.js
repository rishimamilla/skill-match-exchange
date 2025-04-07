import React, { useState } from 'react';
import ChatList from './ChatList';
import Chat from './Chat';

const ChatContainer = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Chat List - 1/3 width on desktop, full width on mobile when no chat selected */}
      <div className={`w-full md:w-1/3 ${selectedUserId ? 'hidden md:block' : 'block'}`}>
        <ChatList onSelectChat={setSelectedUserId} />
      </div>

      {/* Chat Window - 2/3 width on desktop, full width on mobile when chat selected */}
      <div className={`w-full md:w-2/3 ${selectedUserId ? 'block' : 'hidden md:block'}`}>
        {selectedUserId ? (
          <Chat otherUserId={selectedUserId} />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a chat from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer; 