const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Exchange = require('../models/Exchange');
const User = require('../models/User');

// @desc    Get all exchanges for the current user
// @route   GET /api/exchanges
// @access  Private
router.get('/exchanges', protect, async (req, res) => {
  try {
    const exchanges = await Exchange.find({
      $or: [{ initiator: req.user._id }, { recipient: req.user._id }]
    })
    .populate('initiator', 'name profilePicture')
    .populate('recipient', 'name profilePicture')
    .populate('skillsOffered')
    .populate('skillsNeeded')
    .sort('-createdAt');

    res.json(exchanges);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a new exchange
// @route   POST /api/exchanges
// @access  Private
router.post('/exchanges', protect, async (req, res) => {
  try {
    const { recipientId, skillsOffered, skillsNeeded } = req.body;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if there's already a pending exchange between these users
    const existingExchange = await Exchange.findOne({
      $or: [
        { initiator: req.user._id, recipient: recipientId },
        { initiator: recipientId, recipient: req.user._id }
      ],
      status: 'pending'
    });

    if (existingExchange) {
      return res.status(400).json({ message: 'A pending exchange already exists with this user' });
    }

    // Create new exchange
    const exchange = await Exchange.create({
      initiator: req.user._id,
      recipient: recipientId,
      skillsOffered,
      skillsNeeded
    });

    // Populate the exchange with user and skill details
    await exchange.populate([
      { path: 'initiator', select: 'name profilePicture' },
      { path: 'recipient', select: 'name profilePicture' },
      { path: 'skillsOffered' },
      { path: 'skillsNeeded' }
    ]);

    res.status(201).json(exchange);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update exchange status
// @route   PUT /api/exchanges/:id
// @access  Private
router.put('/exchanges/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    // Check if user is part of the exchange
    if (exchange.initiator.toString() !== req.user._id.toString() && 
        exchange.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update status
    exchange.status = status;
    await exchange.save();

    // Populate the exchange with user and skill details
    await exchange.populate([
      { path: 'initiator', select: 'name profilePicture' },
      { path: 'recipient', select: 'name profilePicture' },
      { path: 'skillsOffered' },
      { path: 'skillsNeeded' }
    ]);

    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add rating to exchange
// @route   POST /api/exchanges/:id/rate
// @access  Private
router.post('/exchanges/:id/rate', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    // Check if user is part of the exchange
    if (exchange.initiator.toString() !== req.user._id.toString() && 
        exchange.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if exchange is completed
    if (exchange.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed exchanges' });
    }

    // Add rating
    if (exchange.initiator.toString() === req.user._id.toString()) {
      exchange.initiatorRating = { rating, comment, date: new Date() };
    } else {
      exchange.recipientRating = { rating, comment, date: new Date() };
    }

    await exchange.save();

    // Populate the exchange with user and skill details
    await exchange.populate([
      { path: 'initiator', select: 'name profilePicture' },
      { path: 'recipient', select: 'name profilePicture' },
      { path: 'skillsOffered' },
      { path: 'skillsNeeded' }
    ]);

    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 