const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Exchange = require('../models/Exchange');
const User = require('../models/User');

// Get user's recent activity
router.get('/activity/:userId', protect, async (req, res) => {
  try {
    // Get recent exchanges
    const exchanges = await Exchange.find({
      $or: [
        { initiator: req.params.userId },
        { recipient: req.params.userId }
      ]
    })
    .populate('initiator', 'name profilePicture')
    .populate('recipient', 'name profilePicture')
    .sort({ createdAt: -1 })
    .limit(10);

    // Format activity items
    const activity = exchanges.map(exchange => ({
      id: exchange._id,
      type: 'exchange',
      status: exchange.status,
      date: exchange.createdAt,
      details: {
        initiator: exchange.initiator,
        recipient: exchange.recipient,
        status: exchange.status,
        createdAt: exchange.createdAt,
        completedAt: exchange.completedAt
      }
    }));

    res.json({ activity });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's statistics
router.get('/stats/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all exchanges for the user
    const exchanges = await Exchange.find({
      $or: [
        { initiator: req.params.userId },
        { recipient: req.params.userId }
      ]
    });

    // Calculate statistics
    const stats = {
      totalExchanges: exchanges.length,
      activeExchanges: exchanges.filter(ex => ex.status === 'accepted').length,
      pendingExchanges: exchanges.filter(ex => ex.status === 'pending').length,
      completedExchanges: exchanges.filter(ex => ex.status === 'completed').length,
      averageRating: user.rating || 0,
      skillsOffered: user.skills.filter(skill => skill.type === 'offered').length,
      skillsNeeded: user.skills.filter(skill => skill.type === 'needed').length
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 