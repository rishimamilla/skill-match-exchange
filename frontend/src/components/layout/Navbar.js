import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiUsers, FiMessageSquare, FiLogOut, FiUser, FiSun, FiMoon, FiBell, FiSearch, FiHelpCircle, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { getStaticFileUrl } from '../../config';
import { useNotification } from '../../context/NotificationContext';
import ProfileImage from '../common/ProfileImage';
import skillAPI from '../../api/skillAPI';
import { toast } from 'react-toastify';

const Navbar = ({ onExchangeAccepted }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { 
    notifications, 
    showNotifications, 
    toggleNotifications, 
    markAsRead,
    fetchNotifications 
  } = useNotification();

  useEffect(() => {
    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getProfilePictureUrl = () => {
    return getStaticFileUrl(user?.profilePicture) || '/default-avatar.png';
  };

  const handleNotificationClick = async (notification) => {
    if (notification.type === 'exchange_request') {
      // Navigate to the exchange details page
      navigate(`/exchanges/${notification.exchangeId}`);
      // Mark the notification as read
      await markAsRead(notification.id);
    }
  };

  const handleAcceptExchange = async (exchangeId) => {
    try {
      await skillAPI.acceptExchange(exchangeId);
      toast.success('Exchange accepted successfully!');
      // Refresh notifications
      await fetchNotifications();
      // Close the notifications dropdown
      toggleNotifications();
      // Call the callback if provided
      if (onExchangeAccepted) {
        onExchangeAccepted();
      }
    } catch (error) {
      console.error('Error accepting exchange:', error);
      toast.error(error.response?.data?.message || 'Failed to accept exchange');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg fixed w-full z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/logo.svg"
                alt="SkillMatch Logo"
                className="h-10 w-10"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo192.png';
                }}
                loading="eager"
                width="40"
                height="40"
              />
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">SkillMatch</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <FiHome className="mr-1" />
              Home
            </Link>
            <Link
              to="/skills"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <FiUsers className="mr-1" />
              Skills
            </Link>
            {user && (
              <>
                <Link
                  to="/chat"
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <FiMessageSquare className="mr-1" />
                  Chat
                </Link>
                <Link
                  to="/dashboard"
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <FiUser className="mr-1" />
                  Dashboard
                </Link>
              </>
            )}
            <Link
              to="/about"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <FiInfo className="mr-1" />
              About
            </Link>
            <Link
              to="/help"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <FiHelpCircle className="mr-1" />
              Help
            </Link>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>

            {user && (
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                >
                  <FiBell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-gray-500 dark:text-gray-400">No new notifications</p>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer ${
                              !notification.read ? 'bg-gray-50 dark:bg-gray-700' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                            {notification.type === 'exchange_request' && !notification.read && (
                              <div className="mt-2 flex justify-end">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptExchange(notification.exchangeId);
                                  }}
                                  className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                >
                                  Accept Exchange
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                  <ProfileImage
                    src={user.profilePicture}
                    alt="Profile"
                    size="xs"
                  />
                  <span className="text-sm font-medium">{user.name}</span>
                  <FiUser className="ml-1" />
                </button>
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white dark:bg-gray-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 flex items-center"
                  >
                    <FiLogOut className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 