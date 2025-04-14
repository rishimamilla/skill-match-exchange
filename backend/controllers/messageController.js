const asyncHandler = require('../middleware/asyncHandler');
const { validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res) => {
  // Get all messages where user is either sender or recipient
  const messages = await Message.find({
    $or: [{ sender: req.user._id }, { recipient: req.user._id }]
  })
  .sort({ createdAt: -1 })
  .populate('sender recipient', 'name avatar');

  // Group messages by conversation
  const conversations = messages.reduce((acc, message) => {
    const otherUser = message.sender._id.equals(req.user._id) 
      ? message.recipient 
      : message.sender;
    
    const conversationId = otherUser._id.toString();
    
    if (!acc[conversationId]) {
      acc[conversationId] = {
        user: otherUser,
        lastMessage: message,
        unreadCount: message.recipient.equals(req.user._id) && !message.read 
          ? 1 
          : 0
      };
    } else {
      acc[conversationId].lastMessage = message;
      if (message.recipient.equals(req.user._id) && !message.read) {
        acc[conversationId].unreadCount++;
      }
    }
    
    return acc;
  }, {});

  res.json(Object.values(conversations));
});

// @desc    Get conversation with specific user
// @route   GET /api/messages/conversation/:userId
// @access  Private
exports.getConversation = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, recipient: req.params.userId },
      { sender: req.params.userId, recipient: req.user._id }
    ]
  })
  .sort({ createdAt: 1 })
  .populate('sender recipient', 'name avatar');

  res.json(messages);
});

// @desc    Send a message
// @route   POST /api/messages/send
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { recipient, content } = req.body;

  // Check if recipient exists
  const recipientUser = await User.findById(recipient);
  if (!recipientUser) {
    return res.status(404).json({ message: 'Recipient not found' });
  }

  const message = await Message.create({
    sender: req.user._id,
    recipient,
    content
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('sender recipient', 'name avatar');

  res.status(201).json(populatedMessage);
});

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:userId
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  await Message.updateMany(
    {
      sender: req.params.userId,
      recipient: req.user._id,
      read: false
    },
    { read: true }
  );

  res.json({ message: 'Messages marked as read' });
});

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
exports.deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  // Check if user is sender or recipient
  if (!message.sender.equals(req.user._id) && !message.recipient.equals(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to delete this message' });
  }

  await message.remove();

  res.json({ message: 'Message deleted' });
}); 