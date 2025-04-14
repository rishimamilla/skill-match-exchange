import axios from '../config/axios';

const API_URL = '/messages';

// Get all conversations for current user
export const getConversations = async () => {
  const response = await axios.get(`${API_URL}/conversations`);
  return response.data;
};

// Get conversation with specific user
export const getConversation = async (userId) => {
  const response = await axios.get(`${API_URL}/conversation/${userId}`);
  return response.data;
};

// Send a message
export const sendMessage = async (recipientId, content) => {
  const response = await axios.post(`${API_URL}/send`, {
    recipient: recipientId,
    content
  });
  return response.data;
};

// Mark messages as read
export const markMessagesAsRead = async (userId) => {
  const response = await axios.put(`${API_URL}/read/${userId}`);
  return response.data;
};

// Delete a message
export const deleteMessage = async (messageId) => {
  const response = await axios.delete(`${API_URL}/${messageId}`);
  return response.data;
}; 