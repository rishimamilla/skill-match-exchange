const User = require('../models/User');
const Skill = require('../models/Skill');
const asyncHandler = require('../middleware/async');

// @desc    Search users with filters
// @route   GET /api/search/users
// @access  Private
exports.searchUsers = asyncHandler(async (req, res) => {
  const { query, skills, location, rating } = req.query;
  let searchQuery = {};

  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ];
  }

  if (skills) {
    searchQuery['skills.skill'] = { $in: skills.split(',') };
  }

  if (location) {
    searchQuery.location = { $regex: location, $options: 'i' };
  }

  if (rating) {
    searchQuery.rating = { $gte: parseFloat(rating) };
  }

  const users = await User.find(searchQuery)
    .select('-password')
    .limit(20);

  res.status(200).json(users);
});

// @desc    Search skills with filters
// @route   GET /api/search/skills
// @access  Private
exports.searchSkills = asyncHandler(async (req, res) => {
  const { query, category, difficulty, minRating } = req.query;
  let searchQuery = {};

  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ];
  }

  if (category) {
    searchQuery.category = category;
  }

  if (difficulty) {
    searchQuery.difficulty = difficulty;
  }

  if (minRating) {
    searchQuery.rating = { $gte: parseFloat(minRating) };
  }

  const skills = await Skill.find(searchQuery)
    .sort({ popularity: -1 })
    .limit(20);

  res.status(200).json(skills);
});

// @desc    Get search suggestions
// @route   GET /api/search/suggestions
// @access  Private
exports.getSuggestions = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(200).json([]);
  }

  const [userSuggestions, skillSuggestions] = await Promise.all([
    User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name email profilePicture')
    .limit(5),
    Skill.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name category')
    .limit(5)
  ]);

  const suggestions = [
    ...userSuggestions.map(user => ({
      type: 'user',
      id: user._id,
      name: user.name,
      image: user.profilePicture
    })),
    ...skillSuggestions.map(skill => ({
      type: 'skill',
      id: skill._id,
      name: skill.name,
      category: skill.category
    }))
  ];

  res.status(200).json(suggestions);
}); 