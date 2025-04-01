const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json(user);
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if user is updating their own profile
  if (user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this profile' });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json(updatedUser);
});

// @desc    Get user skills
// @route   GET /api/users/:id/skills
// @access  Private
exports.getUserSkills = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('skills');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json(user.skills);
});

// @desc    Get user matches
// @route   GET /api/users/:id/matches
// @access  Private
exports.getUserMatches = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Get user's skills and interests
  const userSkills = user.skills.map(s => s.skill);
  const userInterests = user.interests;

  // Find potential matches based on skills and interests
  const matches = await User.find({
    _id: { $ne: user._id },
    $or: [
      { 'skills.skill': { $in: userInterests } },
      { interests: { $in: userSkills } }
    ]
  })
  .select('name email location skills interests rating profilePicture')
  .limit(10);

  // Calculate match score for each potential match
  const scoredMatches = matches.map(match => {
    let score = 0;
    
    // Calculate skill match score
    const skillMatches = match.skills.filter(matchSkill => 
      userInterests.includes(matchSkill.skill)
    ).length;
    score += skillMatches * 2;

    // Calculate interest match score
    const interestMatches = match.interests.filter(interest => 
      userSkills.includes(interest)
    ).length;
    score += interestMatches;

    // Add rating bonus
    score += match.rating;

    return {
      user: match,
      matchScore: score
    };
  });

  // Sort matches by score
  scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

  res.status(200).json(scoredMatches);
}); 