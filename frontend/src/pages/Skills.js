import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiStar, FiUser, FiMessageSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    rating: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkills();
  }, [searchQuery, filters]);

  const fetchSkills = async () => {
    try {
      // Replace with your API call
      const response = await fetch('/api/skills?' + new URLSearchParams({
        search: searchQuery,
        ...filters,
      }));
      const data = await response.json();
      setSkills(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setLoading(false);
    }
  };

  const categories = [
    'Programming',
    'Design',
    'Music',
    'Language',
    'Business',
    'All',
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'All'];

  const handleSkillClick = (skillId) => {
    navigate(`/skills/${skillId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="relative flex-1 mb-4 md:mb-0">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-4">
              <select
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              >
                <option value="">Difficulty</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <motion.div
                key={skill._id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                onClick={() => handleSkillClick(skill._id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      skill.difficulty === 'Beginner'
                        ? 'bg-green-100 text-green-800'
                        : skill.difficulty === 'Intermediate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {skill.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{skill.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiUser className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">{skill.users} users</span>
                    </div>
                    <div className="flex items-center">
                      <FiStar className="text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-500">{skill.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <img
                        src={skill.instructor.avatar}
                        alt={skill.instructor.name}
                        className="h-8 w-8 rounded-full"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {skill.instructor.name}
                      </span>
                    </div>
                    <button className="flex items-center text-indigo-600 hover:text-indigo-500">
                      <FiMessageSquare className="mr-1" />
                      <span className="text-sm">Chat</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills; 