const sendNotification = async (notificationData) => {
  try {
    const response = await axios.post('/api/notifications', notificationData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

export default {
  sendNotification,
}; 