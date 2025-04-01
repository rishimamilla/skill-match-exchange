const express = require('express');
const router = express.Router();
const { searchUsers, searchSkills, getSuggestions } = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

// Search users with filters
router.get('/users', protect, searchUsers);

// Search skills with filters
router.get('/skills', protect, searchSkills);

// Get search suggestions
router.get('/suggestions', protect, getSuggestions);

module.exports = router; 