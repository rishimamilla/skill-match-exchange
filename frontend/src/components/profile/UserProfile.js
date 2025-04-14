import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaGraduationCap, FaTrophy, FaLinkedin, FaGithub, FaTwitter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { skillAPI } from '../../api/skillAPI';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import ProfileImage from '../common/ProfileImage';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isOwnProfile = currentUser && userId === currentUser._id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        setDataLoaded(false);
        setImageError(false);
        
        // Fetch profile data
        const profileData = await skillAPI.getUserProfile(userId);
        console.log('Profile data:', profileData);
        
        // Ensure skills are properly structured
        const formattedProfile = {
          ...profileData,
          skills: profileData.skills || [],
          teachingSkills: profileData.skills?.filter(skill => skill.status === 'teaching') || [],
          learningSkills: profileData.skills?.filter(skill => skill.status === 'learning') || []
        };
        
        setProfile(formattedProfile);
        
        // Only fetch match details if viewing another user's profile
        if (!isOwnProfile) {
          try {
            const matchDetails = await skillAPI.getMatchDetails(userId);
            console.log('Match details:', matchDetails);
            
            // Ensure match data has the expected structure
            const formattedMatchData = {
              ...matchDetails,
              compatibility: matchDetails.compatibility || 0,
              matchQuality: matchDetails.matchQuality || 'Unknown',
              matchStrength: matchDetails.matchStrength || 'Unknown',
              matchingSkills: {
                teaching: matchDetails.matchingSkills?.teaching || [],
                learning: matchDetails.matchingSkills?.learning || []
              }
            };
            
            setMatchData(formattedMatchData);
          } catch (matchError) {
            console.error('Error fetching match details:', matchError);
            // Don't set error state for match details failure
          }
        }
        
        setDataLoaded(true);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err.message || 'Failed to load profile data');
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    } else {
      setError('No user ID provided');
      setLoading(false);
    }
  }, [userId, isOwnProfile]);

  // Helper function to safely display match percentage
  const getMatchPercentage = () => {
    if (!matchData) return 0;
    
    // Direct access to compatibility value (from the raw data structure)
    if (typeof matchData.compatibility === 'number') {
      return Math.round(matchData.compatibility);
    }
    
    // Check if matchPercentage exists and is a number
    if (typeof matchData.matchPercentage === 'number') {
      return Math.round(matchData.matchPercentage);
    }
    
    // If not, try to calculate from compatibility scores
    if (matchData.compatibility && typeof matchData.compatibility === 'object') {
      const { skillMatch, styleCompatibility, availabilityOverlap, timezoneCompatibility } = matchData.compatibility;
      
      if (typeof skillMatch === 'number' && typeof styleCompatibility === 'number' &&
          typeof availabilityOverlap === 'number' && typeof timezoneCompatibility === 'number') {
        // Calculate weighted average
        const percentage = Math.round(
          (skillMatch * 0.4) +
          (styleCompatibility * 0.3) +
          (availabilityOverlap * 0.2) +
          (timezoneCompatibility * 0.1)
        );
        return percentage;
      }
    }
    
    // Check if score exists (from the enhanced matches structure)
    if (typeof matchData.score === 'number') {
      return Math.round(matchData.score);
    }
    
    return 0;
  };

  // Helper function to get teaching matches
  const getTeachingMatches = () => {
    if (!matchData) return [];
    
    // Check for matchDetails.teachingMatches (from the raw data structure)
    if (matchData.matchDetails && Array.isArray(matchData.matchDetails.teachingMatches)) {
      return matchData.matchDetails.teachingMatches.map(match => ({
        skill: match.skill,
        level: match.matchLevel,
        yearsOfExperience: match.matchExperience
      }));
    }
    
    // Check for matchingSkills.teaching
    if (matchData.matchingSkills && Array.isArray(matchData.matchingSkills.teaching)) {
      return matchData.matchingSkills.teaching;
    }
    
    // Check for matchingTeachingSkills (from enhanced matches)
    if (matchData.matchingTeachingSkills && Array.isArray(matchData.matchingTeachingSkills)) {
      return matchData.matchingTeachingSkills;
    }
    
    return [];
  };

  // Helper function to get learning matches
  const getLearningMatches = () => {
    if (!matchData) return [];
    
    // Check for matchDetails.learningMatches (from the raw data structure)
    if (matchData.matchDetails && Array.isArray(matchData.matchDetails.learningMatches)) {
      return matchData.matchDetails.learningMatches.map(match => ({
        skill: match.skill,
        priority: match.priority
      }));
    }
    
    // Check for matchingSkills.learning
    if (matchData.matchingSkills && Array.isArray(matchData.matchingSkills.learning)) {
      return matchData.matchingSkills.learning;
    }
    
    // Check for matchingLearningSkills (from enhanced matches)
    if (matchData.matchingLearningSkills && Array.isArray(matchData.matchingLearningSkills)) {
      return matchData.matchingLearningSkills;
    }
    
    return [];
  };

  // Helper function to get skill compatibility
  const getSkillCompatibility = () => {
    if (!matchData) return 0;
    
    // Check for matchDetails.skillCompatibility (from the raw data structure)
    if (matchData.matchDetails && typeof matchData.matchDetails.skillCompatibility === 'number') {
      return matchData.matchDetails.skillCompatibility;
    }
    
    // Check for compatibility.skillMatch
    if (matchData.compatibility && typeof matchData.compatibility === 'object' && 
        typeof matchData.compatibility.skillMatch === 'number') {
      return matchData.compatibility.skillMatch;
    }
    
    return 0;
  };

  // Helper function to get style compatibility
  const getStyleCompatibility = () => {
    if (!matchData) return 'N/A';
    
    if (matchData.compatibility && typeof matchData.compatibility === 'object' && 
        typeof matchData.compatibility.styleCompatibility === 'number') {
      return Math.round(matchData.compatibility.styleCompatibility);
    }
    
    return 'N/A';
  };

  // Helper function to get availability overlap
  const getAvailabilityOverlap = () => {
    if (!matchData) return 'N/A';
    
    if (matchData.compatibility && typeof matchData.compatibility === 'object' && 
        typeof matchData.compatibility.availabilityOverlap === 'number') {
      return Math.round(matchData.compatibility.availabilityOverlap);
    }
    
    // Check for matchDetails.availabilityMatch (from the raw data structure)
    if (matchData.matchDetails && typeof matchData.matchDetails.availabilityMatch === 'boolean') {
      return matchData.matchDetails.availabilityMatch ? 100 : 0;
    }
    
    return 'N/A';
  };

  // Helper function to get timezone compatibility
  const getTimezoneCompatibility = () => {
    if (!matchData) return 'N/A';
    
    if (matchData.compatibility && typeof matchData.compatibility === 'object' && 
        typeof matchData.compatibility.timezoneCompatibility === 'number') {
      return Math.round(matchData.compatibility.timezoneCompatibility);
    }
    
    // Check for matchDetails.locationMatch (from the raw data structure)
    if (matchData.matchDetails && typeof matchData.matchDetails.locationMatch === 'boolean') {
      return matchData.matchDetails.locationMatch ? 100 : 0;
    }
    
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!dataLoaded || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Header */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                <ProfileImage
                  src={profile.avatar}
                  alt={profile.name}
                  size="lg"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-gray-600">{profile.title || 'No title provided'}</p>
                {!isOwnProfile && matchData && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-700">Match Score:</span>
                    <span className="ml-2 text-lg font-bold text-green-600">
                      {getMatchPercentage()}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills Section */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teaching Skills */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Teaching</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.teachingSkills && profile.teachingSkills.length > 0 ? (
                      profile.teachingSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill.skill?.name || skill.skill || 'Unknown Skill'}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No teaching skills listed</p>
                    )}
                  </div>
                </div>

                {/* Learning Skills */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Learning</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.learningSkills && profile.learningSkills.length > 0 ? (
                      profile.learningSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {skill.skill?.name || skill.skill || 'Unknown Skill'}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No learning skills listed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {profile.bio || 'No bio provided'}
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaLinkedin className="w-6 h-6" />
                </a>
              )}
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-gray-900"
                >
                  <FaGithub className="w-6 h-6" />
                </a>
              )}
              {profile.twitter && (
                <a
                  href={profile.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-500"
                >
                  <FaTwitter className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>

          {/* Match Details - Only show when viewing another user's profile */}
          {!isOwnProfile && matchData && (
            <div className="w-full md:w-1/3">
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Match Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Skill Match</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${getSkillCompatibility()}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {getSkillCompatibility()}%
                    </span>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700">Teaching Style</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: `${getStyleCompatibility()}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {getStyleCompatibility()}%
                    </span>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700">Availability</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-yellow-600 h-2.5 rounded-full"
                        style={{ width: `${getAvailabilityOverlap()}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {getAvailabilityOverlap()}%
                    </span>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700">Timezone</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{ width: `${getTimezoneCompatibility()}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {getTimezoneCompatibility()}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 