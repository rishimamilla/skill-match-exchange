import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getChats = async () => {
  try {
    const response = await axios.get(`${API_URL}/chat`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch chats');
  }
};

export const getChatById = async (chatId) => {
  try {
    const response = await axios.get(`${API_URL}/chat/${chatId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch chat');
  }
};

export const createChat = async (participantId) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat`,
      { participantId },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create chat');
  }
};

export const sendMessage = async (chatId, content) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat/${chatId}/messages`,
      { content },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send message');
  }
};

export const markAsRead = async (chatId) => {
  try {
    const response = await axios.put(
      `${API_URL}/chat/${chatId}/read`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark as read');
  }
}; 