const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserProfile, updateUserProfile, getUserSkills, getUserMatches } = require('../controllers/userController');

// User profile routes
router.get('/:id', protect, getUserProfile);
router.put('/:id', protect, updateUserProfile);

// User skills routes
router.get('/:id/skills', protect, getUserSkills);

// User matches routes
router.get('/:id/matches', protect, getUserMatches);

module.exports = router; 