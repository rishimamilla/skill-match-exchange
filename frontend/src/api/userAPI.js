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

// Helper function to handle API errors
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    if (error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error(error.response.data?.message || 'Server error occurred');
  } else if (error.request) {
    // Request made but no response
    throw new Error('No response from server. Please check your connection.');
  } else {
    // Other errors
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

const userAPI = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/profile`,
        profileData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update user settings
  updateSettings: async (settings) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/settings`,
        settings,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post(
        `${API_URL}/users/profile/picture`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default userAPI; 