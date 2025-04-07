const express = require('express');
const {
  getChats,
  getChatById,
  createChat,
  sendMessage,
  markAsRead,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');

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

// Get all chats for a user
router.get('/chats', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name profilePicture')
      .populate('messages.sender', 'name profilePicture')
      .sort({ lastMessage: -1 });
    
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chats' });
  }
});

// Get or create a chat with another user
router.get('/chat/:userId', protect, async (req, res) => {
  try {
    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, req.params.userId] }
    }).populate('participants', 'name profilePicture')
      .populate('messages.sender', 'name profilePicture');

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, req.params.userId],
        messages: [],
        unreadCount: new Map([[req.user._id.toString(), 0], [req.params.userId, 0]])
      });
      chat = await chat.populate('participants', 'name profilePicture');
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error creating/fetching chat' });
  }
});

// Send a message in a chat
router.post('/chat/:chatId/message', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not a participant in this chat' });
    }

    const message = {
      sender: req.user._id,
      content,
      timestamp: new Date()
    };

    chat.messages.push(message);
    chat.lastMessage = new Date();

    // Update unread count for other participants
    chat.participants.forEach(participantId => {
      if (participantId.toString() !== req.user._id.toString()) {
        const currentCount = chat.unreadCount.get(participantId.toString()) || 0;
        chat.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });

    await chat.save();
    
    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name profilePicture')
      .populate('messages.sender', 'name profilePicture');

    res.json(populatedChat);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Mark messages as read
router.put('/chat/:chatId/read', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not a participant in this chat' });
    }

    // Mark all messages as read for the current user
    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.user._id.toString()) {
        message.read = true;
      }
    });

    // Reset unread count for the current user
    chat.unreadCount.set(req.user._id.toString(), 0);

    await chat.save();
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});

module.exports = router;