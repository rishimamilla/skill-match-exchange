const express = require('express');
const { check } = require('express-validator');
const {
  getConversations,
  getConversation,
  sendMessage,
  markAsRead,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Get conversation with specific user
router.get('/conversation/:userId', getConversation);

// Send a message
router.post('/send', [
  check('recipient', 'Recipient is required').notEmpty(),
  check('content', 'Message content is required').notEmpty().trim()
], sendMessage);

// Mark messages as read
router.put('/read/:userId', markAsRead);

// Delete a message
router.delete('/:messageId', deleteMessage);

module.exports = router; 