const { getIO } = require('../config/socket');
const User = require('../models/User');
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Production email configuration
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development email configuration (no authentication required)
    return nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
      tls: {
        rejectUnauthorized: false
      }
    });
  }
};

const sendNotification = async (userId, message, type = 'info', exchangeId = null, senderId = null) => {
  try {
    const io = getIO();
    const user = await User.findById(userId);
    
    if (!user) {
      console.error(`User ${userId} not found`);
      return;
    }

    // Create notification in database
    const notification = await Notification.create({
      recipient: userId,
      sender: senderId,
      type,
      exchangeId,
      message
    });

    // Populate sender details
    await notification.populate('sender', 'name profilePicture');

    // Emit notification to user's personal room
    io.to(`user_${userId}`).emit('notification', {
      id: notification._id,
      type,
      message,
      sender: notification.sender,
      exchangeId,
      createdAt: notification.createdAt
    });

    // Log the notification
    console.log(`Notification sent to user ${userId}:`, {
      type,
      message,
      exchangeId
    });

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Get notifications for a user
const getNotifications = async (userId, limit = 20) => {
  try {
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name profilePicture')
      .populate('exchangeId');
    
    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// Mark notification as read
const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    ).populate('sender', 'name profilePicture')
     .populate('exchangeId');
    
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
const markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

module.exports = {
  sendNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  createTransporter
}; 