import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaStar, FaExchangeAlt, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { skillAPI } from '../api/skillAPI';
import { useAuth } from '../context/AuthContext';
import ProfileImage from './common/ProfileImage';

const SkillMatch = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState({});
  const { user } = useAuth();
  const [isInitiating, setIsInitiating] = useState(false);

  useEffect(() => {
    fetchMatches();
    fetchUserSkills();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await skillAPI.getSkillMatches();
      
      // Process matches to ensure proper profile picture paths
      const processedMatches = response.map(match => {
        if (match.profilePicture) {
          // If it's already a full URL, keep it as is
          if (match.profilePicture.startsWith('http')) {
            // Do nothing, keep the URL as is
          } 
          // If it's just a filename, add the uploads path
          else if (!match.profilePicture.startsWith('/uploads')) {
            match.profilePicture = `/uploads/profiles/${match.profilePicture}`;
          }
        }
        return match;
      });
      
      setMatches(processedMatches);
      setError(null);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
      setError(error.message);
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
      if (prev[selectedMatch]?.includes(skillId)) {
        return {
          ...prev,
          [selectedMatch]: prev[selectedMatch].filter(id => id !== skillId)
        };
      }
      return {
        ...prev,
        [selectedMatch]: [...(prev[selectedMatch] || []), skillId]
      };
    });
  };

  const handleInitiateExchange = async (match) => {
    if (!selectedSkills[match._id]?.length) {
      toast.error('Please select at least one skill to offer');
      return;
    }

    try {
      setIsInitiating(true);
      const data = {
        recipientId: match._id,
        offeredSkillIds: selectedSkills[match._id],
        requestedSkillIds: match.matchingSkills.map(skill => skill._id)
      };

      await skillAPI.initiateExchange(data);
      toast.success('Exchange initiated successfully!');
      
      // Refresh matches to update the UI
      fetchMatches();
    } catch (error) {
      console.error('Error initiating exchange:', error);
      if (error.message.includes('pending exchange')) {
        toast.error(
          <div>
            <p>{error.message}</p>
            <a 
              href="/exchanges" 
              className="text-blue-500 underline mt-2 block"
            >
              View your active exchanges
            </a>
          </div>
        );
      } else {
        toast.error(error.message || 'Failed to initiate exchange');
      }
    } finally {
      setIsInitiating(false);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
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
                <div className="w-16 h-16 flex-shrink-0">
                  <ProfileImage
                    src={match.profilePicture}
                    alt={match.name}
                    size="md"
                    className="rounded-full border-2 border-white shadow-md"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg">{match.name}</h3>
                  <p className="text-gray-500 text-sm">{match.location}</p>
                  {match.compatibility && (
                    <div className="flex items-center mt-1">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">
                        {Math.round(match.compatibility)}% Match
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {match.skills?.map((skill, index) => (
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

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleInitiateExchange(match)}
                  disabled={isInitiating || !selectedSkills[match._id]?.length}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
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
                    {match.matchingTeachingSkills?.length || 0} skills they teach that you need
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <FaExchangeAlt className="text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {match.matchingLearningSkills?.length || 0} skills they need that you teach
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Skills They Teach That You Need:</h4>
                <div className="flex flex-wrap gap-2">
                  {match.matchingTeachingSkills && match.matchingTeachingSkills.length > 0 ? (
                    match.matchingTeachingSkills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs">No matching skills</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mt-3">
                <h4 className="font-medium text-sm text-gray-700">Skills They Need That You Teach:</h4>
                <div className="flex flex-wrap gap-2">
                  {match.matchingLearningSkills && match.matchingLearningSkills.length > 0 ? (
                    match.matchingLearningSkills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs">No matching skills</span>
                  )}
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
                          selectedSkills[match._id]?.includes(skill._id)
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
                onClick={() => handleInitiateExchange(match)}
                disabled={isInitiating || !selectedSkills[match._id]?.length}
                className={`px-4 py-2 rounded-md text-white ${
                  isInitiating || !selectedSkills[match._id]?.length
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isInitiating ? 'Initiating...' : 'Initiate Exchange'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillMatch; 