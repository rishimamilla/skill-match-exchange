// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get authentication headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}; 