import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get user data');
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await axios.put(`${API_URL}/auth/profile`, userData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
}; 