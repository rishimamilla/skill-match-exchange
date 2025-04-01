const Skill = require('../models/Skill');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
exports.getSkills = asyncHandler(async (req, res) => {
  const { category, difficulty, search } = req.query;
  let query = {};

  if (category) {
    query.category = category;
  }

  if (difficulty) {
    query.difficulty = difficulty;
  }

  if (search) {
    query.$text = { $search: search };
  }

  const skills = await Skill.find(query).sort({ popularity: -1 });
  res.status(200).json(skills);
});

// @desc    Get skill by ID
// @route   GET /api/skills/:id
// @access  Public
exports.getSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    return res.status(404).json({ message: 'Skill not found' });
  }
  res.status(200).json(skill);
});

// @desc    Create new skill
// @route   POST /api/skills
// @access  Private/Admin
exports.createSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.create(req.body);
  res.status(201).json(skill);
});

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private/Admin
exports.updateSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!skill) {
    return res.status(404).json({ message: 'Skill not found' });
  }
  res.status(200).json(skill);
});

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private/Admin
exports.deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndDelete(req.params.id);
  if (!skill) {
    return res.status(404).json({ message: 'Skill not found' });
  }
  res.status(200).json({ message: 'Skill deleted successfully' });
});

// @desc    Get skill matches for a user
// @route   GET /api/skills/matches/:userId
// @access  Private
exports.getSkillMatches = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Get user's skills and interests
  const userTeachingSkills = user.skills.filter(s => s.status === 'teaching').map(s => s.skill);
  const userLearningSkills = user.skills.filter(s => s.status === 'learning').map(s => s.skill);

  // Find potential matches based on skills and interests
  const matches = await User.find({
    _id: { $ne: user._id },
    $or: [
      { 'skills.skill': { $in: userLearningSkills }, 'skills.status': 'teaching' },
      { 'skills.skill': { $in: userTeachingSkills }, 'skills.status': 'learning' }
    ]
  })
  .select('name email location skills rating profilePicture')
  .limit(10);

  // Calculate match score for each potential match
  const scoredMatches = matches.map(match => {
    let score = 0;
    
    // Calculate skill match score
    const teachingMatches = match.skills.filter(matchSkill => 
      matchSkill.status === 'teaching' && 
      userLearningSkills.includes(matchSkill.skill)
    ).length;
    score += teachingMatches * 2;

    // Calculate learning match score
    const learningMatches = match.skills.filter(matchSkill => 
      matchSkill.status === 'learning' && 
      userTeachingSkills.includes(matchSkill.skill)
    ).length;
    score += learningMatches;

    // Add rating bonus
    score += match.rating || 0;

    return {
      ...match.toObject(),
      matchScore: score
    };
  });

  // Sort matches by score
  scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

  res.status(200).json(scoredMatches);
});

// @desc    Add skill to user profile
// @route   POST /api/skills/user/:userId
// @access  Private
exports.addUserSkill = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { skill, level, yearsOfExperience } = req.body;

  // Check if skill exists
  const skillExists = await Skill.findOne({ name: skill });
  if (!skillExists) {
    return res.status(404).json({ message: 'Skill not found' });
  }

  // Add skill to user's skills array
  user.skills.push({
    skill,
    level,
    yearsOfExperience
  });

  // Update skill popularity
  await Skill.findOneAndUpdate(
    { name: skill },
    { $inc: { popularity: 1 } }
  );

  await user.save();
  res.status(200).json(user);
});

// @desc    Find skill matches for current user
// @route   GET /api/skills/matches
// @access  Private
exports.findMatches = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Get user's skills and interests
  const userTeachingSkills = user.skills.filter(s => s.status === 'teaching').map(s => s.skill);
  const userLearningSkills = user.skills.filter(s => s.status === 'learning').map(s => s.skill);

  // Find potential matches based on skills and interests
  const matches = await User.find({
    _id: { $ne: user._id },
    $or: [
      { 'skills.skill': { $in: userLearningSkills }, 'skills.status': 'teaching' },
      { 'skills.skill': { $in: userTeachingSkills }, 'skills.status': 'learning' }
    ]
  })
  .select('name email location skills rating profilePicture')
  .limit(10);

  // Calculate match score for each potential match
  const scoredMatches = matches.map(match => {
    let score = 0;
    
    // Calculate skill match score
    const teachingMatches = match.skills.filter(matchSkill => 
      matchSkill.status === 'teaching' && 
      userLearningSkills.includes(matchSkill.skill)
    ).length;
    score += teachingMatches * 2;

    // Calculate learning match score
    const learningMatches = match.skills.filter(matchSkill => 
      matchSkill.status === 'learning' && 
      userTeachingSkills.includes(matchSkill.skill)
    ).length;
    score += learningMatches;

    // Add rating bonus
    score += match.rating || 0;

    return {
      ...match.toObject(),
      matchScore: score
    };
  });

  // Sort matches by score
  scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

  res.status(200).json(scoredMatches);
});

// @desc    Add a review to a skill
// @route   POST /api/skills/:id/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    return res.status(404).json({ message: 'Skill not found' });
  }

  const { rating, comment } = req.body;

  // Create review
  const review = {
    user: req.user._id,
    rating,
    comment,
    date: Date.now()
  };

  // Add review to skill
  skill.reviews.push(review);

  // Update skill rating
  const totalRating = skill.reviews.reduce((acc, review) => acc + review.rating, 0);
  skill.rating = totalRating / skill.reviews.length;

  await skill.save();
  res.status(201).json(skill);
}); 