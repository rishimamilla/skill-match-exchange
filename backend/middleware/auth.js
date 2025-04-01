const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Skill = require('../models/Skill');

// @desc    Protect routes
exports.protect = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// @desc    Verify skill owner
exports.verifySkillOwner = async (req, res, next) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    return res.status(404).json({ message: 'Skill not found' });
  }

  if (skill.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to perform this action' });
  }

  next();
};

// @desc    Authorize roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
}; 