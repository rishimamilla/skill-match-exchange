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

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

const skillAPI = {
  // Get all skills
  getAllSkills: async () => {
    try {
      const response = await axios.get(`${API_URL}/skills`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get skill by ID
  getSkillById: async (skillId) => {
    try {
      const response = await axios.get(`${API_URL}/skills/${skillId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get skill matches for current user
  getSkillMatches: async () => {
    try {
      console.log('Fetching skill matches...');
      const response = await axios.get(`${API_URL}/matches`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Skill matches response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching skill matches:', error);
      throw handleApiError(error);
    }
  },

  // Add a skill to user's profile
  addUserSkill: async (skillData) => {
    try {
      const response = await axios.post(
        `${API_URL}/skills/user`,
        skillData,
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

  // Update a user's skill
  updateUserSkill: async (skillName, skillData) => {
    try {
      const response = await axios.put(
        `${API_URL}/skills/user/${encodeURIComponent(skillName)}`,
        skillData,
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

  // Remove a skill from user's profile
  removeUserSkill: async (skillName) => {
    try {
      const encodedSkillName = encodeURIComponent(skillName);
      const response = await axios.delete(`${API_URL}/skills/user/${encodedSkillName}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Search skills
  searchSkills: async (query, filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (query?.trim()) {
        params.append('q', query.trim());
      }
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });

      const response = await axios.get(`${API_URL}/skills/search?${params.toString()}`, {
        headers: getAuthHeader()
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Add a review to a skill
  addSkillReview: async (skillId, reviewData) => {
    try {
      const response = await axios.post(
        `${API_URL}/skills/${skillId}/reviews`,
        reviewData,
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

  // Endorse a skill
  endorseSkill: async (skillId) => {
    try {
      const response = await axios.post(
        `${API_URL}/skills/${skillId}/endorse`,
        {},
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Remove endorsement from a skill
  removeEndorsement: async (skillId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/skills/${skillId}/endorse`,
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Find potential skill matches
  findSkillMatches: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/skills/matches/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to find skill matches' };
    }
  },

  // Initiate a skill exchange
  initiateExchange: async (data) => {
    try {
      console.log('Initiating exchange with data:', data);
      const response = await axios.post(
        `${API_URL}/exchanges`,
        data,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Exchange creation response:', response.data);
      return response;
    } catch (error) {
      console.error('Error in initiateExchange:', error);
      throw handleApiError(error);
    }
  },

  // Get user's active exchanges
  getActiveExchanges: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/exchanges/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get active exchanges' };
    }
  },

  // Accept an exchange request
  acceptExchange: async (exchangeId) => {
    try {
      const response = await axios.post(`${API_URL}/exchanges/${exchangeId}/accept`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error accepting exchange:', error);
      throw error;
    }
  },

  // Reject an exchange request
  rejectExchange: async (exchangeId) => {
    try {
      const response = await axios.put(`${API_URL}/exchanges/${exchangeId}/reject`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reject exchange' };
    }
  },

  // Complete an exchange
  completeExchange: async (exchangeId) => {
    try {
      const response = await axios.put(`${API_URL}/exchanges/${exchangeId}/complete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to complete exchange' };
    }
  },

  // Rate an exchange
  rateExchange: async (exchangeId, rating) => {
    try {
      const response = await axios.post(`${API_URL}/exchanges/${exchangeId}/rate`, { rating });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to rate exchange' };
    }
  },

  // Get user's recent activity
  getRecentActivity: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/activity/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch recent activity' };
    }
  },

  // Get user's statistics
  getUserStats: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/stats/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user statistics' };
    }
  },

  // Get user profile with detailed information
  getUserProfile: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get match details between current user and another user
  getMatchDetails: async (userId) => {
    try {
      console.log('Fetching match details for user:', userId);
      const response = await axios.get(`${API_URL}/matches/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Match details response:', response.data);
      
      // Check if the response is an array (from the raw data structure)
      if (Array.isArray(response.data)) {
        // Find the match for the specific user
        const userMatch = response.data.find(match => match.user._id === userId);
        if (userMatch) {
          console.log('Found match for user:', userMatch);
          
          // Add matchQuality and matchStrength based on compatibility score
          const compatibility = userMatch.compatibility || 0;
          const matchQuality = compatibility >= 80 ? 'Excellent' : 
                              compatibility >= 60 ? 'Good' : 
                              compatibility >= 40 ? 'Fair' : 'Poor';
          const matchStrength = compatibility >= 80 ? 'Strong' : 
                               compatibility >= 50 ? 'Moderate' : 'Weak';
          
          return {
            ...userMatch,
            matchQuality,
            matchStrength
          };
        }
      }
      
      // Ensure the response has the expected structure
      if (!response.data) {
        console.error('Empty response from match details API');
        return {
          matchPercentage: 0,
          matchQuality: 'Unknown',
          matchStrength: 'Unknown',
          compatibility: 0,
          matchingSkills: {
            teaching: [],
            learning: []
          }
        };
      }
      
      // If the response has a compatibility value directly, use it
      if (typeof response.data.compatibility === 'number') {
        const compatibility = response.data.compatibility;
        const matchQuality = compatibility >= 80 ? 'Excellent' : 
                            compatibility >= 60 ? 'Good' : 
                            compatibility >= 40 ? 'Fair' : 'Poor';
        const matchStrength = compatibility >= 80 ? 'Strong' : 
                             compatibility >= 50 ? 'Moderate' : 'Weak';
        
        return {
          ...response.data,
          matchQuality,
          matchStrength
        };
      }
      
      // If the response has a matchPercentage, use it as compatibility
      if (typeof response.data.matchPercentage === 'number') {
        const compatibility = response.data.matchPercentage;
        const matchQuality = compatibility >= 80 ? 'Excellent' : 
                            compatibility >= 60 ? 'Good' : 
                            compatibility >= 40 ? 'Fair' : 'Poor';
        const matchStrength = compatibility >= 80 ? 'Strong' : 
                             compatibility >= 50 ? 'Moderate' : 'Weak';
        
        return {
          ...response.data,
          compatibility: response.data.matchPercentage,
          matchQuality,
          matchStrength
        };
      }
      
      // If the response has a score, use it as matchPercentage
      if (typeof response.data.score === 'number') {
        const compatibility = response.data.score;
        const matchQuality = compatibility >= 80 ? 'Excellent' : 
                            compatibility >= 60 ? 'Good' : 
                            compatibility >= 40 ? 'Fair' : 'Poor';
        const matchStrength = compatibility >= 80 ? 'Strong' : 
                             compatibility >= 50 ? 'Moderate' : 'Weak';
        
        return {
          ...response.data,
          matchPercentage: response.data.score,
          compatibility: response.data.score,
          matchQuality,
          matchStrength
        };
      }
      
      // If the response has a compatibility object but no matchPercentage, calculate it
      if (response.data.compatibility && typeof response.data.compatibility === 'object') {
        const { skillMatch, styleCompatibility, availabilityOverlap, timezoneCompatibility } = response.data.compatibility;
        
        if (typeof skillMatch === 'number' && typeof styleCompatibility === 'number' &&
            typeof availabilityOverlap === 'number' && typeof timezoneCompatibility === 'number') {
          // Calculate weighted average
          const percentage = Math.round(
            (skillMatch * 0.4) +
            (styleCompatibility * 0.3) +
            (availabilityOverlap * 0.2) +
            (timezoneCompatibility * 0.1)
          );
          
          const matchQuality = percentage >= 80 ? 'Excellent' : 
                              percentage >= 60 ? 'Good' : 
                              percentage >= 40 ? 'Fair' : 'Poor';
          const matchStrength = percentage >= 80 ? 'Strong' : 
                               percentage >= 50 ? 'Moderate' : 'Weak';
          
          return {
            ...response.data,
            matchPercentage: percentage,
            compatibility: percentage,
            matchQuality,
            matchStrength
          };
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching match details:', error);
      // Return a default structure instead of throwing an error
      return {
        matchPercentage: 0,
        matchQuality: 'Unknown',
        matchStrength: 'Unknown',
        compatibility: 0,
        matchingSkills: {
          teaching: [],
          learning: []
        }
      };
    }
  },

  getExchanges: async () => {
    try {
      const response = await axios.get('/api/exchanges', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Notification API functions
  getNotifications: async () => {
    const response = await fetch(`${API_URL}/notifications`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  markNotificationAsRead: async (notificationId) => {
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  markAllNotificationsAsRead: async () => {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  }
};

export default skillAPI; 