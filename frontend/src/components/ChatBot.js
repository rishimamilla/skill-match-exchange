import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiHelpCircle, FiBook, FiTarget, FiUser, FiMessageCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Hello! I\'m your SkillMatch assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSuggestions([]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        content: getBotResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('help') || input.includes('what can you do')) {
      return 'I can help you with:\n- Finding skill matches\n- Understanding how to use the platform\n- Answering questions about skill exchange\n- Providing tips for effective learning\n- Explaining the rating system\n- Setting up your profile\nWhat would you like to know more about?';
    }
    
    if (input.includes('match') || input.includes('find')) {
      return 'To find skill matches:\n1. Go to the Skills page\n2. Use the search and filter options\n3. Click on a skill to see potential matches\n4. Connect with users who have complementary skills\n\nPro tip: Complete your profile with detailed skills and interests for better matches!';
    }
    
    if (input.includes('profile') || input.includes('account')) {
      return 'To manage your profile:\n1. Click on your profile picture\n2. Select "Profile" from the dropdown\n3. Update your information, skills, and interests\n4. Add a profile picture and bio\n5. Save your changes\n\nA complete profile helps others find you!';
    }
    
    if (input.includes('chat') || input.includes('message')) {
      return 'To start chatting:\n1. Find a user with matching skills\n2. Click on their profile\n3. Use the "Start Chat" button\n4. Begin your skill exchange conversation\n\nRemember to be respectful and clear about your learning goals!';
    }

    if (input.includes('rating') || input.includes('review')) {
      return 'Our rating system:\n- Rate users after skill exchange\n- Provide detailed feedback\n- Help others make informed decisions\n- Build your reputation\n\nHigh ratings increase your chances of finding matches!';
    }

    if (input.includes('safety') || input.includes('security')) {
      return 'We prioritize your safety:\n- Verify user profiles\n- Meet in public places\n- Use our in-app chat system\n- Report suspicious activity\n- Never share personal information\n\nYour safety is our top priority!';
    }

    if (input.includes('creator') || input.includes('who made')) {
      return 'SkillMatch was created by Rishi Mamilla and Sangeetha Uppari to make skill sharing accessible and enjoyable for everyone. Visit our About page to learn more!';
    }
    
    return 'I\'m not sure about that. Could you please rephrase your question? Or type "help" to see what I can do!';
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    
    if (value.trim()) {
      const suggestions = [
        'How do I find skill matches?',
        'How do I update my profile?',
        'How does the rating system work?',
        'How do I start chatting?',
        'Tell me about safety measures',
        'Who created SkillMatch?'
      ].filter(s => s.toLowerCase().includes(value.toLowerCase()));
      
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-50"
      >
        <FiMessageSquare className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FiHelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SkillMatch Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                {suggestions.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInput(suggestion);
                          setSuggestions([]);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiSend className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot; 