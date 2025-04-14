const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserChats,
  getChatById,
  getOrCreateChat,
  sendMessage,
  markMessagesAsRead
} = require('../controllers/chatController');

// Base route: /api/chat
router.use(protect);

// Debug route - must be placed before routes with parameters
router.get('/debug', (req, res) => {
  res.json({ message: 'Chat routes are working' });
});

router.route('/')
  .get(getUserChats)
  .post(getOrCreateChat);

router.route('/:id')
  .get(getChatById);

// Message routes - ensure the parameter name matches what's used in the controller
router.route('/:id/messages')
  .post(sendMessage);

router.route('/:id/read')
  .put(markMessagesAsRead);

module.exports = router;