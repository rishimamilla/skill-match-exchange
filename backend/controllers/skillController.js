const Skill = require('../models/Skill');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc    Get all skills
// @route   GET /api/skills
// @access  Private
exports.getSkills = asyncHandler(async (req, res) => {
  // Get current user from auth token
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Filter user's skills based on query parameters
  const { category, status, search } = req.query;
  let filteredSkills = [...user.skills];

  if (category && category !== 'All') {
    filteredSkills = filteredSkills.filter(skill => skill.category === category);
  }

  if (status) {
    filteredSkills = filteredSkills.filter(skill => skill.status === status);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredSkills = filteredSkills.filter(skill => 
      skill.skill.toLowerCase().includes(searchLower) ||
      skill.description?.toLowerCase().includes(searchLower)
    );
  }

  res.status(200).json(filteredSkills);
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
// @route   POST /api/skills/user
// @access  Private
exports.addUserSkill = asyncHandler(async (req, res) => {
  const { name, level, status, yearsOfExperience, priority, category, description } = req.body;

  // Get current user from auth token
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if user already has this skill with the same status
  const existingSkill = user.skills.find(s => 
    s.skill.toLowerCase() === name.toLowerCase() && 
    s.status === status
  );
  
  if (existingSkill) {
    return res.status(400).json({ 
      message: `You already have this skill in your ${status === 'teaching' ? 'offering' : 'needed'} list` 
    });
  }

  // Add skill to user
  const newSkill = {
    skill: name,
    level: level || 'Beginner',
    status: status || 'learning',
    yearsOfExperience: yearsOfExperience || 0,
    priority: priority || 'Medium',
    category: category || 'Other',
    description: description || '',
    rating: 0
  };

  user.skills.push(newSkill);
  await user.save();

  res.status(201).json({
    success: true,
    skill: newSkill
  });
});

// @desc    Find skill matches for current user
// @route   GET /api/skills/matches
// @access  Private
exports.findMatches = asyncHandler(async (req, res) => {
  console.log('=== STARTING MATCHES FETCH ===');
  console.log('Request user ID:', req.user?._id);

  if (!req.user || !req.user._id) {
    console.error('User not authenticated');
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    console.error('User not found');
    return res.status(404).json({ message: 'User not found' });
  }

  console.log('Found user:', {
    id: user._id,
    name: user.name,
    skillsCount: user.skills?.length
  });

  // Get user's skills with full details
  const userTeachingSkills = user.skills.filter(s => s.status === 'teaching');
  const userLearningSkills = user.skills.filter(s => s.status === 'learning');

  console.log('User skills:', {
    teaching: userTeachingSkills.map(s => ({ skill: s.skill, level: s.level })),
    learning: userLearningSkills.map(s => ({ skill: s.skill, level: s.level }))
  });

  if (userTeachingSkills.length === 0 && userLearningSkills.length === 0) {
    console.log('No skills found for matching');
    return res.status(200).json([]);
  }

  // Find potential matches based on skill matches
  console.log('Finding potential matches...');
  const matches = await User.find({
    _id: { $ne: user._id },
    'skills.0': { $exists: true }, // Only users who have at least one skill
    $or: [
      // Users who are teaching skills that current user wants to learn
      {
        'skills': {
          $elemMatch: {
            'status': 'teaching',
            'skill': { 
              $in: userLearningSkills.map(s => s.skill.toLowerCase())
            }
          }
        }
      },
      // Users who want to learn skills that current user teaches
      {
        'skills': {
          $elemMatch: {
            'status': 'learning',
            'skill': { 
              $in: userTeachingSkills.map(s => s.skill.toLowerCase())
            }
          }
        }
      }
    ]
  })
  .select('name email location skills rating profilePicture bio socialLinks achievements endorsements totalExchanges isVerified availability education workExperience languages certifications interests preferredLearningStyle preferredTeachingStyle timezone')
  .populate('skills.skill')
  .populate('endorsements.endorser', 'name profilePicture')
  .limit(50);

  console.log('Found matches:', matches.length);

  // Process matches to include detailed skill information
  const processedMatches = matches.map(match => {
    console.log('Processing match:', {
      userId: match._id,
      name: match.name,
      skillsCount: match.skills?.length
    });

    const matchingSkills = [];
    
    // Find matching teaching skills
    match.skills.forEach(skill => {
      if (skill.status === 'teaching' && userLearningSkills.some(s => s.skill.toLowerCase() === skill.skill.toLowerCase())) {
        console.log('Found matching teaching skill:', {
          skill: skill.skill,
          level: skill.level
        });
        matchingSkills.push({
          name: skill.skill,
          status: 'teaching',
          level: skill.level,
          yearsOfExperience: skill.yearsOfExperience,
          experienceLevel: skill.experienceLevel,
          description: skill.description
        });
      }
    });

    // Find matching learning skills
    match.skills.forEach(skill => {
      if (skill.status === 'learning' && userTeachingSkills.some(s => s.skill.toLowerCase() === skill.skill.toLowerCase())) {
        console.log('Found matching learning skill:', {
          skill: skill.skill,
          level: skill.level
        });
        matchingSkills.push({
          name: skill.skill,
          status: 'learning',
          level: skill.level,
          yearsOfExperience: skill.yearsOfExperience,
          experienceLevel: skill.experienceLevel,
          description: skill.description
        });
      }
    });

    const processedMatch = {
      user: {
        _id: match._id,
        name: match.name,
        location: match.location,
        profilePicture: match.profilePicture,
        skills: match.skills.map(skill => ({
          skill: skill.skill,
          status: skill.status,
          level: skill.level,
          yearsOfExperience: skill.yearsOfExperience,
          experienceLevel: skill.experienceLevel,
          description: skill.description,
          priority: skill.priority
        }))
      },
      matchingSkills,
      matchScore: matchingSkills.length / (userTeachingSkills.length + userLearningSkills.length)
    };

    console.log('Processed match:', {
      userId: processedMatch.user._id,
      name: processedMatch.user.name,
      matchingSkillsCount: processedMatch.matchingSkills.length,
      matchScore: processedMatch.matchScore
    });

    return processedMatch;
  });

  console.log('=== MATCHES FETCH COMPLETE ===');
  console.log('Sending response with matches:', processedMatches.length);
  res.status(200).json(processedMatches);
});

// Helper function to calculate level compatibility
function calculateLevelCompatibility(level1, level2) {
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const index1 = levels.indexOf(level1);
  const index2 = levels.indexOf(level2);
  
  if (index1 === -1 || index2 === -1) return 1; // Default score for unknown levels
  
  const diff = Math.abs(index1 - index2);
  return diff === 0 ? 5 : diff === 1 ? 3 : 1;
}

// Helper function to calculate experience compatibility
function calculateExperienceCompatibility(exp1, exp2) {
  const diff = Math.abs(exp1 - exp2);
  if (diff <= 1) return 3;
  if (diff <= 3) return 2;
  return 1;
}

// Helper function to calculate average experience
function calculateAverageExperience(skills) {
  if (!skills || skills.length === 0) return 0;
  const total = skills.reduce((sum, skill) => sum + (skill.yearsOfExperience || 0), 0);
  return total / skills.length;
}

// Helper function to calculate maximum possible score
function calculateMaxPossibleScore(totalMatches) {
  // Base score components:
  // - Level compatibility: 5 * 2 = 10 points per match
  // - Experience compatibility: 3 points per match
  // - Category match: 2 points per match
  // - Priority bonus: 3 points per match
  const baseScorePerMatch = 18; // 10 + 3 + 2 + 3
  
  // Additional bonuses:
  // - Location match: 5 points
  // - Availability match: 4 points
  // - Experience level match: 3 points
  // - Perfect rating: 10 points
  // - Verified user: 5 points
  // - Active user: 3 points
  const maxBonuses = 30;
  
  return (baseScorePerMatch * totalMatches) + maxBonuses;
}

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

// @desc    Remove a skill from user's profile
// @route   DELETE /api/skills/user/:skillName
// @access  Private
exports.removeUserSkill = asyncHandler(async (req, res) => {
  // Get current user from auth token
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Find the skill in user's skills array
  const skillIndex = user.skills.findIndex(skill => 
    skill.skill.toLowerCase() === req.params.skillName.toLowerCase()
  );
  
  if (skillIndex === -1) {
    return res.status(404).json({ message: 'Skill not found in user profile' });
  }

  // Remove the skill
  user.skills.splice(skillIndex, 1);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Skill removed successfully'
  });
});

// @desc    Update a user's skill
// @route   PUT /api/skills/user/:skillName
// @access  Private
exports.updateUserSkill = asyncHandler(async (req, res) => {
  // Get current user from auth token
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Find the skill in user's skills array
  const skillIndex = user.skills.findIndex(skill => 
    skill.skill.toLowerCase() === req.params.skillName.toLowerCase()
  );
  
  if (skillIndex === -1) {
    return res.status(404).json({ message: 'Skill not found in user profile' });
  }

  // Update the skill with new data
  const updatedSkill = {
    ...user.skills[skillIndex],
    ...req.body,
    skill: user.skills[skillIndex].skill // Preserve the original skill name
  };

  // Replace the skill in the array
  user.skills[skillIndex] = updatedSkill;
  await user.save();

  res.status(200).json({
    success: true,
    skill: updatedSkill
  });
});