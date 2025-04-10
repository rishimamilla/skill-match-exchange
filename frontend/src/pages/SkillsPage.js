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
    search: '',
    minRating: '',
    sortBy: 'relevance'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [showVisualization, setShowVisualization] = useState(false);
  const [totalSkills, setTotalSkills] = useState(0);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchMetadata, setSearchMetadata] = useState(null);

  useEffect(() => {
    fetchSkills();
    if (user) {
      fetchMatchedSkills();
    }
  }, [filters, user]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (filters.search || filters.category || filters.difficulty || filters.minRating) {
        console.log('Searching with filters:', filters);
        result = await skillAPI.searchSkills(filters.search, {
          category: filters.category,
          difficulty: filters.difficulty,
          minRating: filters.minRating,
          sortBy: filters.sortBy
        });
        setSkills(result.data || []);
        setTotalSkills(result.total || 0);
        setSearchMetadata(result.metadata);
      } else {
        const allSkills = await skillAPI.getAllSkills();
        setSkills(Array.isArray(allSkills) ? allSkills : []);
        setTotalSkills(Array.isArray(allSkills) ? allSkills.length : 0);
        setSearchMetadata(null);
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(err.message || 'Failed to fetch skills');
      toast.error(err.message || 'Failed to fetch skills');
      setSkills([]);
      setTotalSkills(0);
      setSearchMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search with improved handling
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, [name]: value }));
    }, 500);

    setSearchTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const fetchMatchedSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await skillAPI.getSkillMatches();
      setMatchedSkills(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load skill matches');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e) => {
    const { value } = e.target;
    setFilters(prev => ({ ...prev, sortBy: value }));
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
  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' }
  ];

  if (loading && !skills.length) {
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

  if (error && !skills.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg max-w-md w-full">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            Error Loading Skills
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
          <button
            onClick={fetchSkills}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="relative flex-1 mb-4 md:mb-0">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.search}
                onChange={handleSearchChange}
                name="search"
              />
            </div>
            <div className="flex space-x-4">
              <select
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.category}
                onChange={handleFilterChange}
                name="category"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.difficulty}
                onChange={handleFilterChange}
                name="difficulty"
              >
                <option value="">All Levels</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
              <select
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.sortBy}
                onChange={handleSortChange}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {totalSkills > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Found {totalSkills} skills matching your criteria
              </p>
              {searchMetadata && (
                <div className="flex items-center space-x-2">
                  {searchMetadata.filters.category && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Category: {searchMetadata.filters.category}
                    </span>
                  )}
                  {searchMetadata.filters.difficulty && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Level: {searchMetadata.filters.difficulty}
                    </span>
                  )}
                  {searchMetadata.filters.minRating && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Min Rating: {searchMetadata.filters.minRating}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Skills Grid */}
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
                    {skill.rating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="flex items-center">
                    <FaUsers className="mr-1" />
                    {skill.popularity || 0}
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-1" />
                    {skill.duration || 'N/A'}
                  </div>
                </div>
                {skill.tags && skill.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skill.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => handleExchangeClick(skill)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaExchangeAlt className="mr-2" />
                  Start Exchange
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading indicator for subsequent searches */}
        {loading && skills.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Updating results...</span>
            </div>
          </div>
        )}

        {/* Exchange Modal */}
        {showExchangeModal && (
          <SkillExchangeModal
            skill={selectedSkill}
            onClose={() => setShowExchangeModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default SkillsPage; 