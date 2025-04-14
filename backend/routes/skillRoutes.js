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
  removeEndorsement,
  updateUserSkill,
  removeUserSkill
} = require('../controllers/skillController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    query: req.query,
    params: req.params,
    body: req.body,
    user: req.user ? { id: req.user._id } : null
  });
  next();
});

// Public routes
router.get('/', getSkills);
router.get('/search', searchSkills);

// Protected routes - specific routes first
router.get('/matches', protect, findMatches);
router.get('/matches/:userId', protect, getSkillMatches);

// User skill routes
router.post('/user', protect, addUserSkill);
router.delete('/user/:skillName', protect, removeUserSkill);
router.put('/user/:skillName', protect, updateUserSkill);

// Review and endorsement routes
router.post('/:id/reviews', protect, addReview);
router.post('/:id/endorse', protect, endorseSkill);
router.delete('/:id/endorse/:userId', protect, removeEndorsement);

// Admin routes
router.post('/', protect, authorize('admin'), createSkill);
router.put('/:id', protect, authorize('admin'), updateSkill);
router.delete('/:id', protect, authorize('admin'), deleteSkill);

// Generic routes last
router.get('/:id', getSkill);

module.exports = router;