import React, { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const SkillsSection = () => {
  const { user, updateProfile } = useAuth();
  const [newSkill, setNewSkill] = useState('');
  const [newSkillNeeded, setNewSkillNeeded] = useState('');
  const [loading, setLoading] = useState(false);

  // Convert skills array to the correct format
  const skillsOffering = user?.skills?.filter(skill => skill.status === 'teaching') || [];
  const skillsNeeded = user?.skills?.filter(skill => skill.status === 'learning') || [];

  const handleAddSkill = async (type) => {
    if (!newSkill && !newSkillNeeded) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('email', user.email);
      formData.append('location', user.location);
      formData.append('bio', user.bio);

      // Get all existing skills
      const existingSkills = user.skills || [];

      if (type === 'offering') {
        const updatedSkills = [...existingSkills, {
          skill: newSkill,
          status: 'teaching',
          description: '',
          rating: 0
        }];
        formData.append('skills', JSON.stringify(updatedSkills));
      } else {
        const updatedSkills = [...existingSkills, {
          skill: newSkillNeeded,
          status: 'learning',
          description: '',
          rating: 0
        }];
        formData.append('skills', JSON.stringify(updatedSkills));
      }

      await updateProfile(formData);
      toast.success(`Skill ${type === 'offering' ? 'offering' : 'needed'} added successfully`);
      setNewSkill('');
      setNewSkillNeeded('');
    } catch (error) {
      toast.error(error.message || 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove, type) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('email', user.email);
      formData.append('location', user.location);
      formData.append('bio', user.bio);

      // Get all existing skills and filter out the one to remove
      const existingSkills = user.skills || [];
      const updatedSkills = existingSkills.filter(s => s.skill !== skillToRemove.skill);
      formData.append('skills', JSON.stringify(updatedSkills));

      await updateProfile(formData);
      toast.success(`Skill removed successfully`);
    } catch (error) {
      toast.error(error.message || 'Failed to remove skill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Skills Offering Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Skills I Can Offer
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {skillsOffering.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
            >
              {skill.skill}
              <button
                onClick={() => handleRemoveSkill(skill, 'offering')}
                disabled={loading}
                className="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-100"
              >
                <FiX className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill you can offer"
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700"
          />
          <button
            onClick={() => handleAddSkill('offering')}
            disabled={loading || !newSkill}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus className="h-5 w-5 mr-2" />
            Add
          </button>
        </div>
      </div>

      {/* Skills Needed Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Skills I Need
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {skillsNeeded.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              {skill.skill}
              <button
                onClick={() => handleRemoveSkill(skill, 'needed')}
                disabled={loading}
                className="ml-2 text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-100"
              >
                <FiX className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkillNeeded}
            onChange={(e) => setNewSkillNeeded(e.target.value)}
            placeholder="Add a skill you need"
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700"
          />
          <button
            onClick={() => handleAddSkill('needed')}
            disabled={loading || !newSkillNeeded}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus className="h-5 w-5 mr-2" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsSection; 