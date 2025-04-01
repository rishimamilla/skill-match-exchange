const Chat = require('../models/Chat');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc    Get all chats for a user
// @route   GET /api/chat
// @access  Private
exports.getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    participants: req.user._id,
  })
    .populate('participants', 'name avatar')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  res.status(200).json(chats);
});

// @desc    Get chat by ID
// @route   GET /api/chat/:id
// @access  Private
exports.getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id)
    .populate('participants', 'name avatar')
    .populate('messages.sender', 'name avatar');

  if (!chat) {
    return res.status(404).json({ message: 'Chat not found' });
  }

  // Check if user is part of the chat
  if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
    return res.status(401).json({ message: 'Not authorized to access this chat' });
  }

  res.status(200).json(chat);
});

// @desc    Create new chat
// @route   POST /api/chat
// @access  Private
exports.createChat = asyncHandler(async (req, res) => {
  const { participantId } = req.body;

  // Check if chat already exists
  const existingChat = await Chat.findOne({
    participants: { $all: [req.user._id, participantId] },
  });

  if (existingChat) {
    return res.status(200).json(existingChat);
  }

  const chat = new Chat({
    participants: [req.user._id, participantId],
  });

  await chat.save();

  const populatedChat = await Chat.findById(chat._id)
    .populate('participants', 'name avatar');

  res.status(201).json(populatedChat);
});

// @desc    Send message
// @route   POST /api/chat/:id/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    return res.status(404).json({ message: 'Chat not found' });
  }

  // Check if user is part of the chat
  if (!chat.participants.includes(req.user._id)) {
    return res.status(401).json({ message: 'Not authorized to send messages in this chat' });
  }

  const message = {
    sender: req.user._id,
    content: req.body.content,
    timestamp: new Date(),
  };

  chat.messages.push(message);
  chat.lastMessage = message;
  chat.updatedAt = new Date();

  await chat.save();

  const populatedChat = await Chat.findById(chat._id)
    .populate('participants', 'name avatar')
    .populate('messages.sender', 'name avatar');

  res.status(201).json(populatedChat);
});

// @desc    Mark chat as read
// @route   PUT /api/chat/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    return res.status(404).json({ message: 'Chat not found' });
  }

  // Check if user is part of the chat
  if (!chat.participants.includes(req.user._id)) {
    return res.status(401).json({ message: 'Not authorized to update this chat' });
  }

  // Mark all messages as read for the current user
  chat.messages.forEach(message => {
    if (message.sender.toString() !== req.user._id.toString()) {
      message.read = true;
    }
  });

  await chat.save();

  res.status(200).json(chat);
}); 