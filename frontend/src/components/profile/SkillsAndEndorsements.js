import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/profileService';
import { toast } from 'react-hot-toast';

const SkillsAndEndorsements = ({ skills, endorsements, onUpdate }) => {
  const { user } = useAuth();
  const [newSkill, setNewSkill] = useState({
    name: '',
    description: '',
    level: 'beginner',
    category: '',
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSkill = (e) => {
    e.preventDefault();
    onUpdate({
      type: 'ADD_SKILL',
      payload: newSkill,
    });
    setNewSkill({
      name: '',
      description: '',
      level: 'beginner',
      category: '',
    });
    setIsAdding(false);
  };

  const handleDeleteSkill = (skillId) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      onUpdate({
        type: 'DELETE_SKILL',
        payload: skillId,
      });
    }
  };

  const handleEndorse = (skillId) => {
    onUpdate({
      type: 'ADD_ENDORSEMENT',
      payload: {
        skill: skillId,
        endorser: user._id,
      },
    });
  };

  const getEndorsementCount = (skillId) => {
    return endorsements.filter((e) => e.skill === skillId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Skills & Endorsements
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Skill
        </button>
      </div>

      {isAdding && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <form onSubmit={handleAddSkill} className="space-y-4">
            <div>
              <label
                htmlFor="skillName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Skill Name
              </label>
              <input
                type="text"
                id="skillName"
                value={newSkill.name}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Category
              </label>
              <input
                type="text"
                id="category"
                value={newSkill.category}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, category: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="level"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Level
              </label>
              <select
                id="level"
                value={newSkill.level}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, level: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <textarea
                id="description"
                value={newSkill.description}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, description: e.target.value })
                }
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Skill
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => (
          <div
            key={skill._id}
            className="relative p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <button
              onClick={() => handleDeleteSkill(skill._id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="space-y-2">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                {skill.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {skill.category}
              </p>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {skill.level}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getEndorsementCount(skill._id)} endorsements
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {skill.description}
              </p>
              <button
                onClick={() => handleEndorse(skill._id)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Endorse
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsAndEndorsements; 