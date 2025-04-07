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
  try {
    console.log('Adding skill to user profile:', req.params.userId, req.body);
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { skill, level, yearsOfExperience, status, category } = req.body;
    
    if (!skill || !level || !yearsOfExperience || !status) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['skill', 'level', 'yearsOfExperience', 'status'],
        received: { skill, level, yearsOfExperience, status }
      });
    }

    // Check if skill already exists in user's skills
    const existingSkill = user.skills.find(s => 
      s.skill.toLowerCase() === skill.toLowerCase() && 
      s.status === status
    );

    if (existingSkill) {
      return res.status(400).json({ message: 'Skill already exists in your profile' });
    }

    // Add skill to user's skills array
    const newSkill = {
      skill,
      level,
      yearsOfExperience: Number(yearsOfExperience),
      status,
      category: category || 'Other' // Add category field with default value
    };

    user.skills.push(newSkill);

    // Update skill popularity if it exists
    try {
      const existingSkillDoc = await Skill.findOne({ name: skill });
      if (existingSkillDoc) {
        await Skill.findOneAndUpdate(
          { name: skill },
          { 
            $inc: { popularity: 1 },
            $set: { category: category || existingSkillDoc.category || 'Other' }
          }
        );
      } else {
        // Create new skill if it doesn't exist
        await Skill.create({
          name: skill,
          category: category || 'Other', // Use provided category or default
          description: `${skill} skill`,
          difficulty: level,
          owner: user._id,
          location: user.location, // Use user's location
          preferredExchange: 'Flexible', // Default value
          duration: '1-2 hours', // Default value
          isRemote: true // Default to remote
        });
      }
    } catch (skillError) {
      console.error('Error updating skill document:', skillError);
      // Continue even if skill document update fails
    }

    // Save the user with new skill
    const savedUser = await user.save();
    console.log('Skill added successfully:', savedUser.skills[savedUser.skills.length - 1]);
    
    // Return the updated user without sensitive information
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpire;
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error in addUserSkill:', error);
    res.status(500).json({ 
      message: 'Error adding skill to profile',
      error: error.message
    });
  }
});

// @desc    Find skill matches for current user
// @route   GET /api/skills/matches
// @access  Private
exports.findMatches = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

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

// @desc    Endorse a skill
// @route   POST /api/skills/:id/endorse
// @access  Private
exports.endorseSkill = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  
  // Find the user who owns the skill
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Find the skill
  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    return res.status(404).json({ message: 'Skill not found' });
  }

  // Check if the user already has an endorsement for this skill
  const existingEndorsement = user.endorsements.find(
    endorsement => endorsement.skill.toString() === skill._id.toString()
  );

  if (existingEndorsement) {
    return res.status(400).json({ message: 'Skill already endorsed' });
  }

  // Add endorsement to user
  user.endorsements.push({
    skill: skill._id,
    endorser: req.user._id,
    date: Date.now()
  });

  // Update skill popularity
  skill.popularity += 1;

  // Save changes
  await user.save();
  await skill.save();

  res.status(200).json({
    message: 'Skill endorsed successfully',
    endorsements: user.endorsements
  });
});

// @desc    Remove endorsement from a skill
// @route   DELETE /api/skills/:id/endorse/:userId
// @access  Private
exports.removeEndorsement = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Find the user who owns the skill
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Find the skill
  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    return res.status(404).json({ message: 'Skill not found' });
  }

  // Find and remove the endorsement
  const endorsementIndex = user.endorsements.findIndex(
    endorsement => 
      endorsement.skill.toString() === skill._id.toString() && 
      endorsement.endorser.toString() === req.user._id.toString()
  );

  if (endorsementIndex === -1) {
    return res.status(404).json({ message: 'Endorsement not found' });
  }

  // Remove endorsement
  user.endorsements.splice(endorsementIndex, 1);

  // Update skill popularity
  skill.popularity = Math.max(0, skill.popularity - 1);

  // Save changes
  await user.save();
  await skill.save();

  res.status(200).json({
    message: 'Endorsement removed successfully',
    endorsements: user.endorsements
  });
});

// @desc    Search skills with filters
// @route   GET /api/skills/search
// @access  Public
exports.searchSkills = asyncHandler(async (req, res) => {
  try {
    const { q, category, difficulty, minRating, sortBy = 'relevance' } = req.query;
    let query = {};
    let sortOptions = {};

    // Text search with improved relevance scoring
    if (q) {
      // First, get skills matching the text search
      const textSearchResults = await Skill.find(
        { $text: { $search: q } },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } });

      // Calculate custom relevance scores
      const scoredSkills = textSearchResults.map(skill => ({
        skill,
        score: skill.calculateSearchScore(q)
      }));

      // Sort by custom score
      scoredSkills.sort((a, b) => b.score - a.score);

      // Get skill IDs in order of relevance
      const skillIds = scoredSkills.map(item => item.skill._id);
      query._id = { $in: skillIds };
    }

    // Category filter
    if (category && category !== '') {
      query.category = category;
    }

    // Difficulty filter
    if (difficulty && difficulty !== '') {
      query.difficulty = difficulty;
    }

    // Minimum rating filter
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Determine sort order
    switch (sortBy) {
      case 'popularity':
        sortOptions = { popularity: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        // For relevance sorting, maintain the order from text search
        if (q) {
          sortOptions = { $natural: 1 }; // Maintain the order from text search
        } else {
          sortOptions = { popularity: -1, rating: -1, createdAt: -1 };
        }
    }

    console.log('Search query:', query);
    console.log('Sort options:', sortOptions);

    // Find skills with pagination and sorting
    const skills = await Skill.find(query)
      .sort(sortOptions)
      .limit(20)
      .select('name description category difficulty rating popularity duration tags subcategories');

    // Get total count for pagination
    const total = await Skill.countDocuments(query);

    // Return consistent response format with metadata
    res.status(200).json({
      success: true,
      count: skills.length,
      total,
      data: skills,
      metadata: {
        filters: {
          category,
          difficulty,
          minRating
        },
        sortBy,
        searchTerm: q
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching skills', 
      error: error.message 
    });
  }
});