import React, { useState, useEffect } from 'react';
import { FiUsers, FiMessageSquare, FiClock, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import skillAPI from '../api/skillAPI';

const SkillExchange = () => {
  const { user } = useAuth();
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPotentialMatches();
  }, [user]);

  const fetchPotentialMatches = async () => {
    setLoading(true);
    try {
      const response = await skillAPI.findSkillMatches(user._id);
      setPotentialMatches(response.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load potential matches');
    } finally {
      setLoading(false);
    }
  };

  const initiateExchange = async (matchId) => {
    try {
      await skillAPI.initiateExchange({
        userId: user._id,
        matchId: matchId
      });
      toast.success('Exchange request sent successfully!');
      fetchPotentialMatches(); // Refresh the list
    } catch (error) {
      console.error('Error initiating exchange:', error);
      toast.error('Failed to send exchange request');
    }
  };

  const filteredMatches = potentialMatches.filter(match => {
    const matchesSearch = match.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.matchingSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || 
                          match.matchingSkills.some(skill => skill.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const skillCategories = [
    'All',
    'Programming',
    'Design',
    'Marketing',
    'Business',
    'Language',
    'Music',
    'Art',
    'Sports',
    'Cooking',
    'Other'
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Skill Exchange Opportunities
        </h2>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {skillCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading potential matches...</p>
            </div>
          ) : filteredMatches.length > 0 ? (
            filteredMatches.map((match) => (
              <div
                key={match._id}
                className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={match.user.profilePicture || '/default-avatar.png'}
                      alt={match.user.name}
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {match.user.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {match.matchingSkills.length} matching skills
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => initiateExchange(match.user._id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    Start Exchange
                  </button>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Matching Skills:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {match.matchingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                      >
                        {skill}
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
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <FiUsers className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                No matches found. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillExchange; 