const express = require('express');
const {
  getChats,
  getChatById,
  createChat,
  sendMessage,
  markAsRead,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chat
router.get('/', protect, getChats);

// @route   GET /api/chat/:id
router.get('/:id', protect, getChatById);

// @route   POST /api/chat
router.post('/', protect, createChat);

// @route   POST /api/chat/:id/messages
router.post('/:id/messages', protect, sendMessage);

// @route   PUT /api/chat/:id/read
router.put('/:id/read', protect, markAsRead);

module.exports = router;