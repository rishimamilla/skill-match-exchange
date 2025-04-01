import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExchangeAlt, FaCheck, FaClock } from 'react-icons/fa';
import skillAPI from '../../api/skillAPI';

const SkillExchangeModal = ({ isOpen, onClose, skill, user }) => {
  const [step, setStep] = useState(1);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExchange = async () => {
    try {
      setLoading(true);
      setError(null);
      // Here you would implement the actual exchange logic
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Skill Exchange
                      </h3>
                      <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <FaTimes />
                      </button>
                    </div>

                    {/* Step 1: Select Skill to Exchange */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            You want to learn:
                          </h4>
                          <div className="flex items-center space-x-2">
                            <FaExchangeAlt className="text-blue-500" />
                            <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select a skill to exchange:
                          </label>
                          <select
                            value={selectedSkill || ''}
                            onChange={(e) => setSelectedSkill(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Choose a skill...</option>
                            {user.skills.map((userSkill) => (
                              <option key={userSkill._id} value={userSkill._id}>
                                {userSkill.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => setStep(2)}
                          disabled={!selectedSkill}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Continue
                        </button>
                      </div>
                    )}

                    {/* Step 2: Confirm Exchange */}
                    {step === 2 && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Exchange Details
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-300">You'll learn:</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {skill.name}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-300">You'll teach:</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {user.skills.find(s => s._id === selectedSkill)?.name}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setStep(1)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleExchange}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loading ? 'Processing...' : 'Confirm Exchange'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                      <div className="text-center space-y-4">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                          <FaCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          Exchange Request Sent!
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400">
                          The skill owner will review your request and get back to you soon.
                        </p>
                        <button
                          onClick={onClose}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Close
                        </button>
                      </div>
                    )}

                    {error && (
                      <div className="mt-4 text-red-500 text-sm">{error}</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SkillExchangeModal; 