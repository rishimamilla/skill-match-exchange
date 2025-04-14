import axios from 'axios';
import { API_URL } from '../config';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return { Authorization: `Bearer ${token}` };
};

const exchangeAPI = {
  // Create a new exchange
  createExchange: async (exchangeData) => {
    try {
      const response = await axios.post(`${API_URL}/exchanges`, exchangeData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create exchange' };
    }
  },

  // Get all exchanges for current user
  getExchanges: async () => {
    try {
      const response = await axios.get(`${API_URL}/exchanges`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch exchanges' };
    }
  },

  // Get exchange by ID
  getExchangeById: async (exchangeId) => {
    try {
      const response = await axios.get(`${API_URL}/exchanges/${exchangeId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch exchange' };
    }
  },

  // Update exchange status
  updateExchangeStatus: async (exchangeId, status) => {
    try {
      const response = await axios.patch(
        `${API_URL}/exchanges/${exchangeId}/status`,
        { status },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update exchange status' };
    }
  },

  // Add message to exchange
  addMessage: async (exchangeId, message) => {
    try {
      const response = await axios.post(
        `${API_URL}/exchanges/${exchangeId}/messages`,
        { message },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add message' };
    }
  },

  // Get exchange messages
  getMessages: async (exchangeId) => {
    try {
      const response = await axios.get(`${API_URL}/exchanges/${exchangeId}/messages`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch messages' };
    }
  }
};

export default exchangeAPI; 