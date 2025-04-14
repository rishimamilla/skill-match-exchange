const Chat = require('../models/Chat');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const { getIo } = require('../config/socket');
const { sendNotification } = require('../services/notificationService');

// @desc    Get all chats for a user
// @route   GET /api/chat
// @access  Private
exports.getUserChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .populate('participants', 'name profilePicture')
    .populate('messages.sender', 'name profilePicture')
    .sort({ updatedAt: -1 });

  res.json(chats);
});

// @desc    Get chat by ID
// @route   GET /api/chat/:id
// @access  Private
exports.getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id)
    .populate('participants', 'name profilePicture')
    .populate('messages.sender', 'name profilePicture');

  if (!chat) {
    return res.status(404).json({ message: 'Chat not found' });
  }

  if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
    return res.status(403).json({ message: 'Not authorized to access this chat' });
  }

  res.json(chat);
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

// @desc    Get or create a chat with another user
// @route   POST /api/chat
// @access  Private
exports.getOrCreateChat = asyncHandler(async (req, res) => {
  const { userId, participantId } = req.body;
  const targetUserId = userId || participantId;
  
  if (!targetUserId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  // Find the other user
  const otherUser = await User.findById(targetUserId);
  if (!otherUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  console.log(`Looking for chat between users: ${req.user._id} and ${targetUserId}`);

  // First, try to find an existing chat
  let chat = await Chat.findOne({
    participants: { $all: [req.user._id, targetUserId] }
  }).populate('participants', 'name profilePicture')
    .populate('messages.sender', 'name profilePicture');

  // If no chat exists, create a new one
  if (!chat) {
    console.log('No existing chat found, creating a new one');
    
    // Initialize unreadCount for both participants
    const unreadCount = new Map();
    unreadCount.set(req.user._id.toString(), 0);
    unreadCount.set(targetUserId.toString(), 0);

    // Create a new chat
    chat = await Chat.create({
      participants: [req.user._id, targetUserId],
      messages: [],
      unreadCount
    });
    
    // Populate the participants
    chat = await Chat.findById(chat._id)
      .populate('participants', 'name profilePicture')
      .populate('messages.sender', 'name profilePicture');
    
    if (!chat) {
      return res.status(500).json({ message: 'Failed to create chat' });
    }

    // Verify both participants are in the chat
    const participantIds = chat.participants.map(p => p._id.toString());
    if (!participantIds.includes(req.user._id.toString()) || !participantIds.includes(targetUserId.toString())) {
      await Chat.findByIdAndDelete(chat._id);
      return res.status(500).json({ message: 'Failed to create chat: Invalid participants' });
    }
    
    console.log('New chat created:', chat._id);
  } else {
    console.log('Existing chat found:', chat._id);
  }

  // Return the chat
  res.json(chat);
});

// @desc    Send message in a chat
// @route   POST /api/chat/:id/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
  try {
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    const { content } = req.body;
    const chatId = req.params.id;

    console.log(`Attempting to send message to chat ${chatId} with content: ${content}`);

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Validate chat ID format
    if (!chatId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid chat ID format' });
    }

    const chat = await Chat.findById(chatId)
      .populate('participants', 'name profilePicture');

    if (!chat) {
      console.log(`Chat with ID ${chatId} not found`);
      return res.status(404).json({ 
        message: 'Chat not found',
        details: 'The chat you are trying to send a message to does not exist. Please create a new chat first.'
      });
    }

    // Check if user is a participant in the chat
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      console.log(`User ${req.user._id} is not a participant in chat ${chatId}`);
      return res.status(403).json({ 
        message: 'Not authorized to send messages in this chat',
        details: 'You are not a participant in this chat.'
      });
    }

    // Create a new message object
    const newMessage = {
      sender: req.user._id,
      content: content,
      timestamp: new Date(),
      read: false
    };

    // Add the message to the chat
    chat.messages.push(newMessage);
    
    // Update the lastMessage field with the current date
    chat.lastMessage = new Date();
    
    // Save the chat
    await chat.save();
    
    console.log('Chat saved successfully with new message');

    // Get the current user's data from the participants array
    const currentUser = chat.participants.find(p => p._id.toString() === req.user._id.toString());
    
    // Create a response object with the message and sender info
    const responseMessage = {
      _id: chat.messages[chat.messages.length - 1]._id,
      sender: {
        _id: req.user._id,
        name: currentUser?.name || 'Unknown User',
        profilePicture: currentUser?.profilePicture || null
      },
      content: content,
      timestamp: newMessage.timestamp,
      read: false
    };

    // Get the socket instance
    const io = req.app.get('io');
    
    // Emit the new message to all participants in the chat
    const room = `chat:${chatId}`;
    io.to(room).emit('newMessage', {
      chatId,
      message: responseMessage,
      sender: {
        _id: req.user._id,
        name: currentUser?.name || 'Unknown User',
        profilePicture: currentUser?.profilePicture || null
      }
    });

    console.log(`Message sent successfully to chat ${chatId}`);
    res.status(201).json(responseMessage);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error sending message', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    Mark messages as read
// @route   PUT /api/chat/:id/read
// @access  Private
exports.markMessagesAsRead = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    return res.status(404).json({ message: 'Chat not found' });
  }

  if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
    return res.status(403).json({ message: 'Not authorized to access this chat' });
  }

  // Reset unread count for the current user
  chat.unreadCount.set(req.user._id.toString(), 0);

  // Mark messages as read
  chat.messages.forEach(message => {
    if (message.sender.toString() !== req.user._id.toString()) {
      message.read = true;
    }
  });

  await chat.save();

  // Emit messageRead event to all participants
  const io = req.app.get('io');
  const room = `chat:${chat._id}`;
  io.to(room).emit('messageRead', {
    chatId: chat._id,
    userId: req.user._id
  });

  const populatedChat = await Chat.findById(chat._id)
    .populate('participants', 'name profilePicture')
    .populate('messages.sender', 'name profilePicture');

  res.json(populatedChat);
}); 