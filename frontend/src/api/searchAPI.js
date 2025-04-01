import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const searchAPI = {
  // Search users with filters
  searchUsers: async (filters) => {
    try {
      const response = await axios.get(`${API_URL}/search/users`, {
        params: filters,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search skills with filters
  searchSkills: async (filters) => {
    try {
      const response = await axios.get(`${API_URL}/search/skills`, {
        params: filters,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get search suggestions
  getSuggestions: async (query) => {
    try {
      const response = await axios.get(`${API_URL}/search/suggestions`, {
        params: { query },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default searchAPI; 