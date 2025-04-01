const express = require('express');
const { check } = require('express-validator');
const {
  createSkill,
  getSkills,
  getSkill,
  updateSkill,
  deleteSkill,
  getSkillMatches,
  addUserSkill,
  findMatches,
  addReview,
} = require('../controllers/skillController');
const { protect, verifySkillOwner, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getSkills);
router.get('/:id', getSkill);

// Protected routes
router.post('/user/:userId', protect, addUserSkill);
router.get('/matches/:userId', protect, getSkillMatches);

// Admin routes
router.post('/', protect, authorize('admin'), createSkill);
router.put('/:id', protect, authorize('admin'), updateSkill);
router.delete('/:id', protect, authorize('admin'), deleteSkill);

// @route   GET /api/skills/matches
router.get('/matches', protect, findMatches);

// @route   POST /api/skills/:id/reviews
router.post(
  '/:id/reviews',
  protect,
  [
    check('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').not().isEmpty(),
  ],
  addReview
);

module.exports = router;