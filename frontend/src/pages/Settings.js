import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiMoon, FiSun, FiBell, FiLock, FiUser, FiGlobe } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [language, setLanguage] = useState('en');

  const handleEmailNotificationsChange = async (e) => {
    setEmailNotifications(e.target.checked);
    try {
      // Here you would typically make an API call to update the setting
      toast.success('Email notifications updated');
    } catch (error) {
      toast.error('Failed to update email notifications');
      setEmailNotifications(!e.target.checked); // Revert on error
    }
  };

  const handleProfileVisibilityChange = async (e) => {
    setProfileVisibility(e.target.value);
    try {
      // Here you would typically make an API call to update the setting
      toast.success('Profile visibility updated');
    } catch (error) {
      toast.error('Failed to update profile visibility');
      setProfileVisibility(e.target.value === 'public' ? 'private' : 'public'); // Revert on error
    }
  };

  const handleLanguageChange = async (e) => {
    setLanguage(e.target.value);
    try {
      // Here you would typically make an API call to update the setting
      toast.success('Language preference updated');
    } catch (error) {
      toast.error('Failed to update language preference');
      setLanguage('en'); // Revert on error
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
        
        {/* Profile Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiUser className="mr-2" />
            Profile Information
          </h2>
          
          {/* Profile Picture Display */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {user?.profilePicture ? (
                <img
                  src={`${process.env.REACT_APP_API_URL}${user.profilePicture}`}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <FiUser className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Name</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Email</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Location</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.location || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Bio</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.bio || 'No bio yet'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiSun className="mr-2" />
            Appearance
          </h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Theme</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {isDarkMode ? (
                <FiSun className="h-5 w-5 text-gray-400" />
              ) : (
                <FiMoon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiBell className="mr-2" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive email notifications about skill matches and messages
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={emailNotifications}
                  onChange={handleEmailNotificationsChange}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiLock className="mr-2" />
            Privacy
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Profile Visibility</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Control who can see your profile and skills
                </p>
              </div>
              <select 
                className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                value={profileVisibility}
                onChange={handleProfileVisibilityChange}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="connections">Connections Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiGlobe className="mr-2" />
            Language
          </h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Preferred Language</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose your preferred language for the interface
              </p>
            </div>
            <select 
              className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 