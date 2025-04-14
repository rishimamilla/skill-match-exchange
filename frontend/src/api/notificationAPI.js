import { API_URL, getAuthHeaders } from './config';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Get all notifications for the current user
export const getNotifications = async () => {
  const response = await fetch(`${API_URL}/notifications`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Mark a specific notification as read
export const markNotificationAsRead = async (notificationId) => {
  const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}; 