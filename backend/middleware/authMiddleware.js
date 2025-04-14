const jwt = require("jsonwebtoken");
const User = require('../models/User');
const Skill = require('../models/Skill');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found:', token.substring(0, 10) + '...');
    } else {
      console.log('No authorization header found');
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    if (!token) {
      console.log('No token found in authorization header');
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', { id: decoded.id });

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        console.log('User not found for token');
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('User authenticated:', { id: user._id, name: user.name });
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log('Unauthorized role:', { userRole: req.user.role, requiredRoles: roles });
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    console.log('Unauthorized admin access:', { userId: req.user?._id });
    res.status(401).json({ message: 'Not authorized as admin' });
  }
};

const verifySkillOwner = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      console.log('Skill not found:', req.params.id);
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (skill.owner.toString() !== req.user._id.toString()) {
      console.log('Unauthorized skill access:', { 
        skillId: skill._id, 
        userId: req.user._id, 
        ownerId: skill.owner 
      });
      return res.status(401).json({ message: 'Not authorized to modify this skill' });
    }

    next();
  } catch (error) {
    console.error('Skill owner verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  protect,
  authorize,
  verifyAdmin,
  verifySkillOwner,
};