import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaUsers, FaClock, FaMapMarkerAlt, FaGlobe, FaUser, FaCheck } from 'react-icons/fa';
import skillAPI from '../api/skillAPI';
import { useAuth } from '../context/AuthContext';

const SkillDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchSkillDetails();
  }, [id]);

  const fetchSkillDetails = async () => {
    try {
      setLoading(true);
      const data = await skillAPI.getSkill(id);
      setSkill(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await skillAPI.addReview(id, review);
      fetchSkillDetails();
      setShowReviewForm(false);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{error || 'Skill not found'}</h2>
        <button
          onClick={() => navigate('/skills')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Skills
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {skill.name}
            </h1>
            <div className="flex flex-wrap gap-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {skill.category}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {skill.difficulty}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {skill.availability}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <div className="prose dark:prose-invert max-w-none mb-8">
              <p>{skill.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <FaClock className="mr-3 text-blue-500" />
                  <span>Duration: {skill.duration}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <FaMapMarkerAlt className="mr-3 text-blue-500" />
                  <span>Location: {skill.location}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <FaGlobe className="mr-3 text-blue-500" />
                  <span>Remote: {skill.isRemote ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <FaUsers className="mr-3 text-blue-500" />
                  <span>Popularity: {skill.popularity}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <FaUser className="mr-3 text-blue-500" />
                  <span>Owner: {skill.owner.name}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <FaCheck className="mr-3 text-blue-500" />
                  <span>Preferred Exchange: {skill.preferredExchange}</span>
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            {skill.prerequisites && skill.prerequisites.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Prerequisites
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  {skill.prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Reviews
                </h3>
                {user && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Review
                  </button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <motion.form
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleReviewSubmit}
                  className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReview({ ...review, rating: star })}
                          className="text-2xl focus:outline-none"
                        >
                          <FaStar
                            className={`${
                              star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comment
                    </label>
                    <textarea
                      value={review.comment}
                      onChange={(e) => setReview({ ...review, comment: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows="4"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Submit Review
                  </button>
                </motion.form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {skill.reviews.map((review, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        by {review.user.name}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SkillDetailsPage; 