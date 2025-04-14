import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import exchangeAPI from '../api/exchangeAPI';
import skillAPI from '../api/skillAPI';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';

const NewExchange = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState({
    teaching: [],
    learning: []
  });
  const [availableSkills, setAvailableSkills] = useState({
    teaching: [],
    learning: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch other user's data
        const userData = await skillAPI.getUserProfile(userId);
        setOtherUser(userData);

        // Get available skills for exchange
        const teachingSkills = userData.skills?.filter(s => s.status === 'teaching') || [];
        const learningSkills = userData.skills?.filter(s => s.status === 'learning') || [];

        setAvailableSkills({
          teaching: teachingSkills,
          learning: learningSkills
        });
      } catch (err) {
        setError(err.message || 'Failed to load data');
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleSkillSelect = (skill, type) => {
    setSelectedSkills(prev => ({
      ...prev,
      [type]: [...prev[type], skill]
    }));
  };

  const handleSkillRemove = (skill, type) => {
    setSelectedSkills(prev => ({
      ...prev,
      [type]: prev[type].filter(s => s.skill !== skill.skill)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedSkills.teaching.length === 0 || selectedSkills.learning.length === 0) {
        toast.error('Please select at least one skill for teaching and learning');
        return;
      }

      const exchangeData = {
        participants: [currentUser._id, userId],
        skills: {
          teaching: selectedSkills.teaching.map(s => s.skill),
          learning: selectedSkills.learning.map(s => s.skill)
        },
        status: 'pending'
      };

      await exchangeAPI.createExchange(exchangeData);
      toast.success('Exchange request sent successfully');
      navigate('/exchanges');
    } catch (err) {
      toast.error(err.message || 'Failed to create exchange');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !otherUser) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {error || 'User Not Found'}
          </h2>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <FiArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Exchange with {otherUser.name}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Teaching Skills Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-4">
              Select Skills You Will Teach
            </h2>
            <div className="space-y-3">
              {availableSkills.teaching.map(skill => (
                <div key={skill.skill} className="flex items-center justify-between bg-white p-3 rounded">
                  <div>
                    <span className="font-medium">{skill.skill}</span>
                    <span className="text-sm text-gray-600 ml-2">({skill.level})</span>
                  </div>
                  {selectedSkills.teaching.some(s => s.skill === skill.skill) ? (
                    <button
                      type="button"
                      onClick={() => handleSkillRemove(skill, 'teaching')}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <FiX />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSkillSelect(skill, 'teaching')}
                      className="p-2 text-green-500 hover:bg-green-50 rounded-full"
                    >
                      <FiCheck />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Learning Skills Section */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800 mb-4">
              Select Skills You Want to Learn
            </h2>
            <div className="space-y-3">
              {availableSkills.learning.map(skill => (
                <div key={skill.skill} className="flex items-center justify-between bg-white p-3 rounded">
                  <div>
                    <span className="font-medium">{skill.skill}</span>
                    <span className="text-sm text-gray-600 ml-2">({skill.level})</span>
                  </div>
                  {selectedSkills.learning.some(s => s.skill === skill.skill) ? (
                    <button
                      type="button"
                      onClick={() => handleSkillRemove(skill, 'learning')}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <FiX />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSkillSelect(skill, 'learning')}
                      className="p-2 text-green-500 hover:bg-green-50 rounded-full"
                    >
                      <FiCheck />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Skills Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Selected Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-blue-800 mb-2">Teaching:</h3>
                <ul className="space-y-1">
                  {selectedSkills.teaching.map(skill => (
                    <li key={skill.skill} className="flex items-center">
                      <span className="text-sm">{skill.skill}</span>
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skill, 'teaching')}
                        className="ml-2 text-red-500 hover:text-red-600"
                      >
                        <FiX size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-green-800 mb-2">Learning:</h3>
                <ul className="space-y-1">
                  {selectedSkills.learning.map(skill => (
                    <li key={skill.skill} className="flex items-center">
                      <span className="text-sm">{skill.skill}</span>
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skill, 'learning')}
                        className="ml-2 text-red-500 hover:text-red-600"
                      >
                        <FiX size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Exchange
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewExchange; 