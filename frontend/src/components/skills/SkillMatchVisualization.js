import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaUsers, FaExchangeAlt, FaExclamationCircle } from 'react-icons/fa';

const SkillMatchVisualization = ({ userSkills, matchedSkills }) => {
  // Convert user skills to the correct format
  const userSkillsList = userSkills?.map(skill => ({
    name: skill.skill,
    status: skill.status
  })) || [];

  const calculateMatchScore = (matchedSkill) => {
    let score = 0;
    
    // Calculate skill match score
    const teachingMatches = matchedSkill.skills.filter(matchSkill => 
      matchSkill.status === 'teaching' && 
      userSkillsList.some(userSkill => 
        userSkill.name === matchSkill.skill && 
        userSkill.status === 'learning'
      )
    ).length;
    score += teachingMatches * 2;

    // Calculate learning match score
    const learningMatches = matchedSkill.skills.filter(matchSkill => 
      matchSkill.status === 'learning' && 
      userSkillsList.some(userSkill => 
        userSkill.name === matchSkill.skill && 
        userSkill.status === 'teaching'
      )
    ).length;
    score += learningMatches;

    // Add rating bonus
    score += matchedSkill.rating || 0;

    return Math.min(100, score);
  };

  if (!userSkillsList.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            No Skills Added Yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add your skills to start finding matches
          </p>
        </div>
      </div>
    );
  }

  if (!matchedSkills?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            No Matches Found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adding more skills or adjusting your preferences
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Skill Match Analysis
      </h3>

      {/* User Skills */}
      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
          Your Skills
        </h4>
        <div className="flex flex-wrap gap-2">
          {userSkillsList.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`px-3 py-1 rounded-full text-sm ${
                skill.status === 'teaching' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              }`}
            >
              {skill.name}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Matches */}
      <div>
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
          Potential Matches
        </h4>
        <div className="space-y-4">
          {matchedSkills.map((match, index) => {
            const matchScore = calculateMatchScore(match);
            return (
              <motion.div
                key={match._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FaUsers className="text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {match.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaStar className="text-yellow-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {(match.rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Match Score Bar */}
                <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${matchScore}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="absolute h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                  />
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs text-gray-600 dark:text-gray-400">
                    {matchScore}% match
                  </div>
                </div>

                {/* Matching Skills */}
                <div className="flex flex-wrap gap-2">
                  {match.skills
                    .filter(matchSkill => 
                      userSkillsList.some(userSkill => 
                        userSkill.name === matchSkill.skill && 
                        userSkill.status === 'learning' && 
                        matchSkill.status === 'teaching'
                      )
                    )
                    .map((skill, skillIndex) => (
                      <motion.div
                        key={skillIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + skillIndex * 0.05 }}
                        className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs flex items-center"
                      >
                        <FaExchangeAlt className="mr-1" />
                        {skill.skill}
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkillMatchVisualization; 