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
  searchSkills,
  endorseSkill,
  removeEndorsement
} = require('../controllers/skillController');
const { protect, verifySkillOwner, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getSkills);
router.get('/search', searchSkills);

// Protected routes
router.get('/matches', protect, findMatches);
router.get('/matches/:userId', protect, getSkillMatches);
router.post('/user/:userId', protect, addUserSkill);

// Endorsement routes
router.post('/:id/endorse', protect, endorseSkill);
router.delete('/:id/endorse/:userId', protect, removeEndorsement);

// Admin routes
router.post('/', protect, authorize('admin'), createSkill);
router.put('/:id', protect, authorize('admin'), updateSkill);
router.delete('/:id', protect, authorize('admin'), deleteSkill);

// Other routes
router.get('/:id', getSkill);
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