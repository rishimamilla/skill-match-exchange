import React, { useState, useCallback, useEffect } from 'react';
import { FiPlus, FiX, FiEdit2, FiStar, FiClock, FiTag } from 'react-icons/fi';
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
  
  const [offeringSkill, setOfferingSkill] = useState({
    name: '',
    level: 'Beginner',
    yearsOfExperience: 1,
    category: 'Other',
    description: '',
    certifications: []
  });
  
  const [neededSkill, setNeededSkill] = useState({
    name: '',
    level: 'Beginner',
    yearsOfExperience: 1,
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

  // Check if a skill already exists
  const isSkillExists = useCallback((skillName, type) => {
    const existingSkills = type === 'offering' ? skillsOffering : skillsNeeded;
    return existingSkills.some(s => s.skill.toLowerCase() === skillName.toLowerCase());
  }, [skillsOffering, skillsNeeded]);

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
    const skillData = type === 'offering' ? offeringSkill : neededSkill;
    const setLoading = type === 'offering' ? setLoadingOffering : setLoadingNeeded;
    
    if (!skillData.name.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    if (isSkillExists(skillData.name, type) && !editingSkill) {
      toast.error(`You already have "${skillData.name}" in your ${type === 'offering' ? 'offering' : 'needed'} skills`);
      return;
    }

    setLoading(true);
    
    try {
      const dataToSend = {
        userId: user._id,
        skill: skillData.name,
        level: skillData.level,
        yearsOfExperience: skillData.yearsOfExperience,
        status: type === 'offering' ? 'teaching' : 'learning',
        category: skillData.category,
        description: skillData.description,
        ...(type === 'offering' ? { certifications: skillData.certifications } : { priority: skillData.priority }),
        ...(editingSkill && { _id: editingSkill._id })
      };

      const updatedUser = editingSkill 
        ? await skillAPI.updateUserSkill(dataToSend)
        : await skillAPI.addUserSkill(dataToSend);
      
      if (!updatedUser || !updatedUser.skills) {
        throw new Error('Invalid response from server');
      }

      if (typeof setUser === 'function') {
        setUser(prevUser => ({
          ...prevUser,
          skills: updatedUser.skills
        }));
      }
      
      if (onSkillsChange) {
        onSkillsChange(updatedUser.skills);
      }
      
      // Reset form
      if (type === 'offering') {
        setOfferingSkill({
          name: '',
          level: 'Beginner',
          yearsOfExperience: 1,
          category: 'Other',
          description: '',
          certifications: []
        });
      } else {
        setNeededSkill({
          name: '',
          level: 'Beginner',
          yearsOfExperience: 1,
          category: 'Other',
          description: '',
          priority: 'Medium'
        });
      }
      
      setEditingSkill(null);
      toast.success(`Successfully ${editingSkill ? 'updated' : 'added'} "${skillData.name}" to your ${type === 'offering' ? 'offering' : 'needed'} skills`);
    } catch (error) {
      console.error('Error managing skill:', error);
      toast.error(error.message || `Failed to ${editingSkill ? 'update' : 'add'} skill. Please try again.`);
    } finally {
      setLoading(false);
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

  const renderSkillCard = (skill, type) => (
    <motion.div
      key={skill._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{skill.skill}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              <FiTag className="inline mr-1" />
              {skill.category}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              <FiStar className="inline mr-1" />
              {skill.level}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              <FiClock className="inline mr-1" />
              {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'}
            </span>
          </div>
          {skill.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{skill.description}</p>
          )}
          {type === 'offering' && skill.certifications?.length > 0 && (
            <div className="mt-2">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Certifications:</h5>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                {skill.certifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
          {type === 'needed' && skill.priority && (
            <div className="mt-2">
              <span className={`text-sm px-2 py-1 rounded ${
                skill.priority === 'High' ? 'bg-red-100 text-red-800' :
                skill.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                Priority: {skill.priority}
              </span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditSkill(skill, type)}
            className="p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
            disabled={loadingSkills[skill._id]}
          >
            <FiEdit2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleRemoveSkill(skill, type)}
            className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            disabled={loadingSkills[skill._id]}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search skills..."
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

      {/* Skills Offering Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Skills I Can Offer
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <AnimatePresence>
            {filteredOfferingSkills.map(skill => renderSkillCard(skill, 'offering'))}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SkillAutocomplete
                value={offeringSkill.name}
                onChange={(value) => setOfferingSkill(prev => ({ ...prev, name: value }))}
                onSelect={(skill) => handleSkillSelect(skill, 'offering')}
                placeholder="Enter skill name"
                disabled={loadingOffering}
              />
            </div>
            <select
              value={offeringSkill.level}
              onChange={(e) => setOfferingSkill(prev => ({ ...prev, level: e.target.value }))}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loadingOffering}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <input
              type="number"
              value={offeringSkill.yearsOfExperience}
              onChange={(e) => setOfferingSkill(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 1 }))}
              min="1"
              className="w-24 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loadingOffering}
            />
            <select
              value={offeringSkill.category}
              onChange={(e) => setOfferingSkill(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loadingOffering}
            >
              {skillCategories.filter(cat => cat !== 'All').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-4">
            <textarea
              value={offeringSkill.description}
              onChange={(e) => setOfferingSkill(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add a description of your expertise in this skill..."
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="3"
              disabled={loadingOffering}
            />
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleAddSkill('offering')}
                disabled={loadingOffering}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingOffering ? 'Adding...' : editingSkill ? 'Update Skill' : 'Add Skill'}
              </button>
              {editingSkill && (
                <button
                  onClick={() => {
                    setEditingSkill(null);
                    setOfferingSkill({
                      name: '',
                      level: 'Beginner',
                      yearsOfExperience: 1,
                      category: 'Other',
                      description: '',
                      certifications: []
                    });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Needed Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Skills I Want to Learn
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <AnimatePresence>
            {filteredNeededSkills.map(skill => renderSkillCard(skill, 'needed'))}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SkillAutocomplete
                value={neededSkill.name}
                onChange={(value) => setNeededSkill(prev => ({ ...prev, name: value }))}
                onSelect={(skill) => handleSkillSelect(skill, 'needed')}
                placeholder="Enter skill name"
                disabled={loadingNeeded}
              />
            </div>
            <select
              value={neededSkill.level}
              onChange={(e) => setNeededSkill(prev => ({ ...prev, level: e.target.value }))}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loadingNeeded}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <input
              type="number"
              value={neededSkill.yearsOfExperience}
              onChange={(e) => setNeededSkill(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 1 }))}
              min="1"
              className="w-24 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loadingNeeded}
            />
            <select
              value={neededSkill.category}
              onChange={(e) => setNeededSkill(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loadingNeeded}
            >
              {skillCategories.filter(cat => cat !== 'All').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-4">
            <textarea
              value={neededSkill.description}
              onChange={(e) => setNeededSkill(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what you want to learn about this skill..."
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="3"
              disabled={loadingNeeded}
            />
            
            <select
              value={neededSkill.priority}
              onChange={(e) => setNeededSkill(prev => ({ ...prev, priority: e.target.value }))}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loadingNeeded}
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleAddSkill('needed')}
                disabled={loadingNeeded}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingNeeded ? 'Adding...' : editingSkill ? 'Update Skill' : 'Add Skill'}
              </button>
              {editingSkill && (
                <button
                  onClick={() => {
                    setEditingSkill(null);
                    setNeededSkill({
                      name: '',
                      level: 'Beginner',
                      yearsOfExperience: 1,
                      category: 'Other',
                      description: '',
                      priority: 'Medium'
                    });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsSection; 