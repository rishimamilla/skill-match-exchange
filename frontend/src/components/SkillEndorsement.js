import React, { useState } from 'react';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import skillAPI from '../api/skillAPI';

const SkillEndorsement = ({ skill, userId, onEndorsementChange }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [endorsed, setEndorsed] = useState(false);

  // Check if the current user has already endorsed this skill
  React.useEffect(() => {
    if (skill && skill.endorsements) {
      const hasEndorsed = skill.endorsements.some(
        endorsement => endorsement.endorser === user._id
      );
      setEndorsed(hasEndorsed);
    }
  }, [skill, user._id]);

  const handleEndorse = async () => {
    if (!user) {
      toast.error('You must be logged in to endorse skills');
      return;
    }

    if (user._id === userId) {
      toast.error('You cannot endorse your own skills');
      return;
    }

    setLoading(true);
    try {
      // This would be implemented in your API
      // For now, we'll just toggle the state
      setEndorsed(!endorsed);
      
      // Simulate API call
      // In a real implementation, you would call your API here
      // const response = await skillAPI.endorseSkill(skill._id, userId);
      
      toast.success(endorsed ? 'Endorsement removed' : 'Skill endorsed successfully');
      
      if (onEndorsementChange) {
        onEndorsementChange(skill._id, !endorsed);
      }
    } catch (error) {
      console.error('Error endorsing skill:', error);
      toast.error(error.message || 'Failed to endorse skill');
      setEndorsed(!endorsed); // Revert the state
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEndorse}
      disabled={loading || user._id === userId}
      className={`flex items-center space-x-1 px-2 py-1 rounded-md text-sm ${
        endorsed
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      } ${
        loading || user._id === userId
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-green-200 dark:hover:bg-green-800'
      }`}
    >
      {endorsed ? (
        <>
          <FiThumbsUp className="h-4 w-4" />
          <span>Endorsed</span>
        </>
      ) : (
        <>
          <FiThumbsUp className="h-4 w-4" />
          <span>Endorse</span>
        </>
      )}
    </button>
  );
};

export default SkillEndorsement; 