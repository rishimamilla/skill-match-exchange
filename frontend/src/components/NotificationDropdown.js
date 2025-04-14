import React from 'react';
import { FiBell, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useNotification } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const {
    notifications,
    showNotifications,
    setShowNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotification();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'exchange_request':
        return '🔄';
      case 'exchange_accepted':
        return '✅';
      case 'exchange_rejected':
        return '❌';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.exchangeId) {
      return `/exchanges/${notification.exchangeId}`;
    }
    return '#';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={getNotificationLink(notification)}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                    setShowNotifications(false);
                  }}
                  className={`block p-4 hover:bg-gray-50 ${
                    !notification.read ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.sender?.name || 'System'}
                        </p>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-500">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <div className="ml-2 flex-shrink-0">
                        <FiAlertCircle className="w-4 h-4 text-indigo-500" />
                      </div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 