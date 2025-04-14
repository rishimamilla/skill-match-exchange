import React from 'react';
import { Link } from 'react-router-dom';
import ProfileImage from './common/ProfileImage';
import { FiUser, FiBook, FiAward, FiStar } from 'react-icons/fi';

const SkillMatchDetails = ({ match, onViewProfile }) => {
  if (!match) return null;

  const { user, matchDetails } = match;
  
  const getMatchPercentage = () => {
    if (typeof matchDetails?.compatibility === 'number') {
      return Math.round(matchDetails.compatibility);
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Profile Picture */}
          <div className="w-24 h-24 flex-shrink-0">
            <ProfileImage
              src={user.profilePicture}
              alt={user.name}
              size="lg"
              className="rounded-full border-4 border-white shadow-lg"
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {user.name}
                </h3>
                <p className="text-gray-600">{user.location}</p>
              </div>
              {matchDetails && (
                <div className="mt-2 md:mt-0">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800">
                    <FiStar className="mr-2" />
                    {getMatchPercentage()}% Match
                  </span>
                </div>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="mt-2 text-gray-600 line-clamp-2">
                {user.bio}
              </p>
            )}

            {/* Skills */}
            <div className="mt-4 space-y-3">
              {/* Teaching Skills */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center text-sm font-medium text-gray-600">
                  <FiAward className="mr-1 text-blue-500" />
                  Teaching:
                </span>
                {matchDetails?.teachingMatches?.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill.skill}
                    {skill.level && (
                      <span className="ml-1 text-blue-600">• {skill.level}</span>
                    )}
                  </span>
                ))}
              </div>

              {/* Learning Skills */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center text-sm font-medium text-gray-600">
                  <FiBook className="mr-1 text-green-500" />
                  Learning:
                </span>
                {matchDetails?.learningMatches?.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {skill.skill}
                    {skill.priority && (
                      <span className="ml-1 text-green-600">• {skill.priority}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              {user.education && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Education:</span>
                  <p className="text-sm text-gray-800">{user.education}</p>
                </div>
              )}
              {user.workExperience && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Experience:</span>
                  <p className="text-sm text-gray-800">{user.workExperience}</p>
                </div>
              )}
              {user.languages && user.languages.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Languages:</span>
                  <p className="text-sm text-gray-800">{user.languages.join(', ')}</p>
                </div>
              )}
              {user.certifications && user.certifications.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Certifications:</span>
                  <p className="text-sm text-gray-800">{user.certifications.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <Link
            to={`/profile/${user._id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => onViewProfile && onViewProfile(user._id)}
          >
            <FiUser className="mr-2" />
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SkillMatchDetails; 