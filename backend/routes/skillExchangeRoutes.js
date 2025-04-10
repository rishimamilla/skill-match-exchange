const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const SkillExchange = require('../models/SkillExchange');
const User = require('../models/User');
const Skill = require('../models/Skill');

// Create a new skill exchange
router.post('/exchange', protect, async (req, res) => {
  try {
    const { recipientId, offeredSkillIds, requestedSkillIds } = req.body;

    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Validate skills exist and belong to users
    const offeredSkills = await Skill.find({
      _id: { $in: offeredSkillIds },
      user: req.user._id
    });

    const requestedSkills = await Skill.find({
      _id: { $in: requestedSkillIds },
      user: recipientId
    });

    if (offeredSkills.length !== offeredSkillIds.length) {
      return res.status(400).json({ message: 'Invalid offered skills' });
    }

    if (requestedSkills.length !== requestedSkillIds.length) {
      return res.status(400).json({ message: 'Invalid requested skills' });
    }

    // Check if skills are already in active exchanges
    const activeExchanges = await SkillExchange.find({
      $or: [
        { offeredSkills: { $in: offeredSkillIds } },
        { requestedSkills: { $in: requestedSkillIds } }
      ],
      status: { $in: ['pending', 'accepted'] }
    });

    if (activeExchanges.length > 0) {
      return res.status(400).json({ message: 'One or more skills are already in active exchanges' });
    }

    // Create the exchange
    const exchange = await SkillExchange.create({
      initiator: req.user._id,
      recipient: recipientId,
      offeredSkills: offeredSkillIds,
      requestedSkills: requestedSkillIds
    });

    const populatedExchange = await SkillExchange.findById(exchange._id)
      .populate('initiator', 'name profilePicture')
      .populate('recipient', 'name profilePicture')
      .populate('offeredSkills')
      .populate('requestedSkills');

    // Emit socket event for real-time updates
    req.app.get('io').to(recipientId).emit('newExchange', populatedExchange);

    res.status(201).json(populatedExchange);
  } catch (error) {
    res.status(500).json({ message: 'Error creating exchange' });
  }
});

// Get all exchanges for a user
router.get('/exchanges', protect, async (req, res) => {
  try {
    const exchanges = await SkillExchange.find({
      $or: [{ initiator: req.user._id }, { recipient: req.user._id }]
    })
      .populate('initiator', 'name profilePicture')
      .populate('recipient', 'name profilePicture')
      .populate('offeredSkills')
      .populate('requestedSkills')
      .sort({ createdAt: -1 });

    res.json(exchanges);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exchanges' });
  }
});

// Update exchange status
router.put('/exchange/:exchangeId/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const exchange = await SkillExchange.findById(req.params.exchangeId);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    // Verify user is the recipient
    if (exchange.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this exchange' });
    }

    // Update status
    exchange.status = status;
    if (status === 'completed') {
      exchange.completionDate = new Date();
    }

    await exchange.save();

    const populatedExchange = await SkillExchange.findById(exchange._id)
      .populate('initiator', 'name profilePicture')
      .populate('recipient', 'name profilePicture')
      .populate('offeredSkills')
      .populate('requestedSkills');

    // Emit socket event for real-time updates
    req.app.get('io').to(exchange.initiator.toString()).emit('exchangeUpdated', populatedExchange);

    res.json(populatedExchange);
  } catch (error) {
    res.status(500).json({ message: 'Error updating exchange' });
  }
});

// Add rating to exchange
router.post('/exchange/:exchangeId/rate', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const exchange = await SkillExchange.findById(req.params.exchangeId);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    if (exchange.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed exchanges' });
    }

    // Determine if user is initiator or recipient
    const isInitiator = exchange.initiator.toString() === req.user._id.toString();
    const ratingField = isInitiator ? 'initiatorRating' : 'recipientRating';

    // Check if already rated
    if (exchange[ratingField].rating) {
      return res.status(400).json({ message: 'Already rated this exchange' });
    }

    // Add rating
    exchange[ratingField] = {
      rating,
      comment,
      date: new Date()
    };

    await exchange.save();

    const populatedExchange = await SkillExchange.findById(exchange._id)
      .populate('initiator', 'name profilePicture')
      .populate('recipient', 'name profilePicture')
      .populate('offeredSkills')
      .populate('requestedSkills');

    // Emit socket event for real-time updates
    const otherUserId = isInitiator ? exchange.recipient : exchange.initiator;
    req.app.get('io').to(otherUserId.toString()).emit('exchangeRated', populatedExchange);

    res.json(populatedExchange);
  } catch (error) {
    res.status(500).json({ message: 'Error adding rating' });
  }
});

module.exports = router; 