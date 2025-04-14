const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('reviews.user', 'name profilePicture')
      .populate('endorsements.endorser', 'name profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Transform skills into teachingSkills and learningSkills format
    const teachingSkills = user.skills
      .filter(skill => skill.status === 'teaching')
      .map(skill => ({
        name: skill.skill,
        level: skill.level,
        description: skill.description || '',
        category: skill.category || 'Other',
        yearsOfExperience: skill.yearsOfExperience || 0,
        certifications: skill.certifications || [],
        priority: skill.priority || 'Medium',
        rating: skill.rating || 0
      }));

    const learningSkills = user.skills
      .filter(skill => skill.status === 'learning')
      .map(skill => ({
        name: skill.skill,
        level: skill.level,
        description: skill.description || '',
        category: skill.category || 'Other',
        yearsOfExperience: skill.yearsOfExperience || 0,
        certifications: skill.certifications || [],
        priority: skill.priority || 'Medium',
        rating: skill.rating || 0
      }));

    // Format the response
    const profile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      profilePicture: user.profilePicture || '',
      location: user.location || '',
      socialLinks: user.socialLinks || {},
      teachingSkills: teachingSkills,
      learningSkills: learningSkills,
      interests: user.interests || [],
      achievements: user.achievements || [],
      rating: user.rating || 0,
      numReviews: user.numReviews || 0,
      totalExchanges: user.totalExchanges || 0,
      isVerified: user.isVerified || false,
      reviews: user.reviews || [],
      endorsements: user.endorsements || [],
      createdAt: user.createdAt,
      lastActive: user.lastActive
    };

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
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
    // Find matching skills
    const matchingSkills = match.skills.filter(matchSkill => 
      userInterests.includes(matchSkill.skill)
    );

    // Find matching interests
    const matchingInterests = match.interests.filter(interest => 
      userSkills.includes(interest)
    );

    // Calculate total score
    const skillScore = matchingSkills.length * 2;
    const interestScore = matchingInterests.length;
    const ratingBonus = match.rating;
    const totalScore = skillScore + interestScore + ratingBonus;

    // Calculate match percentage (max score is 30: 10 skills * 2 + 10 interests + 10 rating)
    const matchPercentage = (totalScore / 30) * 100;

    return {
      user: {
        _id: match._id,
        name: match.name,
        email: match.email,
        location: match.location,
        profilePicture: match.profilePicture,
        rating: match.rating,
        skills: match.skills.map(skill => ({
          skill: skill.skill,
          status: skill.status,
          level: skill.level,
          description: skill.description
        }))
      },
      matchingSkills: matchingSkills.map(skill => ({
        name: skill.skill,
        level: skill.level,
        status: skill.status
      })),
      matchingInterests: matchingInterests,
      matchScore: matchPercentage
    };
  });

  // Sort matches by score
  scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

  res.status(200).json(scoredMatches);
}); 