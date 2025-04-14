const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get enhanced matches for the current user
// @route   GET /api/matches/enhanced
// @access  Private
router.get('/enhanced', protect, matchController.getEnhancedMatches);

// @desc    Get detailed match information for a specific match
// @route   GET /api/matches/:matchId/details
// @access  Private
router.get('/:matchId/details', protect, matchController.getMatchDetails);

// @desc    Get match details for a specific user
// @route   GET /api/matches/:userId
// @access  Private
router.get('/:userId', protect, matchController.getMatchDetails);

module.exports = router; 