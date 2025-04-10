import React, { useState, useEffect } from 'react';
import { FiUsers, FiMessageSquare, FiClock, FiStar, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import skillAPI from '../api/skillAPI';
import axios from 'axios';
import { format } from 'date-fns';

const SkillExchange = ({ exchange, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const isInitiator = exchange.initiator._id === user._id;
  const otherUser = isInitiator ? exchange.recipient : exchange.initiator;
  const canRate = exchange.status === 'completed' && 
    !(isInitiator ? exchange.initiatorRating : exchange.recipientRating).rating;

  const handleStatusUpdate = async (newStatus) => {
    try {
      setLoading(true);
      await axios.put(
        `/api/exchange/${exchange._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      onUpdate();
      toast.success(`Exchange ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating exchange');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async () => {
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `/api/exchange/${exchange._id}/rate`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      onUpdate();
      toast.success('Rating submitted successfully');
      setRating(0);
      setComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {otherUser.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt={otherUser.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <FiUsers className="w-6 h-6 text-gray-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {otherUser.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(exchange.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${
          exchange.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          exchange.status === 'accepted' ? 'bg-green-100 text-green-800' :
          exchange.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            {isInitiator ? 'You Offered' : 'They Offered'}
          </h4>
          <ul className="space-y-2">
            {exchange.offeredSkills.map(skill => (
              <li
                key={skill._id}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>{skill.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            {isInitiator ? 'You Requested' : 'They Requested'}
          </h4>
          <ul className="space-y-2">
            {exchange.requestedSkills.map(skill => (
              <li
                key={skill._id}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>{skill.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {exchange.status === 'pending' && !isInitiator && (
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusUpdate('accepted')}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            <FiCheck className="inline-block mr-2" />
            Accept
          </button>
          <button
            onClick={() => handleStatusUpdate('rejected')}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            <FiX className="inline-block mr-2" />
            Reject
          </button>
        </div>
      )}

      {exchange.status === 'accepted' && (
        <div className="mt-4">
          <button
            onClick={() => handleStatusUpdate('completed')}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Mark as Completed
          </button>
        </div>
      )}

      {canRate && (
        <div className="mt-4 border-t dark:border-gray-700 pt-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Rate this Exchange
          </h4>
          <div className="flex items-center space-x-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`p-1 rounded-full ${
                  rating >= star ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                <FiStar className="w-6 h-6" />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment (optional)"
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows="2"
          />
          <button
            onClick={handleRating}
            disabled={loading || rating < 1}
            className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Submit Rating
          </button>
        </div>
      )}

      {(exchange.initiatorRating.rating || exchange.recipientRating.rating) && (
        <div className="mt-4 border-t dark:border-gray-700 pt-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Ratings
          </h4>
          {exchange.initiatorRating.rating && (
            <div className="mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {exchange.initiator.name}'s rating:
              </p>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-4 h-4 ${
                      i < exchange.initiatorRating.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              {exchange.initiatorRating.comment && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  "{exchange.initiatorRating.comment}"
                </p>
              )}
            </div>
          )}
          {exchange.recipientRating.rating && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {exchange.recipient.name}'s rating:
              </p>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-4 h-4 ${
                      i < exchange.recipientRating.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              {exchange.recipientRating.comment && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  "{exchange.recipientRating.comment}"
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillExchange; 