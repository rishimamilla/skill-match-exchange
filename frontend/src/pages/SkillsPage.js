import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaStar, FaUsers, FaClock, FaExchangeAlt } from 'react-icons/fa';
import skillAPI from '../api/skillAPI';
import { useAuth } from '../context/AuthContext';
import SkillExchangeModal from '../components/skills/SkillExchangeModal';
import SkillMatchVisualization from '../components/skills/SkillMatchVisualization';
import { toast } from 'react-toastify';
import { FiLoader } from 'react-icons/fi';

const SkillsPage = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [showVisualization, setShowVisualization] = useState(false);

  useEffect(() => {
    fetchSkills();
    if (user) {
      fetchMatchedSkills();
    }
  }, [filters, user]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await skillAPI.getSkills(filters);
      setSkills(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchedSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await skillAPI.getSkillMatches();
      setMatchedSkills(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch skill matches');
      toast.error('Failed to load skill matches');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExchangeClick = (skill) => {
    setSelectedSkill(skill);
    setShowExchangeModal(true);
  };

  const categories = [
    'Programming', 'Design', 'Marketing', 'Business',
    'Language', 'Music', 'Art', 'Sports', 'Cooking', 'Other'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl text-blue-500"
        >
          <FiLoader />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg max-w-md w-full">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            Error Loading Skills
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Skills
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Explore and connect with people who share your interests
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search skills..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaFilter className="mr-2" />
                Filters
              </button>
              {user && (
                <button
                  onClick={() => setShowVisualization(!showVisualization)}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaExchangeAlt className="mr-2" />
                  View Matches
                </button>
              )}
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={filters.difficulty}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Levels</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </div>

        {/* Skill Match Visualization */}
        {showVisualization && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <SkillMatchVisualization
              userSkills={user.skills}
              matchedSkills={matchedSkills}
            />
          </motion.div>
        )}

        {/* Skills Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, index) => (
              <motion.div
                key={skill._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {skill.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {skill.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {skill.category}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {skill.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <FaStar className="mr-1 text-yellow-400" />
                      {skill.averageRating.toFixed(1)}
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="mr-1" />
                      {skill.popularity}
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      {skill.duration}
                    </div>
                  </div>
                  {user && (
                    <button
                      onClick={() => handleExchangeClick(skill)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaExchangeAlt className="mr-2" />
                      Exchange Skills
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Exchange Modal */}
      {selectedSkill && (
        <SkillExchangeModal
          isOpen={showExchangeModal}
          onClose={() => {
            setShowExchangeModal(false);
            setSelectedSkill(null);
          }}
          skill={selectedSkill}
          user={user}
        />
      )}
    </div>
  );
};

export default SkillsPage; 