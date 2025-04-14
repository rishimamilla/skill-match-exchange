import React, { useState, useCallback, useEffect } from 'react';
import { FiPlus, FiX, FiEdit2, FiStar, FiClock, FiTag, FiUsers, FiSearch, FiFilter, FiMessageSquare, FiUser, FiRefreshCw, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import skillAPI from '../api/skillAPI';
import SkillAutocomplete from './SkillAutocomplete';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { validateSkillName, isDuplicateSkill, validateSkillData, sanitizeSkillData } from '../utils/skillValidation';
import { Card, CardContent, Avatar, Typography, Chip, Button, Box, Tooltip } from '@mui/material';
import { Star as StarIcon, Message as MessageIcon, Person as PersonIcon, Verified as VerifiedIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import userAPI from '../api/userAPI';
import Chat from './Chat';
import SkillMatchDetails from './SkillMatchDetails';
import ProfileImage from './common/ProfileImage';
import ReactDOM from 'react-dom';

// Add axios default baseURL
axios.defaults.baseURL = 'http://localhost:5000';

const styles = {
  matchCard: {
    marginBottom: '16px',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
  },
  avatar: {
    width: 56,
    height: 56,
  },
  skillChip: {
    margin: '4px',
    backgroundColor: '#F5F5F5',
    '&:hover': {
      backgroundColor: '#E0E0E0',
    },
  },
  actionButton: {
    marginLeft: '8px',
    minWidth: '100px',
  },
  bio: {
    color: '#666',
    fontSize: '0.9rem',
    lineHeight: '1.4',
    marginTop: '8px',
  },
  matchInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  skillsContainer: {
    marginTop: '16px',
    marginBottom: '16px',
    '& > div': {
      marginBottom: '12px',
    },
  },
  skillsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  },
  matchScore: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
  },
  matchIndicators: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '16px',
  },
};

const SkillsSection = ({ onSkillsChange }) => {
  const { user, setUser } = useAuth();
  const [loadingOffering, setLoadingOffering] = useState(false);
  const [loadingNeeded, setLoadingNeeded] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState({});
  const [editingSkill, setEditingSkill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchFilters, setMatchFilters] = useState({
    minRating: 0,
    maxDistance: 100,
    skillLevel: 'Any',
    availability: 'Any'
  });
  const [showMatches, setShowMatches] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offeringSkills, setOfferingSkills] = useState([]);
  const [neededSkills, setNeededSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  
  const [offeringSkill, setOfferingSkill] = useState({
    name: '',
    level: 'Beginner',
    yearsOfExperience: 0,
    category: 'Programming',
    description: ''
  });
  
  const [neededSkill, setNeededSkill] = useState({
    name: '',
    level: 'Beginner',
    yearsOfExperience: 0,
    category: 'Programming',
    description: '',
    priority: 'Medium'
  });

  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const [pendingExchanges, setPendingExchanges] = useState([]);
  const [loadingExchanges, setLoadingExchanges] = useState(false);
  const [exchangeError, setExchangeError] = useState(null);
  const [showExchangeForm, setShowExchangeForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [exchangeDetails, setExchangeDetails] = useState({
    duration: '1 month',
    frequency: 'weekly',
    preferredTime: '',
    notes: ''
  });

  // Add useEffect to handle state updates
  useEffect(() => {
    console.log('State updated:', {
      showExchangeForm,
      selectedMatch,
      exchangeDetails
    });
  }, [showExchangeForm, selectedMatch, exchangeDetails]);

  // Update skills when user changes
  useEffect(() => {
    if (user && user.skills) {
      const offering = user.skills.filter(skill => skill.status === 'teaching');
      const needed = user.skills.filter(skill => skill.status === 'learning');
      setOfferingSkills(offering);
      setNeededSkills(needed);
      setUserSkills(user.skills);
    }
  }, [user]);

  // Filter skills based on search and category
  const filteredOfferingSkills = offeringSkills.filter(skill => {
    const matchesSearch = skill.skill.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredNeededSkills = neededSkills.filter(skill => {
    const matchesSearch = skill.skill.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Fetch matches when skills change or filters change
  useEffect(() => {
    if (showMatches) {
      fetchMatches();
    }
  }, [showMatches, matchFilters]);

  // Fetch potential matches
  const fetchMatches = async () => {
    try {
      setLoadingMatches(true);
      const response = await axios.get('/api/skills/matches', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Process matches to ensure proper profile picture paths and skill structure
      const processedMatches = response.data.map(match => {
        // Process profile picture with caching
        if (match.user && match.user.profilePicture) {
          if (match.user.profilePicture.startsWith('http')) {
            // Keep full URLs as is
          } else if (!match.user.profilePicture.startsWith('/uploads')) {
            // Add cache-busting parameter to prevent 429 errors
            const timestamp = new Date().getTime();
            match.user.profilePicture = `/uploads/profiles/${match.user.profilePicture}?t=${timestamp}`;
          }
        }

        // Process matching skills
        if (match.matchingSkills) {
          // Split skills into teaching and learning
          const teachingSkills = match.matchingSkills.filter(skill => 
            skill.status === 'teaching' || skill.status === 'offering'
          );
          const learningSkills = match.matchingSkills.filter(skill => 
            skill.status === 'learning' || skill.status === 'needed'
          );

          // Ensure each skill has required properties
          const processSkills = skills => skills.map(skill => ({
            ...skill,
            _id: skill._id || skill.id || skill.skillId,
            name: skill.name || skill.skill || 'Unnamed Skill',
            user: skill.user || match.user._id
          }));

          match.matchingTeachingSkills = processSkills(teachingSkills);
          match.matchingLearningSkills = processSkills(learningSkills);
          match.matchScore = (teachingSkills.length + learningSkills.length) / 9; // Assuming max 9 skills
        } else {
          match.matchingTeachingSkills = [];
          match.matchingLearningSkills = [];
          match.matchScore = 0;
        }

        return match;
      });
      
      console.log('Processed matches:', processedMatches); // Debug log
      setMatches(processedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error('Failed to load matches');
      }
    } finally {
      setLoadingMatches(false);
    }
  };

  // Handle skill editing
  const handleEditSkill = (skill, type) => {
    setEditingSkill({ ...skill, type });
    if (type === 'offering') {
      setOfferingSkill({
        name: skill.skill,
        level: skill.level,
        yearsOfExperience: skill.yearsOfExperience,
        category: skill.category,
        description: skill.description || ''
      });
    } else {
      setNeededSkill({
        name: skill.skill,
        level: skill.level,
        yearsOfExperience: skill.yearsOfExperience,
        category: skill.category,
        description: skill.description || '',
        priority: skill.priority || 'Medium'
      });
    }
  };

  // Handle skill addition with validation
  const handleAddSkill = async (type) => {
    try {
      setLoading(true);
      const skill = type === 'offering' ? offeringSkill : neededSkill;
      
      // Validate skill data
      if (!skill.name.trim()) {
        toast.error('Please enter a skill name');
        return;
      }

      // Check for duplicates
      const existingSkills = type === 'offering' ? offeringSkills : neededSkills;
      const isDuplicate = existingSkills.some(s => 
        s.skill.toLowerCase() === skill.name.toLowerCase() &&
        (!editingSkill || s.skill !== editingSkill.skill)
      );

      if (isDuplicate) {
        toast.error('This skill already exists in your list');
        return;
      }

      let response;
      if (editingSkill && editingSkill.type === type) {
        // Update existing skill
        response = await skillAPI.updateUserSkill(editingSkill.skill, {
          ...skill,
          status: type === 'offering' ? 'teaching' : 'learning'
        });
      } else {
        // Add new skill
        response = await skillAPI.addUserSkill({
          ...skill,
          status: type === 'offering' ? 'teaching' : 'learning'
        });
      }

      if (response.success) {
        // Update local state
        if (type === 'offering') {
          if (editingSkill && editingSkill.type === 'offering') {
            setOfferingSkills(prev => 
              prev.map(s => s.skill === editingSkill.skill ? response.skill : s)
            );
          } else {
            setOfferingSkills(prev => [...prev, response.skill]);
          }
          setOfferingSkill({
            name: '',
            level: 'Beginner',
            yearsOfExperience: 0,
            category: 'Programming',
            description: ''
          });
        } else {
          if (editingSkill && editingSkill.type === 'needed') {
            setNeededSkills(prev => 
              prev.map(s => s.skill === editingSkill.skill ? response.skill : s)
            );
          } else {
            setNeededSkills(prev => [...prev, response.skill]);
          }
          setNeededSkill({
            name: '',
            level: 'Beginner',
            yearsOfExperience: 0,
            category: 'Programming',
            description: '',
            priority: 'Medium'
          });
        }
        
        // Update parent component
        onSkillsChange();
        setEditingSkill(null);
        toast.success(editingSkill ? 'Skill updated successfully' : 'Skill added successfully');
      }
    } catch (error) {
      console.error('Error adding/updating skill:', error);
      toast.error(error.message || 'Failed to add/update skill');
    } finally {
      setLoading(false);
    }
  };

  // Handle skill removal with confirmation
  const handleRemoveSkill = async (skill) => {
    try {
      setLoading(true);
      await skillAPI.removeUserSkill(skill.skill);
      
      // Update local state
      if (skill.status === 'teaching') {
        setOfferingSkills(prev => prev.filter(s => s.skill !== skill.skill));
      } else {
        setNeededSkills(prev => prev.filter(s => s.skill !== skill.skill));
      }
      
      toast.success('Skill removed successfully');
      onSkillsChange();
    } catch (error) {
      console.error('Error removing skill:', error);
      toast.error(error.message || 'Failed to remove skill');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillSelect = (skill, type) => {
    if (type === 'offering') {
      setOfferingSkill(prev => ({
        ...prev,
        name: skill.name,
        category: skill.category || 'Programming'
      }));
    } else {
      setNeededSkill(prev => ({
        ...prev,
        name: skill.name,
        category: skill.category || 'Programming'
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setMatchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getMatchScoreColor = (score) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const fetchPendingExchanges = async () => {
    try {
      setLoadingExchanges(true);
      const response = await skillAPI.getExchanges();
      // Filter for pending and active exchanges
      const activeExchanges = response.filter(exchange => 
        exchange.status === 'pending' || exchange.status === 'active'
      );
      setPendingExchanges(activeExchanges);
    } catch (error) {
      console.error('Error fetching pending exchanges:', error);
      toast.error('Failed to load exchange status');
    } finally {
      setLoadingExchanges(false);
    }
  };

  // Add useEffect to fetch pending exchanges on component mount
  useEffect(() => {
    fetchPendingExchanges();
  }, []);

  // Update the match card rendering to show more details
  const renderMatchCard = (match) => {
    console.log('Rendering match card:', { match, pendingExchange: undefined, pendingExchanges, userId: user._id });
    
    const pendingExchange = pendingExchanges.find(
      exchange => 
        (exchange.initiator._id === user._id && exchange.recipient._id === match.user._id) ||
        (exchange.recipient._id === user._id && exchange.initiator._id === match.user._id)
    );

    return (
      <div key={match.user._id} className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start space-x-4">
          {/* Profile Image */}
          <div className="w-16 h-16 flex-shrink-0">
            <img
              src={match.user.profilePicture || '/default-avatar.png'}
              alt={match.user.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-semibold">{match.user.name}</h4>
                <p className="text-gray-500 text-sm">{match.user.location || 'Location not specified'}</p>
              </div>
              {match.matchScore && (
                <div className="flex items-center">
                  <FiStar className="text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">
                    {Math.round(match.matchScore * 100)}% Match
                  </span>
                </div>
              )}
            </div>

            {/* Skills Section */}
            <div className="mt-4">
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Skills I Can Teach</h5>
                <div className="flex flex-wrap gap-2">
                  {match.matchingTeachingSkills?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill.name}
                      {skill.level && (
                        <span className="ml-1 text-blue-600">• {skill.level}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Skills I Want to Learn</h5>
                <div className="flex flex-wrap gap-2">
                  {match.matchingLearningSkills?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {skill.name}
                      {skill.level && (
                        <span className="ml-1 text-green-600">• {skill.level}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => handleContactUser(match.user._id)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiMessageSquare className="mr-2" />
                Contact
              </button>
              {loadingExchanges ? (
                <button
                  disabled
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
                >
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </button>
              ) : pendingExchange ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Viewing exchange:', pendingExchange);
                    setSelectedMatch(match);
                    setShowExchangeForm(true);
                    setExchangeDetails({
                      duration: pendingExchange.duration || '1 month',
                      frequency: pendingExchange.frequency || 'weekly',
                      preferredTime: pendingExchange.preferredTime || '',
                      notes: pendingExchange.notes || ''
                    });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <FiClock className="mr-2" />
                  View Exchange
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Starting exchange with match:', match);
                    handleInitiateExchange(match);
                  }}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center"
                >
                  <FiUserPlus className="mr-2" />
                  Start Exchange
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleInitiateExchange = async (match) => {
    console.log('Starting exchange with:', match);
    
    try {
      setLoading(true);
      
      // Validate match data
      if (!match || !match.user || !match.user._id) {
        console.error('Invalid match data:', match);
        toast.error('Invalid match data');
        return;
      }

      // Check for existing exchanges
      const existingExchange = pendingExchanges.find(
        exchange => 
          (exchange.initiator._id === user._id && exchange.recipient._id === match.user._id) ||
          (exchange.recipient._id === user._id && exchange.initiator._id === match.user._id)
      );

      if (existingExchange) {
        console.log('Existing exchange found:', existingExchange);
        toast.warning('You already have a pending or active exchange with this user');
        return;
      }

      // Set states for the exchange form
      setSelectedMatch(match);
      setExchangeDetails({
        duration: '1 month',
        frequency: 'weekly',
        preferredTime: '',
        notes: ''
      });
      setShowExchangeForm(true);
      
    } catch (error) {
      console.error('Error starting exchange:', error);
      toast.error('Could not start exchange. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExchangeSubmit = async () => {
    try {
      setLoading(true);
      
      if (!selectedMatch || !selectedMatch.user || !selectedMatch.user._id) {
        console.error('Invalid match data:', selectedMatch);
        toast.error('Invalid match data');
        return;
      }

      // Validate exchange details
      if (!exchangeDetails.duration || !exchangeDetails.frequency || !exchangeDetails.preferredTime) {
        console.error('Missing required exchange details:', exchangeDetails);
        toast.error('Please fill in all required fields (Duration, Frequency, and Preferred Time)');
        return;
      }

      // Create exchange data
      const exchangeData = {
        recipientId: selectedMatch.user._id,
        teachingSkills: selectedMatch.matchingTeachingSkills.map(skill => ({
          name: skill.name,
          level: skill.level
        })),
        learningSkills: selectedMatch.matchingLearningSkills.map(skill => ({
          name: skill.name,
          level: skill.level
        })),
        duration: exchangeDetails.duration,
        frequency: exchangeDetails.frequency,
        preferredTime: exchangeDetails.preferredTime,
        notes: exchangeDetails.notes || '',
        status: 'pending'
      };

      console.log('Submitting exchange request:', exchangeData);

      // Create exchange request
      const response = await skillAPI.initiateExchange(exchangeData);
      
      if (!response || !response.data) {
        console.error('Invalid response from server:', response);
        throw new Error('Invalid response from server');
      }

      // Send notification to recipient
      try {
        await skillAPI.sendNotification({
          recipientId: selectedMatch.user._id,
          type: 'exchange_request',
          content: `${user.name} would like to exchange skills with you! They want to learn ${exchangeData.learningSkills.map(s => s.name).join(', ')} and can teach you ${exchangeData.teachingSkills.map(s => s.name).join(', ')}.`,
          exchangeId: response.data._id
        });
        console.log('Notification sent successfully');
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Continue even if notification fails
      }

      // Show success message
      toast.success('Exchange request sent successfully! Waiting for the other user to accept.');
      
      // Close the form and reset states
      setShowExchangeForm(false);
      setSelectedMatch(null);
      setExchangeDetails({
        duration: '1 month',
        frequency: 'weekly',
        preferredTime: '',
        notes: ''
      });
      
      // Refresh exchanges and matches
      await fetchPendingExchanges();
      await fetchMatches();
      
    } catch (error) {
      console.error('Error creating exchange:', error);
      
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('active exchange')) {
          toast.error('You already have an active exchange with this user');
        } else {
          toast.error(error.response?.data?.message || 'Please check your exchange details');
        }
      } else if (error.response?.status === 401) {
        toast.error('Please log in to create an exchange');
      } else if (error.response?.status === 404) {
        toast.error('User not found');
      } else {
        toast.error('Could not create exchange request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update the exchange form modal
  const renderExchangeForm = () => {
    console.log('renderExchangeForm called with states:', {
      showExchangeForm,
      selectedMatch,
      exchangeDetails
    });
    
    if (!showExchangeForm || !selectedMatch) {
      console.log('Form not shown - conditions not met:', {
        showExchangeForm,
        selectedMatch
      });
      return null;
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Exchange Details</h3>
            <button
              onClick={() => {
                console.log('Closing exchange form');
                setShowExchangeForm(false);
                setSelectedMatch(null);
                setExchangeDetails({
                  duration: '1 month',
                  frequency: 'weekly',
                  preferredTime: '',
                  notes: ''
                });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration <span className="text-red-500">*</span></label>
              <select
                value={exchangeDetails.duration}
                onChange={(e) => setExchangeDetails(prev => ({ ...prev, duration: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="1 month">1 Month</option>
                <option value="2 months">2 Months</option>
                <option value="3 months">3 Months</option>
                <option value="6 months">6 Months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Frequency <span className="text-red-500">*</span></label>
              <select
                value={exchangeDetails.frequency}
                onChange={(e) => setExchangeDetails(prev => ({ ...prev, frequency: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Time <span className="text-red-500">*</span></label>
              <select
                value={exchangeDetails.preferredTime}
                onChange={(e) => setExchangeDetails(prev => ({ ...prev, preferredTime: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select a preferred time</option>
                <option value="Morning">Morning (8 AM - 12 PM)</option>
                <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
                <option value="Evening">Evening (5 PM - 9 PM)</option>
                <option value="Weekends">Weekends Only</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea
                value={exchangeDetails.notes}
                onChange={(e) => setExchangeDetails(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any specific requirements or preferences"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="3"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Submitting exchange form');
                handleExchangeSubmit();
              }}
              disabled={loading || !exchangeDetails.duration || !exchangeDetails.frequency || !exchangeDetails.preferredTime}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Exchange'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle contact match
  const handleContactUser = (userId) => {
    setSelectedChat(userId);
  };

  // Handle view profile
  const handleViewProfile = (userId) => {
    // Navigate to user profile page
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header with Match Button */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Skills Management</h2>
        <button
          onClick={() => setShowMatches(true)}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center"
        >
          <FiUsers className="mr-2" />
          Find Matches
        </button>
      </div>

      {showMatches ? (
        <div className="space-y-8">
          {/* Match Filters */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Match Filters</h3>
              <button
                onClick={() => setShowMatches(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Rating
                </label>
                <select
                  value={matchFilters.minRating}
                  onChange={(e) => setMatchFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value={0}>Any</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Level
                </label>
                <select
                  value={matchFilters.skillLevel}
                  onChange={(e) => setMatchFilters(prev => ({ ...prev, skillLevel: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Any">Any Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <select
                  value={matchFilters.availability}
                  onChange={(e) => setMatchFilters(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Any">Any</option>
                  <option value="Weekdays">Weekdays</option>
                  <option value="Weekends">Weekends</option>
                  <option value="Evenings">Evenings</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Distance
                </label>
                <select
                  value={matchFilters.maxDistance}
                  onChange={(e) => setMatchFilters(prev => ({ ...prev, maxDistance: Number(e.target.value) }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value={100}>Any Distance</option>
                  <option value={10}>Within 10km</option>
                  <option value={25}>Within 25km</option>
                  <option value={50}>Within 50km</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={fetchMatches}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center"
              >
                <FiSearch className="mr-2" />
                Apply Filters
              </button>
            </div>
          </div>

          {/* Matches Display */}
          {loadingMatches ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div>
              {matches.length > 0 ? (
                <div className="space-y-6">
                  {matches.map(renderMatchCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No matches found. Try adjusting your filters or adding more skills to your profile.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Skills Offering Section */}
          <div className="space-y-8">
            <div className="flex flex-col space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Skills I'm Offering</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="All">All Categories</option>
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Business">Business</option>
                  <option value="Language">Language</option>
                  <option value="Music">Music</option>
                  <option value="Art">Art</option>
                  <option value="Sports">Sports</option>
                  <option value="Cooking">Cooking</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill</label>
                  <input
                    type="text"
                    placeholder="Enter skill name"
                    value={offeringSkill.name}
                    onChange={(e) => setOfferingSkill(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                    <select
                      value={offeringSkill.level}
                      onChange={(e) => setOfferingSkill(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      value={offeringSkill.yearsOfExperience}
                      onChange={(e) => setOfferingSkill(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    value={offeringSkill.description}
                    onChange={(e) => setOfferingSkill(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of your expertise"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                  />
                </div>
              </div>

              <button
                onClick={() => handleAddSkill('offering')}
                disabled={loading || !offeringSkill.name.trim()}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <FiPlus className="mr-2" />
                    {editingSkill && editingSkill.type === 'offering' ? 'Update Skill' : 'Add Skill'}
                  </span>
                )}
              </button>
            </div>

            <div className="space-y-3">
              {filteredOfferingSkills.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No skills added yet</p>
              ) : (
                filteredOfferingSkills.map((skill) => (
                  <div
                    key={skill.skill}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium text-gray-800">{skill.skill}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{skill.level}</span>
                        <span className="mx-2">•</span>
                        <span>{skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditSkill(skill, 'offering')}
                        className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                        title="Edit skill"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        disabled={loading}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        title="Remove skill"
                      >
                        {loading ? (
                          <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <FiX />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Skills Needed Section */}
          <div className="space-y-8">
            <div className="flex flex-col space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Skills I Need</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="All">All Categories</option>
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Business">Business</option>
                  <option value="Language">Language</option>
                  <option value="Music">Music</option>
                  <option value="Art">Art</option>
                  <option value="Sports">Sports</option>
                  <option value="Cooking">Cooking</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill</label>
                  <input
                    type="text"
                    placeholder="Enter skill name"
                    value={neededSkill.name}
                    onChange={(e) => setNeededSkill(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                    <select
                      value={neededSkill.level}
                      onChange={(e) => setNeededSkill(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      value={neededSkill.yearsOfExperience}
                      onChange={(e) => setNeededSkill(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    value={neededSkill.description}
                    onChange={(e) => setNeededSkill(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of what you want to learn"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                  />
                </div>
              </div>

              <button
                onClick={() => handleAddSkill('needed')}
                disabled={loading || !neededSkill.name.trim()}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <FiPlus className="mr-2" />
                    {editingSkill && editingSkill.type === 'needed' ? 'Update Skill' : 'Add Skill'}
                  </span>
                )}
              </button>
            </div>

            <div className="space-y-3">
              {filteredNeededSkills.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No skills added yet</p>
              ) : (
                filteredNeededSkills.map((skill) => (
                  <div
                    key={skill.skill}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium text-gray-800">{skill.skill}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{skill.level}</span>
                        <span className="mx-2">•</span>
                        <span>{skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditSkill(skill, 'needed')}
                        className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                        title="Edit skill"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        disabled={loading}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        title="Remove skill"
                      >
                        {loading ? (
                          <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <FiX />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] m-4">
            <Chat
              recipientId={selectedChat}
              onClose={() => setSelectedChat(null)}
            />
          </div>
        </div>
      )}

      {renderExchangeForm()}
    </div>
  );
};

export default SkillsSection; 