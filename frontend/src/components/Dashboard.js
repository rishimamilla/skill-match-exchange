import React, { useState, useEffect } from 'react';
import { FiActivity, FiUsers, FiMessageSquare, FiStar, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import skillAPI from '../api/skillAPI';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    totalExchanges: 0,
    activeExchanges: 0,
    completedExchanges: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch recent exchanges
      const exchangesResponse = await skillAPI.getActiveExchanges(user._id);
      const exchanges = exchangesResponse.exchanges || [];

      // Calculate stats
      const completedExchanges = exchanges.filter(ex => ex.status === 'completed').length;
      const activeExchanges = exchanges.filter(ex => ex.status === 'accepted').length;
      const pendingExchanges = exchanges.filter(ex => ex.status === 'pending').length;

      // Format recent activity
      const activity = exchanges.map(exchange => ({
        id: exchange._id,
        type: 'exchange',
        status: exchange.status,
        date: exchange.createdAt,
        user: exchange.initiator._id === user._id ? exchange.recipient : exchange.initiator,
        details: `${exchange.initiator._id === user._id ? 'You initiated' : 'You received'} an exchange request`
      }));

      setStats({
        totalExchanges: exchanges.length,
        activeExchanges: activeExchanges + pendingExchanges,
        completedExchanges,
        averageRating: user.rating || 0
      });

      setRecentActivity(activity.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'accepted':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900">
              <FiUsers className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Exchanges</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalExchanges}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <FiActivity className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Exchanges</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activeExchanges}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <FiCheck className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completedExchanges}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <FiStar className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading activity...</p>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <img
                    src={activity.user.profilePicture || '/default-avatar.png'}
                    alt={activity.user.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.user.name}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(activity.date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.details}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusColor(activity.status)}`}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiActivity className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                No recent activity to show.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 