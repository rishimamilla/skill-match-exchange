import axios from 'axios';
import { API_URL } from '../config';

const skillAPI = {
  // Get all skills
  getAllSkills: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/skills`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch skills');
    }
  },

  // Get skill matches for current user
  getSkillMatches: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/skills/matches`, {
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
      const response = await axios.post(
        `${API_URL}/api/skills/user`,
        skillData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add skill');
    }
  },

  // Remove a skill from user's profile
  removeUserSkill: async (skillId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/skills/user/${skillId}`,
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
      const response = await axios.get(`${API_URL}/api/skills/search`, {
        params: {
          q: query,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search skills');
    }
  }
};

export default skillAPI; 