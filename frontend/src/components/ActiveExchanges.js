import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiClock, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import skillAPI from '../api/skillAPI';

const ActiveExchanges = () => {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActiveExchanges();
  }, [user]);

  const fetchActiveExchanges = async () => {
    setLoading(true);
    try {
      const response = await skillAPI.getActiveExchanges(user._id);
      setExchanges(response.exchanges || []);
    } catch (error) {
      console.error('Error fetching exchanges:', error);
      toast.error('Failed to load active exchanges');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (exchangeId) => {
    try {
      await skillAPI.acceptExchange(exchangeId);
      toast.success('Exchange accepted successfully');
      fetchActiveExchanges();
    } catch (error) {
      console.error('Error accepting exchange:', error);
      toast.error('Failed to accept exchange');
    }
  };

  const handleReject = async (exchangeId) => {
    try {
      await skillAPI.rejectExchange(exchangeId);
      toast.success('Exchange rejected');
      fetchActiveExchanges();
    } catch (error) {
      console.error('Error rejecting exchange:', error);
      toast.error('Failed to reject exchange');
    }
  };

  const handleComplete = async (exchangeId) => {
    try {
      await skillAPI.completeExchange(exchangeId);
      toast.success('Exchange marked as completed');
      fetchActiveExchanges();
    } catch (error) {
      console.error('Error completing exchange:', error);
      toast.error('Failed to complete exchange');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Active Exchanges
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading exchanges...</p>
          </div>
        ) : exchanges.length > 0 ? (
          <div className="space-y-4">
            {exchanges.map((exchange) => (
              <div
                key={exchange._id}
                className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={exchange.initiator.profilePicture || '/default-avatar.png'}
                      alt={exchange.initiator.name}
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {exchange.initiator.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Initiated on {formatDate(exchange.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {exchange.status === 'pending' && exchange.recipient._id === user._id && (
                      <>
                        <button
                          onClick={() => handleAccept(exchange._id)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                          title="Accept Exchange"
                        >
                          <FiCheck className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(exchange._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                          title="Reject Exchange"
                        >
                          <FiX className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    {exchange.status === 'accepted' && (
                      <button
                        onClick={() => handleComplete(exchange._id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      >
                        Complete Exchange
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <FiClock className="mr-2" />
                    <span>Status: {exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}</span>
                  </div>
                  {exchange.acceptedAt && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <FiCheck className="mr-2" />
                      <span>Accepted on {formatDate(exchange.acceptedAt)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    className="flex items-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    onClick={() => {/* TODO: Implement chat functionality */}}
                  >
                    <FiMessageSquare className="mr-2" />
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiClock className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              No active exchanges at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveExchanges; 