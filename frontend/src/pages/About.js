import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiTarget, FiHeart, FiAward } from 'react-icons/fi';

const About = () => {
  const stats = [
    { label: 'Active Users', value: '1000+' },
    { label: 'Skills Exchanged', value: '5000+' },
    { label: 'Success Rate', value: '95%' },
    { label: 'Community Growth', value: '200%' },
  ];

  const values = [
    {
      icon: <FiUsers className="h-8 w-8" />,
      title: 'Community First',
      description: 'We believe in building a supportive community where everyone can learn and grow together.',
    },
    {
      icon: <FiTarget className="h-8 w-8" />,
      title: 'Focused Learning',
      description: 'Our platform helps you find the perfect skill exchange partners to achieve your learning goals.',
    },
    {
      icon: <FiHeart className="h-8 w-8" />,
      title: 'Mutual Growth',
      description: 'We promote a culture of mutual learning where everyone has something valuable to share.',
    },
    {
      icon: <FiAward className="h-8 w-8" />,
      title: 'Quality Exchange',
      description: 'We ensure high-quality skill exchanges through our verification and rating system.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            About SkillMatch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
          >
            A platform designed to connect people who want to learn new skills with those who can teach them.
            Created by Rishi Mamilla and Sangeetha Uppari to make skill sharing accessible and enjoyable.
          </motion.p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center"
            >
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
              >
                <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Creators Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Meet the Creators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center"
            >
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">R</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Rishi Mamilla
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Passionate about creating innovative solutions that connect people and facilitate learning.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center"
            >
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">S</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sangeetha Uppari
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Dedicated to building user-friendly platforms that make skill sharing accessible to everyone.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 