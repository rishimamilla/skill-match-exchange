import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiFilter, FiUser, FiStar, FiMessageSquare, FiBook, FiBriefcase, FiGlobe } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProfileImage from './common/ProfileImage';

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
      console.log('Starting to fetch matches...');
      
      // First check if we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Please login to view matches');
        return;
      }
      console.log('Token found, making API request...');

      // Make the API request
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/skills/matches`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', response.headers);
      console.log('Raw matches data:', JSON.stringify(response.data, null, 2));
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response data format:', response.data);
        toast.error('Invalid response from server');
        return;
      }

      // Process matches to ensure proper profile picture paths
      const processedMatches = response.data.map(match => {
        console.log('Processing match:', JSON.stringify(match, null, 2));
        
        // Check if match has required data
        if (!match.user) {
          console.error('Match missing user data:', match);
          return null;
        }

        // Process profile picture
        if (match.user.profilePicture) {
          if (match.user.profilePicture.startsWith('http')) {
            console.log('Profile picture is already a full URL');
          } else if (!match.user.profilePicture.startsWith('/uploads')) {
            match.user.profilePicture = `${process.env.REACT_APP_API_URL.replace('/api', '')}/uploads/profiles/${match.user.profilePicture}`;
            console.log('Updated profile picture path:', match.user.profilePicture);
          }
        }

        // Ensure all required fields exist
        return {
          user: {
            _id: match.user._id,
            name: match.user.name || 'Unknown User',
            location: match.user.location || 'Location not specified',
            profilePicture: match.user.profilePicture || '/default-avatar.png',
            bio: match.user.bio,
            education: match.user.education,
            workExperience: match.user.workExperience,
            languages: match.user.languages || [],
            certifications: match.user.certifications || []
          },
          compatibility: match.compatibility || 0,
          matchDetails: {
            teachingMatches: match.matchDetails?.teachingMatches || [],
            learningMatches: match.matchDetails?.learningMatches || []
          }
        };
      }).filter(match => match !== null); // Remove any null matches
      
      console.log('Processed matches:', JSON.stringify(processedMatches, null, 2));
      setMatches(processedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Please login to view matches');
      } else if (error.response?.status === 404) {
        toast.error('No matches found');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load potential matches');
      }
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
                         match.matchDetails.teachingMatches.some(skill => skill.skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || 
                          match.matchDetails.teachingMatches.some(skill => skill.skill.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(matches.flatMap(match => 
    match.matchDetails.teachingMatches.map(skill => skill.skill.category)
  ))];

  return (
    <div className="container mx-auto px-4 py-8">
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
            {filteredMatches.map((match) => {
              console.log('Rendering match card with data:', JSON.stringify(match, null, 2));
              return (
                <div
                  key={match.user._id}
                  className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  {/* User Basic Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 flex-shrink-0">
                        <ProfileImage
                          src={match.user.profilePicture}
                          alt={match.user.name}
                          size="md"
                          className="rounded-full border-2 border-white shadow-md"
                          onError={(e) => {
                            console.log('Profile image error:', e);
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {match.user.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {match.user.location}
                        </p>
                        <div className="flex items-center mt-1">
                          <FiStar className="text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">
                            {Math.round(match.compatibility || 0)}% Match
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="mt-4 space-y-3">
                    {match.user.bio && (
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p className="font-medium mb-1">About</p>
                        <p className="line-clamp-2">{match.user.bio}</p>
                      </div>
                    )}

                    {match.user.education && (
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p className="font-medium mb-1">Education</p>
                        <p>{match.user.education}</p>
                      </div>
                    )}

                    {match.user.workExperience && (
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p className="font-medium mb-1">Work Experience</p>
                        <p>{match.user.workExperience}</p>
                      </div>
                    )}

                    {match.user.languages?.length > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p className="font-medium mb-1">Languages</p>
                        <p>{match.user.languages.join(', ')}</p>
                      </div>
                    )}

                    {match.user.certifications?.length > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p className="font-medium mb-1">Certifications</p>
                        <p>{match.user.certifications.join(', ')}</p>
                      </div>
                    )}
                  </div>

                  {/* Skills Section */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</h4>
                    <div className="space-y-3">
                      {/* Teaching Skills */}
                      {match.matchDetails.teachingMatches.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">Can Teach:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {match.matchDetails.teachingMatches.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {skill.skill}
                                {skill.matchLevel && (
                                  <span className="ml-1 text-green-600">• {skill.matchLevel}</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Learning Skills */}
                      {match.matchDetails.learningMatches.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Wants to Learn:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {match.matchDetails.learningMatches.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {skill.skill}
                                {skill.priority && (
                                  <span className="ml-1 text-blue-600">• {skill.priority}</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => handleInitiateExchange(match.user._id, match.matchDetails.teachingMatches)}
                      disabled={selectedSkills.length === 0}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiMessageSquare className="mr-2" />
                      Start Exchange
                    </button>
                  </div>
                </div>
              );
            })}
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
    </div>
  );
};

export default SkillMatchFinder; 