const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Skill = require('../models/Skill');
const SkillExchange = require('../models/SkillExchange');

// @desc    Get skill matches for the current user
// @route   GET /api/matches
// @access  Private
router.get('/matches', protect, async (req, res) => {
  try {
    // Get current user's skills
    const currentUser = await User.findById(req.user._id)
      .populate('skillsOffered')
      .populate('skillsNeeded');

    // Find users who have skills that match current user's needed skills
    const matches = await User.find({
      _id: { $ne: req.user._id }, // Exclude current user
      'skillsOffered': { $in: currentUser.skillsNeeded.map(skill => skill._id) }
    })
    .populate('skillsOffered')
    .select('-password');

    // Calculate matching skills for each user
    const matchesWithSkills = matches.map(match => {
      const matchingSkills = match.skillsOffered.filter(skill =>
        currentUser.skillsNeeded.some(neededSkill =>
          neededSkill._id.toString() === skill._id.toString()
        )
      );

      return {
        user: match,
        matchingSkills,
        matchScore: matchingSkills.length / currentUser.skillsNeeded.length
      };
    });

    // Sort matches by match score
    const sortedMatches = matchesWithSkills.sort((a, b) => b.matchScore - a.matchScore);

    res.json(sortedMatches);
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get detailed match information
// @route   GET /api/matches/:userId
// @access  Private
router.get('/matches/:userId', protect, async (req, res) => {
  try {
    const match = await User.findById(req.params.userId)
      .populate('skillsOffered')
      .populate('skillsNeeded')
      .select('-password');

    if (!match) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id)
      .populate('skillsOffered')
      .populate('skillsNeeded');

    const matchingSkillsOffered = match.skillsOffered.filter(skill =>
      currentUser.skillsNeeded.some(neededSkill =>
        neededSkill._id.toString() === skill._id.toString()
      )
    );

    const matchingSkillsNeeded = match.skillsNeeded.filter(skill =>
      currentUser.skillsOffered.some(offeredSkill =>
        offeredSkill._id.toString() === skill._id.toString()
      )
    );

    res.json({
      user: match,
      matchingSkillsOffered,
      matchingSkillsNeeded,
      matchScore: {
        offered: matchingSkillsOffered.length / currentUser.skillsNeeded.length,
        needed: matchingSkillsNeeded.length / currentUser.skillsOffered.length
      }
    });
  } catch (error) {
    console.error('Error getting match details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's available skills for exchange
router.get('/user', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('offeredSkills');
    
    // Get active exchanges to filter out skills that are already in exchanges
    const activeExchanges = await SkillExchange.find({
      $or: [
        { initiator: req.user._id },
        { recipient: req.user._id }
      ],
      status: { $in: ['pending', 'accepted'] }
    });

    const skillsInExchanges = new Set(
      activeExchanges.flatMap(exchange => 
        exchange.initiator.toString() === req.user._id.toString()
          ? exchange.offeredSkills
          : exchange.requestedSkills
      )
    );

    // Filter out skills that are already in active exchanges
    const availableSkills = user.offeredSkills.filter(skill =>
      !skillsInExchanges.has(skill._id.toString())
    );

    res.json(availableSkills);
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).json({ message: 'Error fetching available skills' });
  }
});

module.exports = router; 