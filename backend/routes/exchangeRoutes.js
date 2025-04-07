const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Exchange = require('../models/Exchange');
const User = require('../models/User');

// Find potential skill matches
router.get('/skills/matches/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's needed skills
    const neededSkills = user.skills.filter(skill => skill.type === 'needed').map(skill => skill.name);
    
    // Find users who have the needed skills as offered skills
    const potentialMatches = await User.find({
      _id: { $ne: user._id },
      'skills.name': { $in: neededSkills },
      'skills.type': 'offered'
    }).select('name profilePicture rating exchanges skills');

    // Format matches with matching skills
    const matches = potentialMatches.map(match => {
      const matchingSkills = match.skills
        .filter(skill => skill.type === 'offered' && neededSkills.includes(skill.name))
        .map(skill => skill.name);

      return {
        _id: match._id,
        user: {
          _id: match._id,
          name: match.name,
          profilePicture: match.profilePicture,
          rating: match.rating,
          exchanges: match.exchanges
        },
        matchingSkills
      };
    });

    res.json({ matches });
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initiate an exchange
router.post('/exchanges', protect, async (req, res) => {
  try {
    const { userId, matchId } = req.body;

    // Check if users exist
    const [user, match] = await Promise.all([
      User.findById(userId),
      User.findById(matchId)
    ]);

    if (!user || !match) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if exchange already exists
    const existingExchange = await Exchange.findOne({
      $or: [
        { initiator: userId, recipient: matchId, status: { $in: ['pending', 'accepted'] } },
        { initiator: matchId, recipient: userId, status: { $in: ['pending', 'accepted'] } }
      ]
    });

    if (existingExchange) {
      return res.status(400).json({ message: 'Exchange already exists' });
    }

    // Create new exchange
    const exchange = new Exchange({
      initiator: userId,
      recipient: matchId,
      status: 'pending',
      createdAt: new Date()
    });

    await exchange.save();

    res.json({ message: 'Exchange initiated successfully', exchange });
  } catch (error) {
    console.error('Error initiating exchange:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's active exchanges
router.get('/exchanges/user/:userId', protect, async (req, res) => {
  try {
    const exchanges = await Exchange.find({
      $or: [
        { initiator: req.params.userId },
        { recipient: req.params.userId }
      ],
      status: { $in: ['pending', 'accepted'] }
    })
    .populate('initiator', 'name profilePicture')
    .populate('recipient', 'name profilePicture')
    .sort({ createdAt: -1 });

    res.json({ exchanges });
  } catch (error) {
    console.error('Error getting exchanges:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept an exchange
router.put('/exchanges/:exchangeId/accept', protect, async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.exchangeId);
    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    if (exchange.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    exchange.status = 'accepted';
    exchange.acceptedAt = new Date();
    await exchange.save();

    res.json({ message: 'Exchange accepted successfully', exchange });
  } catch (error) {
    console.error('Error accepting exchange:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject an exchange
router.put('/exchanges/:exchangeId/reject', protect, async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.exchangeId);
    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    if (exchange.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    exchange.status = 'rejected';
    exchange.rejectedAt = new Date();
    await exchange.save();

    res.json({ message: 'Exchange rejected successfully', exchange });
  } catch (error) {
    console.error('Error rejecting exchange:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete an exchange
router.put('/exchanges/:exchangeId/complete', protect, async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.exchangeId);
    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    if (exchange.status !== 'accepted') {
      return res.status(400).json({ message: 'Exchange must be accepted first' });
    }

    if (exchange.initiator.toString() !== req.user.id && 
        exchange.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    exchange.status = 'completed';
    exchange.completedAt = new Date();
    await exchange.save();

    // Update user exchange counts
    await Promise.all([
      User.findByIdAndUpdate(exchange.initiator, { $inc: { exchanges: 1 } }),
      User.findByIdAndUpdate(exchange.recipient, { $inc: { exchanges: 1 } })
    ]);

    res.json({ message: 'Exchange completed successfully', exchange });
  } catch (error) {
    console.error('Error completing exchange:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rate an exchange
router.post('/exchanges/:exchangeId/rate', protect, async (req, res) => {
  try {
    const { rating } = req.body;
    const exchange = await Exchange.findById(req.params.exchangeId);
    
    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    if (exchange.status !== 'completed') {
      return res.status(400).json({ message: 'Exchange must be completed first' });
    }

    // Determine which user to rate
    const userToRate = exchange.initiator.toString() === req.user.id 
      ? exchange.recipient 
      : exchange.initiator;

    // Update user's rating
    const user = await User.findById(userToRate);
    const newRating = ((user.rating || 0) * (user.exchanges || 0) + rating) / ((user.exchanges || 0) + 1);
    
    await User.findByIdAndUpdate(userToRate, { 
      $set: { rating: newRating },
      $inc: { exchanges: 1 }
    });

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error rating exchange:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 