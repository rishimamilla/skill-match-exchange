import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/authAPI';

const SkillsAndEndorsements = ({ skills, endorsements, onUpdate }) => {
  const { user, setUser } = useAuth();
  const [newSkillName, setNewSkillName] = useState('');
  const [skillType, setSkillType] = useState('learning');

  const handleAddSkill = (e) => {
    e.preventDefault();
    const newSkill = {
      skill: newSkillName,
      status: skillType,
      rating: 0,
      endorsements: [],
    };

    const updatedSkills = [...skills, newSkill];
    onUpdate(updatedSkills);
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = skills.filter(skill => skill.skill !== skillToRemove.skill);
    onUpdate(updatedSkills);
  };

  const teachingSkills = skills.filter(skill => skill.status === 'teaching');
  const learningSkills = skills.filter(skill => skill.status === 'learning');

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Skills & Endorsements</h2>
      
      {/* Add New Skill Form */}
      <form onSubmit={handleAddSkill} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Enter skill name"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <select
            value={skillType}
            onChange={(e) => setSkillType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="learning">Learning</option>
            <option value="teaching">Teaching</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add Skill
          </button>
        </div>
      </form>

      {/* Skills Lists */}
      <div className="space-y-6">
        {/* Teaching Skills */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Teaching</h3>
          <div className="space-y-2">
            {teachingSkills.map((skill) => (
              <div
                key={skill.skill}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span>{skill.skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Skills */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Learning</h3>
          <div className="space-y-2">
            {learningSkills.map((skill) => (
              <div
                key={skill.skill}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span>{skill.skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsAndEndorsements; 