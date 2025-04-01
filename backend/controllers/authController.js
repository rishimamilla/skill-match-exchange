const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validationResult } = require('express-validator');
const upload = require('../middleware/uploadMiddleware');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, location } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    user = new User({
      name,
      email,
      password,
      location,
      profilePicture: '/uploads/profiles/default-avatar.png' // Default avatar path
    });

    await user.save();

    // Create token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        location: user.location
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user and select only necessary fields
    const user = await User.findOne({ email })
      .select('+password name email profilePicture location')
      .lean();

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = generateToken(user._id);

    // Remove password from response
    delete user.password;

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, location, bio, interests, skills, endorsements } = req.body;

    // If email is being updated, check if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }

    // Update user fields
    if (name) user.name = name.trim();
    if (email) user.email = email.trim();
    if (location) user.location = location.trim();
    if (bio) user.bio = bio.trim();
    
    // Parse and update arrays if they exist
    if (interests) {
      try {
        user.interests = JSON.parse(interests);
      } catch (e) {
        user.interests = interests;
      }
    }
    if (skills) {
      try {
        user.skills = JSON.parse(skills);
      } catch (e) {
        user.skills = skills;
      }
    }
    if (endorsements) {
      try {
        user.endorsements = JSON.parse(endorsements);
      } catch (e) {
        user.endorsements = endorsements;
      }
    }

    // Update profile picture if a new one is uploaded
    if (req.file) {
      const filePath = req.file.path.replace(/\\/g, '/');
      user.profilePicture = filePath.replace('uploads', '');
    }

    // Save the updated user
    await user.save();

    // Return the updated user data
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      location: user.location,
      bio: user.bio,
      interests: user.interests,
      skills: user.skills,
      endorsements: user.endorsements
    });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email is already taken' });
    }
    res.status(500).json({ 
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // TODO: Send reset email
    // For now, just return the token
    res.json({ message: 'Password reset token generated', resetToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};