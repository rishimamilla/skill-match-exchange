import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import skillAPI from '../api/skillAPI';
import ProfileImage from '../components/common/ProfileImage';
import { FiMapPin, FiAward, FiBook, FiMessageSquare, FiRefreshCw, FiUser } from 'react-icons/fi';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('=== STARTING USER PROFILE FETCH ===');
        console.log('Current user ID:', currentUser?._id);
        console.log('Requested user ID:', userId);
        
        setLoading(true);
        setError(null);
        
        // Fetch user profile
        console.log('Fetching user profile...');
        const userData = await skillAPI.getUserProfile(userId);
        console.log('User profile response:', userData);
        
        // Fetch matches only if viewing own profile
        let matchesData = [];
        if (userId === currentUser?._id) {
          console.log('Fetching matches for current user...');
          try {
            matchesData = await skillAPI.getSkillMatches();
            console.log('Matches API response:', matchesData);
          } catch (matchError) {
            console.error('Error fetching matches:', matchError);
            matchesData = [];
          }
        } else {
          console.log('Not fetching matches - viewing other user profile');
        }
        
        // Process profile pictures
        if (userData?.profilePicture) {
          console.log('Processing profile picture:', userData.profilePicture);
          if (!userData.profilePicture.startsWith('http') && !userData.profilePicture.startsWith('/uploads')) {
            userData.profilePicture = `/uploads/profiles/${userData.profilePicture}`;
            console.log('Updated profile picture path:', userData.profilePicture);
          }
        }
        
        // Process matched users' data
        console.log('Processing matches data...');
        const processedMatches = matchesData.map(match => {
          console.log('Processing match:', match);
          const processedMatch = { ...match };
          
          // Process profile picture
          if (match.user?.profilePicture) {
            console.log('Processing match user profile picture:', match.user.profilePicture);
            if (!match.user.profilePicture.startsWith('http') && !match.user.profilePicture.startsWith('/uploads')) {
              processedMatch.user.profilePicture = `/uploads/profiles/${match.user.profilePicture}`;
            }
          }
          
          // Process skills
          if (match.user?.skills) {
            console.log('Processing skills for user:', match.user.name);
            console.log('Raw skills data:', match.user.skills);
            processedMatch.user.skills = match.user.skills.map(skill => {
              const processedSkill = {
                skill: skill.skill || skill.name,
                status: skill.status || 'teaching',
                level: skill.level || 'Not specified',
                description: skill.description || '',
                yearsOfExperience: skill.yearsOfExperience || 0,
                experienceLevel: skill.experienceLevel || 'Not specified',
                priority: skill.priority || 'Not specified'
              };
              console.log('Processed skill:', processedSkill);
              return processedSkill;
            });
          }
          
          // Process matching skills
          if (match.matchingSkills) {
            console.log('Processing matching skills for user:', match.user.name);
            console.log('Raw matching skills data:', match.matchingSkills);
            processedMatch.matchingSkills = match.matchingSkills.map(skill => {
              const processedSkill = {
                name: skill.name || skill.skill,
                status: skill.status || 'teaching',
                level: skill.level || 'Not specified',
                description: skill.description || '',
                yearsOfExperience: skill.yearsOfExperience || 0,
                experienceLevel: skill.experienceLevel || 'Not specified',
                priority: skill.priority || 'Not specified'
              };
              console.log('Processed matching skill:', processedSkill);
              return processedSkill;
            });
          }
          
          console.log('Final processed match:', processedMatch);
          return processedMatch;
        });
        
        console.log('All processed matches:', processedMatches);
        setUser(userData);
        setMatchedUsers(processedMatches);
        console.log('=== USER PROFILE FETCH COMPLETE ===');
      } catch (err) {
        console.error('Error in fetchUserData:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(err.response?.data?.message || 'Failed to load data');
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      console.log('UserProfile useEffect triggered with userId:', userId);
      fetchUserData();
    } else {
      console.log('UserProfile useEffect triggered but no userId provided');
    }
  }, [userId, currentUser?._id]);

  // Add logging for render
  console.log('UserProfile render - current state:', {
    user: user ? {
      _id: user._id,
      name: user.name,
      skills: user.skills?.length,
      profilePicture: user.profilePicture
    } : null,
    matchedUsers: matchedUsers?.length,
    loading,
    error,
    currentUser: currentUser ? {
      _id: currentUser._id,
      name: currentUser.name
    } : null,
    userId
  });

  // Add logging for matched users section
  if (currentUser?._id === userId && matchedUsers.length > 0) {
    console.log('Rendering matched users section with data:', matchedUsers.map(match => ({
      userId: match.user._id,
      name: match.user.name,
      skills: match.user.skills?.length,
      matchingSkills: match.matchingSkills?.length,
      matchScore: match.matchScore
    })));
  }

  const handleContact = () => {
    navigate(`/chat/${userId}`);
  };

  const handleStartExchange = () => {
    navigate(`/exchange/new/${userId}`);
  };

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    console.log('Rendering error state:', error);
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {error || 'Profile Not Found'}
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

  console.log('Rendering user profile with data:', {
    userId: user._id,
    name: user.name,
    skillsCount: user.skills?.length,
    matchedUsersCount: matchedUsers?.length
  });

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        {/* Profile Header */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <div className="w-32 h-32 flex-shrink-0">
              <ProfileImage
                src={user.profilePicture}
                alt={user.name}
                size="xl"
                className="rounded-full border-4 border-white shadow-lg"
              />
            </div>

            {/* Basic Info and Actions */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user.name}
                </h1>
                {user.location && (
                  <div className="flex items-center justify-center md:justify-start text-gray-600">
                    <FiMapPin className="mr-2" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {currentUser && currentUser._id !== userId && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <button
                    onClick={handleContact}
                    className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FiMessageSquare className="mr-2" />
                    Contact
                  </button>
                  <button
                    onClick={handleStartExchange}
                    className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FiRefreshCw className="mr-2" />
                    Start Exchange
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="border-t border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Teaching Skills */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiAward className="mr-2 text-blue-500" />
                Skills Teaching
              </h2>
              <div className="space-y-3">
                {user.skills?.filter(skill => skill.status === 'teaching').map((skill, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <h3 className="font-medium text-gray-900">{skill.skill}</h3>
                    <p className="text-sm text-gray-600">
                      Level: {skill.level}
                      {skill.yearsOfExperience && ` • ${skill.yearsOfExperience} years experience`}
                    </p>
                    {skill.description && (
                      <p className="text-sm text-gray-600 mt-2">{skill.description}</p>
                    )}
                  </div>
                ))}
                {user.skills?.filter(skill => skill.status === 'teaching').length === 0 && (
                  <p className="text-gray-500">No teaching skills listed</p>
                )}
              </div>
            </div>

            {/* Learning Skills */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiBook className="mr-2 text-green-500" />
                Skills Learning
              </h2>
              <div className="space-y-3">
                {user.skills?.filter(skill => skill.status === 'learning').map((skill, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <h3 className="font-medium text-gray-900">{skill.skill}</h3>
                    <p className="text-sm text-gray-600">
                      Current Level: {skill.level}
                      {skill.priority && ` • Priority: ${skill.priority}`}
                    </p>
                    {skill.description && (
                      <p className="text-sm text-gray-600 mt-2">{skill.description}</p>
                    )}
                  </div>
                ))}
                {user.skills?.filter(skill => skill.status === 'learning').length === 0 && (
                  <p className="text-gray-500">No learning skills listed</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matched Users Section */}
      {currentUser?._id === userId && matchedUsers && matchedUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FiUser className="mr-2 text-purple-500" />
            Matched Users ({matchedUsers.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {matchedUsers.map((match) => (
              <div 
                key={match.user._id}
                className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16">
                      <ProfileImage
                        src={match.user.profilePicture}
                        alt={match.user.name}
                        size="lg"
                        className="rounded-full border-2 border-gray-200"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {match.user.name}
                      </h3>
                      {match.user.location && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <FiMapPin className="mr-1" />
                          {match.user.location}
                        </p>
                      )}
                      <p className="text-sm text-purple-600 font-medium mt-1">
                        {(match.matchScore * 100).toFixed(0)}% Match
                      </p>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-4">
                    {/* Matching Skills */}
                    {match.matchingSkills && match.matchingSkills.length > 0 && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="text-base font-semibold text-purple-700 mb-3">
                          Matching Skills
                        </h4>
                        <div className="space-y-2">
                          {match.matchingSkills.map((skill, idx) => (
                            <div key={idx} className="bg-white p-2 rounded">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-purple-800">
                                  {skill.name}
                                </span>
                                <span className="text-sm px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                  {skill.level || 'Not specified'}
                                </span>
                              </div>
                              <p className="text-sm text-purple-600 mt-1">
                                {skill.status === 'teaching' ? 'Can Teach You' : 'Wants to Learn from You'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Teaching Skills */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-base font-semibold text-blue-700 mb-3">
                        Skills They Can Teach
                      </h4>
                      <div className="space-y-2">
                        {match.user.skills?.filter(s => s.status === 'teaching').map((skill, idx) => (
                          <div key={idx} className="bg-white p-2 rounded">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-blue-800">
                                {skill.skill}
                              </span>
                              <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                {skill.level || 'Not specified'}
                              </span>
                            </div>
                          </div>
                        ))}
                        {(!match.user.skills?.some(s => s.status === 'teaching')) && (
                          <p className="text-sm text-gray-500">No teaching skills listed</p>
                        )}
                      </div>
                    </div>

                    {/* Learning Skills */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-base font-semibold text-green-700 mb-3">
                        Skills They Want to Learn
                      </h4>
                      <div className="space-y-2">
                        {match.user.skills?.filter(s => s.status === 'learning').map((skill, idx) => (
                          <div key={idx} className="bg-white p-2 rounded">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-green-800">
                                {skill.skill}
                              </span>
                              <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                {skill.level || 'Not specified'}
                              </span>
                            </div>
                          </div>
                        ))}
                        {(!match.user.skills?.some(s => s.status === 'learning')) && (
                          <p className="text-sm text-gray-500">No learning skills listed</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => navigate(`/chat/${match.user._id}`)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    >
                      <FiMessageSquare className="mr-1" />
                      Contact
                    </button>
                    <button
                      onClick={() => navigate(`/exchange/new/${match.user._id}`)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                    >
                      <FiRefreshCw className="mr-1" />
                      Exchange
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 