import axios from 'axios';
import { API_URL } from '../config';

const skillAPI = {
  // Get all skills
  getAllSkills: async () => {
    try {
      const response = await axios.get(`${API_URL}/skills`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch skills');
    }
  },

  // Get skill matches for current user
  getSkillMatches: async () => {
    try {
      const response = await axios.get(`${API_URL}/skills/matches`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch skill matches');
    }
  },

  // Add a skill to user's profile
  addUserSkill: async (skillData) => {
    try {
      console.log('Adding skill with data:', skillData);
      const response = await axios.post(
        `${API_URL}/skills/user/${skillData.userId}`,
        {
          skill: skillData.skill,
          level: skillData.level,
          yearsOfExperience: skillData.yearsOfExperience,
          status: skillData.status,
          category: skillData.category,
          description: skillData.description,
          certifications: skillData.certifications,
          priority: skillData.priority
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Skill added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding skill:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to add skill');
    }
  },

  // Update a user's skill
  updateUserSkill: async (skillData) => {
    try {
      console.log('Updating skill with data:', skillData);
      const response = await axios.put(
        `${API_URL}/skills/user/${skillData.userId}`,
        {
          _id: skillData._id,
          skill: skillData.skill,
          level: skillData.level,
          yearsOfExperience: skillData.yearsOfExperience,
          status: skillData.status,
          category: skillData.category,
          description: skillData.description,
          certifications: skillData.certifications,
          priority: skillData.priority
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Skill updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating skill:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to update skill');
    }
  },

  // Remove a skill from user's profile
  removeUserSkill: async (skillId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/skills/user/${skillId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove skill');
    }
  },

  // Search skills
  searchSkills: async (query, filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Add search query if provided
      if (query && query.trim()) {
        params.append('q', query.trim());
      }
      
      // Add filters if provided
      if (filters) {
        if (filters.category && filters.category !== 'all') {
          params.append('category', filters.category);
        }
        if (filters.difficulty && filters.difficulty !== 'all') {
          params.append('difficulty', filters.difficulty);
        }
        if (filters.minRating) {
          params.append('minRating', filters.minRating);
        }
        if (filters.sortBy) {
          params.append('sortBy', filters.sortBy);
        }
      }

      console.log('Search params:', params.toString());

      const response = await axios.get(`${API_URL}/skills/search?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return {
          skills: response.data,
          total: response.data.length,
          count: response.data.length
        };
      } else if (response.data && typeof response.data === 'object') {
        // Handle new format with data property
        if (response.data.data) {
          return {
            skills: response.data.data,
            total: response.data.total || response.data.data.length,
            count: response.data.count || response.data.data.length
          };
        }
        // Handle format with direct skills property
        if (response.data.skills) {
          return {
            skills: response.data.skills,
            total: response.data.total || response.data.skills.length,
            count: response.data.count || response.data.skills.length
          };
        }
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Search error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        throw new Error(error.response.data.message || 'Failed to search skills');
      }
      if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check your connection.');
      }
      throw new Error('Network error while searching skills');
    }
  },

  // Endorse a skill
  endorseSkill: async (skillId, userId) => {
    try {
      const response = await axios.post(
        `${API_URL}/skills/${skillId}/endorse`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to endorse skill');
    }
  },

  // Remove endorsement from a skill
  removeEndorsement: async (skillId, userId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/skills/${skillId}/endorse/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove endorsement');
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
      const response = await axios.post(`${API_URL}/exchanges`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to initiate exchange' };
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
      const response = await axios.put(`${API_URL}/exchanges/${exchangeId}/accept`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to accept exchange' };
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
  }
};

export default skillAPI; 