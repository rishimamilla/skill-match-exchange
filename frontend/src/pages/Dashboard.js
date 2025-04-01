import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiMessageSquare, FiStar, FiTrendingUp, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';
import skillAPI from '../api/skillAPI';
import { useChat } from '../context/ChatContext';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { activeChats } = useChat();
  const [stats, setStats] = useState({
    totalMatches: 0,
    activeChats: 0,
    skillsLearned: 0,
    skillsTaught: 0,
    achievements: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topSkills, setTopSkills] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      // Set up polling for real-time updates
      const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, activeChats]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch matches
      const matches = await skillAPI.getSkillMatches(user._id);
      const totalMatches = matches.length;

      // Calculate skills learned and taught
      const skillsLearned = user.skills?.filter(skill => skill.status === 'learning').length || 0;
      const skillsTaught = user.skills?.filter(skill => skill.status === 'teaching').length || 0;

      // Update stats
      setStats({
        totalMatches,
        activeChats: activeChats.length,
        skillsLearned,
        skillsTaught,
        achievements: user.achievements?.length || 0,
      });

      // Process recent activity from matches
      const recentMatches = matches.slice(0, 5).map(match => ({
        id: match.user._id,
        type: 'match',
        description: `New skill match with ${match.user.name}`,
        time: new Date().toISOString(),
      }));

      // Process recent chats
      const recentChats = activeChats.slice(0, 5).map(chat => ({
        id: chat._id,
        type: 'message',
        description: `Message from ${chat.participants.find(p => p._id !== user._id).name}`,
        time: chat.lastMessage?.createdAt || new Date().toISOString(),
      }));

      // Process recent achievements
      const achievements = user.achievements?.slice(0, 5).map(achievement => ({
        id: achievement._id || Math.random().toString(),
        type: 'achievement',
        description: achievement.title,
        time: achievement.date,
      })) || [];

      // Combine and sort activities
      const allActivities = [...recentMatches, ...recentChats, ...achievements]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5)
        .map(activity => ({
          ...activity,
          time: formatTimeAgo(new Date(activity.time)),
        }));

      setRecentActivity(allActivities);
      setRecentAchievements(achievements);

      // Process top skills
      const userSkills = user.skills?.map(skill => ({
        name: skill.skill,
        status: skill.status,
        rating: skill.rating || 0,
        matches: matches.filter(match => 
          match.user.skills.some(s => s.skill === skill.skill && s.status !== skill.status)
        ).length,
      })) || [];

      // Sort by matches and rating
      const sortedSkills = userSkills
        .sort((a, b) => {
          if (b.matches !== a.matches) {
            return b.matches - a.matches;
          }
          return b.rating - a.rating;
        })
        .slice(0, 5);

      setTopSkills(sortedSkills);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to update dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="mt-1 text-sm text-gray-500">Here's what's happening with your skill exchanges</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiUsers className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Matches</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.totalMatches}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiMessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Chats</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.activeChats}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiStar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Skills Learned</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.skillsLearned}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiTrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Skills Taught</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.skillsTaught}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiAward className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Achievements</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.achievements}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity and Top Skills */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <motion.li
                  key={activity.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-6 py-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Top Skills */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Your Skills</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {topSkills.map((skill, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-6 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">{skill.name}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          skill.status === 'teaching' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {skill.status === 'teaching' ? 'Teaching' : 'Learning'}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(skill.rating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {skill.matches} potential matches
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 