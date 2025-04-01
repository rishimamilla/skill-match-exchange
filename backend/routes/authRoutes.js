const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { check } = require('express-validator');
const upload = require('../middleware/uploadMiddleware');
const {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Register User (without profile picture)
router.post("/register", [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 8 or more characters').isLength({
    min: 8,
  }),
  check('location', 'Location is required').not().isEmpty(),
], register);

// Login User
router.post("/login", [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
], login);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

module.exports = router;