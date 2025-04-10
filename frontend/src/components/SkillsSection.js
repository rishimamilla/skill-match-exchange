import React, { useState, useCallback, useEffect } from 'react';
import { FiPlus, FiX, FiEdit2, FiStar, FiClock, FiTag, FiUsers, FiSearch, FiFilter } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import skillAPI from '../api/skillAPI';
import SkillAutocomplete from './SkillAutocomplete';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  const [offeringSkill, setOfferingSkill] = useState({
    name: '',
    level: 'Beginner',
    yearsOfExperience: '',
    category: 'Other',
    description: '',
    certifications: []
  });
  
  const [neededSkill, setNeededSkill] = useState({
    name: '',
    level: 'Beginner',
    yearsOfExperience: '',
    category: 'Other',
    description: '',
    priority: 'Medium'
  });

  // Convert skills array to the correct format
  const skillsOffering = user?.skills?.filter(skill => skill.status === 'teaching') || [];
  const skillsNeeded = user?.skills?.filter(skill => skill.status === 'learning') || [];

  // Filter skills based on search and category
  const filteredOfferingSkills = skillsOffering.filter(skill => {
    const matchesSearch = skill.skill.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredNeededSkills = skillsNeeded.filter(skill => {
    const matchesSearch = skill.skill.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add a useEffect to log skills when they change
  useEffect(() => {
    console.log('User skills updated:', user?.skills);
    console.log('Offering skills:', skillsOffering);
    console.log('Needed skills:', skillsNeeded);
  }, [user?.skills, skillsOffering, skillsNeeded]);

  // Fetch matches when skills change or filters change
  useEffect(() => {
    if (showMatches) {
      fetchMatches();
    }
  }, [showMatches, matchFilters]);

  // Check if a skill already exists
  const isSkillExists = useCallback((skillName, type) => {
    const existingSkills = type === 'offering' ? skillsOffering : skillsNeeded;
    return existingSkills.some(s => s.skill.toLowerCase() === skillName.toLowerCase());
  }, [skillsOffering, skillsNeeded]);

  // Fetch potential matches
  const fetchMatches = async () => {
    setLoadingMatches(true);
    try {
      const data = await skillAPI.getSkillMatches();
      
      // Apply additional filtering based on user preferences
      const filteredMatches = data.filter(match => {
        // Filter by minimum rating
        if (matchFilters.minRating > 0 && (!match.rating || match.rating < matchFilters.minRating)) {
          return false;
        }
        
        // Filter by skill level if specified
        if (matchFilters.skillLevel !== 'Any') {
          const hasMatchingSkillLevel = match.skills.some(skill => 
            skill.level === matchFilters.skillLevel
          );
          if (!hasMatchingSkillLevel) return false;
        }
        
        // Filter by availability if specified
        if (matchFilters.availability !== 'Any') {
          if (matchFilters.availability === 'Online' && !match.isRemote) {
            return false;
          }
          if (matchFilters.availability === 'In-Person' && match.isRemote) {
            return false;
          }
        }
        
        return true;
      });
      
      setMatches(filteredMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to fetch potential matches');
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
        description: skill.description || '',
        certifications: skill.certifications || []
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

  const handleAddSkill = async (type) => {
    setLoadingOffering(type === 'offering');
    setLoadingNeeded(type === 'needed');
    setError(null);

    try {
      const skillData = type === 'offering' ? offeringSkill : neededSkill;
      
      // Validate required fields
      if (!skillData.name) {
        throw new Error('Please enter a skill name');
      }

      const dataToSend = {
        userId: user._id,
        skill: skillData.name,
        level: skillData.level,
        yearsOfExperience: parseInt(skillData.yearsOfExperience) || 0,
        status: type === 'offering' ? 'teaching' : 'learning',
        category: skillData.category,
        description: skillData.description || '',
        ...(type === 'offering' ? { certifications: skillData.certifications || [] } : { priority: skillData.priority || 'Medium' })
      };

      // Check if this is an update or a new skill
      const isUpdate = skillData._id;
      if (isUpdate) {
        dataToSend._id = skillData._id;
      }
      
      const apiCall = isUpdate ? skillAPI.updateUserSkill : skillAPI.addUserSkill;

      console.log(`${isUpdate ? 'Updating' : 'Adding'} skill:`, dataToSend);
      const response = await apiCall(dataToSend);
      console.log('API response:', response);

      if (response && response.skills) {
        // Update the user state with the complete skills array
        if (typeof setUser === 'function') {
          setUser(prevUser => ({
            ...prevUser,
            skills: response.skills
          }));
        }

        // Update local skills state
        const updatedSkills = response.skills.filter(s => s.status === dataToSend.status);
        if (dataToSend.status === 'teaching') {
          setOfferingSkills(updatedSkills);
        } else {
          setNeededSkills(updatedSkills);
        }

        // Reset form
        if (type === 'offering') {
          setOfferingSkill({
            name: '',
            level: 'Beginner',
            yearsOfExperience: '',
            category: 'Other',
            description: '',
            certifications: []
          });
        } else {
          setNeededSkill({
            name: '',
            level: 'Beginner',
            yearsOfExperience: '',
            category: 'Other',
            description: '',
            priority: 'Medium'
          });
        }

        // Call onSkillsChange if provided
        if (onSkillsChange) {
          onSkillsChange(response.skills);
        }

        toast.success(`Skill ${isUpdate ? 'updated' : 'added'} successfully!`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error handling skill:', err);
      setError(err.message || 'Failed to save skill');
      toast.error(err.message || 'Failed to save skill');
    } finally {
      setLoadingOffering(false);
      setLoadingNeeded(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove, type) => {
    if (!window.confirm(`Are you sure you want to remove "${skillToRemove.skill}" from your ${type === 'offering' ? 'offering' : 'needed'} skills?`)) {
      return;
    }

    setLoadingSkills(prev => ({ ...prev, [skillToRemove._id]: true }));
    
    try {
      const updatedUser = await skillAPI.removeUserSkill(skillToRemove._id);
      
      if (!updatedUser || !updatedUser.skills) {
        throw new Error('Invalid response from server');
      }

      setUser(prevUser => ({
        ...prevUser,
        skills: updatedUser.skills
      }));
      
      if (onSkillsChange) {
        onSkillsChange(updatedUser.skills);
      }
      
      toast.success(`Successfully removed "${skillToRemove.skill}" from your ${type === 'offering' ? 'offering' : 'needed'} skills`);
      
      // Refresh matches if they're being displayed
      if (showMatches) {
        fetchMatches();
      }
    } catch (error) {
      console.error('Error removing skill:', error);
      toast.error(error.message || 'Failed to remove skill. Please try again.');
    } finally {
      setLoadingSkills(prev => ({ ...prev, [skillToRemove._id]: false }));
    }
  };

  const handleSkillSelect = (skill, type) => {
    if (type === 'offering') {
      setOfferingSkill(prev => ({
        ...prev,
        name: skill.name,
        category: skill.category || 'Other'
      }));
    } else {
      setNeededSkill(prev => ({
        ...prev,
        name: skill.name,
        category: skill.category || 'Other'
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

  const initiateExchange = async (matchId, matchSkills) => {
    try {
      // Get the skills the user wants to offer
      const selectedSkills = skillsOffering.map(skill => skill._id);
      
      if (selectedSkills.length === 0) {
        toast.error('Please add skills you want to offer before initiating an exchange');
        return;
      }
      
      // Get the skills the user wants to receive
      const requestedSkills = matchSkills
        .filter(skill => skillsNeeded.some(needed => needed.skill === skill.skill))
        .map(skill => skill._id);
      
      if (requestedSkills.length === 0) {
        toast.error('No matching skills found for exchange');
        return;
      }
      
      console.log('Initiating exchange with:', {
        recipientId: matchId,
        offeredSkillIds: selectedSkills,
        requestedSkillIds: requestedSkills
      });

      const response = await skillAPI.initiateExchange({
        recipientId: matchId,
        offeredSkillIds: selectedSkills,
        requestedSkillIds: requestedSkills
      });
      
      toast.success('Exchange request sent successfully!');
      fetchMatches(); // Refresh matches
    } catch (err) {
      console.error('Exchange error:', err);
      toast.error(err.message || 'Failed to initiate exchange');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Skills Management</h2>
        <button
          onClick={() => setShowMatches(!showMatches)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FiUsers className="mr-2" />
          {showMatches ? 'Hide Matches' : 'Find Matches'}
        </button>
      </div>

      {showMatches && (
        <div className="mb-8 border-b pb-6">
          <h3 className="text-xl font-semibold mb-4">Skill Matches</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
              <select
                name="minRating"
                value={matchFilters.minRating}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value={0}>Any</option>
                <option value={3}>3+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
              <select
                name="skillLevel"
                value={matchFilters.skillLevel}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="Any">Any</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                name="availability"
                value={matchFilters.availability}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="Any">Any</option>
                <option value="Online">Online Only</option>
                <option value="In-Person">In-Person Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
              <button
                onClick={fetchMatches}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                <FiSearch className="inline mr-2" />
                Refresh
              </button>
            </div>
          </div>
          
          {loadingMatches ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-500">
                Try adding more skills to your profile or adjusting your filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <motion.div
                  key={match._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      {match.profilePicture ? (
                        <img 
                          src={match.profilePicture} 
                          alt={match.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <FiUsers className="text-gray-500 text-xl" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{match.name}</h3>
                      <p className="text-gray-500 text-sm">{match.location || 'Location not specified'}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <FiStar className="text-yellow-400 mr-2" />
                      <span className="font-medium">Match Score: </span>
                      <span className={`ml-2 ${getMatchScoreColor(match.matchScore)}`}>
                        {match.matchScore}/10
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FiTag className="text-blue-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        {match.skills.filter(s => s.status === 'teaching').length} skills to teach
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Teaching Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {match.skills
                        .filter(s => s.status === 'teaching')
                        .slice(0, 3)
                        .map((skill, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {skill.skill}
                          </span>
                        ))}
                      {match.skills.filter(s => s.status === 'teaching').length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          +{match.skills.filter(s => s.status === 'teaching').length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => initiateExchange(match._id, match.skills.filter(s => s.status === 'teaching'))}
                    className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                  >
                    Initiate Exchange
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Skills Offering Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Skills I'm Offering</h3>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2"
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
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <input
                type="text"
                placeholder="Skill name"
                value={offeringSkill.name}
                onChange={(e) => setOfferingSkill({ ...offeringSkill, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={offeringSkill.level}
                  onChange={(e) => setOfferingSkill({ ...offeringSkill, level: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={offeringSkill.yearsOfExperience}
                  onChange={(e) => setOfferingSkill({ ...offeringSkill, yearsOfExperience: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={offeringSkill.category}
                  onChange={(e) => setOfferingSkill({ ...offeringSkill, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Business">Business</option>
                  <option value="Language">Language</option>
                  <option value="Music">Music</option>
                  <option value="Art">Art</option>
                  <option value="Sports">Sports</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief description"
                  value={offeringSkill.description}
                  onChange={(e) => setOfferingSkill({ ...offeringSkill, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <button
              onClick={() => handleAddSkill('offering')}
              disabled={loadingOffering}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loadingOffering ? (
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
          
          <div className="space-y-2">
            {filteredOfferingSkills.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No skills added yet</p>
            ) : (
              filteredOfferingSkills.map((skill) => (
                <div
                  key={skill._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div>
                    <h4 className="font-medium">{skill.skill}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">{skill.level}</span>
                      <span className="mr-2">•</span>
                      <span>{skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleEditSkill(skill, 'offering')}
                      className="p-1 text-gray-500 hover:text-blue-500"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleRemoveSkill(skill, 'offering')}
                      disabled={loadingSkills[skill._id]}
                      className="p-1 text-gray-500 hover:text-red-500 ml-2"
                    >
                      {loadingSkills[skill._id] ? (
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
        <div>
          <h3 className="text-xl font-semibold mb-4">Skills I Need</h3>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <input
                type="text"
                placeholder="Skill name"
                value={neededSkill.name}
                onChange={(e) => setNeededSkill({ ...neededSkill, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={neededSkill.level}
                  onChange={(e) => setNeededSkill({ ...neededSkill, level: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={neededSkill.yearsOfExperience}
                  onChange={(e) => setNeededSkill({ ...neededSkill, yearsOfExperience: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={neededSkill.category}
                  onChange={(e) => setNeededSkill({ ...neededSkill, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Business">Business</option>
                  <option value="Language">Language</option>
                  <option value="Music">Music</option>
                  <option value="Art">Art</option>
                  <option value="Sports">Sports</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={neededSkill.priority}
                  onChange={(e) => setNeededSkill({ ...neededSkill, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={() => handleAddSkill('needed')}
              disabled={loadingNeeded}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loadingNeeded ? (
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
          
          <div className="space-y-2">
            {filteredNeededSkills.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No skills added yet</p>
            ) : (
              filteredNeededSkills.map((skill) => (
                <div
                  key={skill._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div>
                    <h4 className="font-medium">{skill.skill}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">{skill.level}</span>
                      <span className="mr-2">•</span>
                      <span>{skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'}</span>
                      {skill.priority && (
                        <>
                          <span className="mr-2">•</span>
                          <span className={`${
                            skill.priority === 'High' ? 'text-red-500' :
                            skill.priority === 'Medium' ? 'text-yellow-500' :
                            'text-green-500'
                          }`}>
                            {skill.priority} Priority
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleEditSkill(skill, 'needed')}
                      className="p-1 text-gray-500 hover:text-blue-500"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleRemoveSkill(skill, 'needed')}
                      disabled={loadingSkills[skill._id]}
                      className="p-1 text-gray-500 hover:text-red-500 ml-2"
                    >
                      {loadingSkills[skill._id] ? (
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
    </div>
  );
};

export default SkillsSection; 