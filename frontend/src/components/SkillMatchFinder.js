import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiFilter, FiUser, FiStar, FiMessageSquare } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const SkillMatchFinder = ({ onInitiateExchange }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMatches();
    fetchUserSkills();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/skills/matches', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load potential matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSkills = async () => {
    try {
      const response = await axios.get('/api/skills/user', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableSkills(response.data);
    } catch (error) {
      console.error('Error fetching user skills:', error);
    }
  };

  const handleInitiateExchange = async (matchId, matchSkills) => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill to offer');
      return;
    }

    try {
      const response = await axios.post(
        '/api/exchange',
        {
          recipientId: matchId,
          offeredSkillIds: selectedSkills,
          requestedSkillIds: matchSkills.map(skill => skill._id)
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      toast.success('Exchange request sent successfully!');
      setSelectedSkills([]);
      if (onInitiateExchange) {
        onInitiateExchange(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate exchange');
    }
  };

  const toggleSkillSelection = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.matchingSkills.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || 
                          match.matchingSkills.some(skill => skill.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(matches.flatMap(match => 
    match.matchingSkills.map(skill => skill.category)
  ))];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          Find Skill Exchange Partners
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <FiFilter className="mr-2" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or skill..."
                className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Skills to Offer
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map(skill => (
                <button
                  key={skill._id}
                  onClick={() => toggleSkillSelection(skill._id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedSkills.includes(skill._id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <div
              key={match.user._id}
              className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    {match.user.profilePicture ? (
                      <img
                        src={match.user.profilePicture}
                        alt={match.user.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <FiUser className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {match.user.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {match.matchingSkills.length} matching skills
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skills They Have:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {match.matchingSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <FiStar className="mr-1" />
                  <span>{match.user.rating || 'New'}</span>
                </div>
                <div className="flex items-center">
                  <FiMessageSquare className="mr-1" />
                  <span>{match.user.exchanges || 0} exchanges</span>
                </div>
              </div>

              <button
                onClick={() => handleInitiateExchange(match.user._id, match.matchingSkills)}
                disabled={selectedSkills.length === 0}
                className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedSkills.length > 0 ? 'Start Exchange' : 'Select Your Skills First'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No matches found. Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillMatchFinder; 