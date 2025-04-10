import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaStar, FaExchangeAlt, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { skillAPI } from '../api/skillAPI';
import { useAuth } from '../context/AuthContext';

const SkillMatch = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchMatches();
    fetchUserSkills();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await skillAPI.getSkillMatches();
      setMatches(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSkills = async () => {
    try {
      const response = await skillAPI.getAllSkills();
      setUserSkills(response);
    } catch (err) {
      console.error('Error fetching user skills:', err);
    }
  };

  const handleSkillSelection = (skillId) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      }
      return [...prev, skillId];
    });
  };

  const initiateExchange = async (matchId, matchSkills) => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill to offer');
      return;
    }

    try {
      const response = await skillAPI.initiateExchange({
        recipientId: matchId,
        offeredSkillIds: selectedSkills,
        requestedSkillIds: matchSkills.map(skill => skill._id)
      });
      toast.success('Exchange request sent successfully!');
      setSelectedSkills([]);
      fetchMatches(); // Refresh matches
    } catch (err) {
      toast.error(err.message || 'Failed to initiate exchange');
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button 
          onClick={fetchMatches}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Skill Matches</h2>
      
      {matches.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          <p>No matches found. Try adding more skills to your profile!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <motion.div
              key={match._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
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
                    <FaUser className="text-gray-500 text-xl" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{match.name}</h3>
                  <p className="text-gray-500 text-sm">{match.location}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <FaStar className="text-yellow-400 mr-2" />
                  <span className="font-medium">Match Score: </span>
                  <span className={`ml-2 ${getMatchScoreColor(match.matchScore)}`}>
                    {match.matchScore}/10
                  </span>
                </div>
                <div className="flex items-center">
                  <FaExchangeAlt className="text-blue-500 mr-2" />
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
                    .map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {skill.skill}
                      </span>
                    ))}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Select Your Skills to Offer:</h4>
                <div className="flex flex-wrap gap-2">
                  {userSkills
                    .filter(skill => skill.status === 'teaching')
                    .map((skill) => (
                      <button
                        key={skill._id}
                        onClick={() => handleSkillSelection(skill._id)}
                        className={`px-2 py-1 rounded-full text-xs transition-colors ${
                          selectedSkills.includes(skill._id)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {skill.skill}
                      </button>
                    ))}
                </div>
              </div>

              <button
                onClick={() => initiateExchange(match._id, match.skills.filter(s => s.status === 'teaching'))}
                disabled={selectedSkills.length === 0}
                className={`mt-4 w-full py-2 px-4 rounded transition-colors ${
                  selectedSkills.length > 0
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedSkills.length > 0 ? 'Initiate Exchange' : 'Select Skills to Exchange'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillMatch; 