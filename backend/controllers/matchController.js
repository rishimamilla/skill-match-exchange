const User = require('../models/User');
const UserPreferences = require('../models/UserPreferences');
const Skill = require('../models/Skill');
const Exchange = require('../models/Exchange');
const asyncHandler = require('../middleware/async');

// Calculate match score between two users
const calculateMatchScore = (user1, user2, preferences1, preferences2) => {
  try {
    let score = 0;
    let totalWeight = 0;

    // Skill matching (40% weight)
    const skillScore = calculateSkillMatch(user1.skills, user2.skills);
    score += skillScore * 0.4;
    totalWeight += 0.4;

    // Learning and teaching style compatibility (30% weight)
    const styleScore = calculateStyleCompatibility(preferences1, preferences2);
    score += styleScore * 0.3;
    totalWeight += 0.3;

    // Availability overlap (20% weight)
    const availabilityScore = calculateAvailabilityOverlap(preferences1, preferences2);
    score += availabilityScore * 0.2;
    totalWeight += 0.2;

    // Timezone compatibility (10% weight)
    const timezoneScore = calculateTimezoneCompatibility(preferences1, preferences2);
    score += timezoneScore * 0.1;
    totalWeight += 0.1;

    // Normalize score to 0-100 range and ensure it's a valid number
    const finalScore = Math.round((score / totalWeight) * 100);
    return isNaN(finalScore) ? 0 : Math.min(100, Math.max(0, finalScore));
  } catch (error) {
    console.error('Error calculating match score:', error);
    return 0;
  }
};

// Calculate skill match score with improved matching
const calculateSkillMatch = (skills1, skills2) => {
  try {
    if (!Array.isArray(skills1) || !Array.isArray(skills2)) {
      return 0;
    }

    const teachingSkills1 = skills1.filter(s => s?.status === 'teaching').map(s => ({
      skill: s.skill?.toString() || '',
      level: s.level || 'beginner',
      yearsOfExperience: s.yearsOfExperience || 0,
      category: s.category || 'Other'
    }));
    
    const learningSkills1 = skills1.filter(s => s?.status === 'learning').map(s => ({
      skill: s.skill?.toString() || '',
      priority: s.priority || 'medium',
      category: s.category || 'Other'
    }));
    
    const teachingSkills2 = skills2.filter(s => s?.status === 'teaching').map(s => ({
      skill: s.skill?.toString() || '',
      level: s.level || 'beginner',
      yearsOfExperience: s.yearsOfExperience || 0,
      category: s.category || 'Other'
    }));
    
    const learningSkills2 = skills2.filter(s => s?.status === 'learning').map(s => ({
      skill: s.skill?.toString() || '',
      priority: s.priority || 'medium',
      category: s.category || 'Other'
    }));

    let matchScore = 0;
    let totalPossibleMatches = 0;

    // Calculate teaching-to-learning matches (user1 teaches what user2 learns)
    for (const teachSkill of teachingSkills1) {
      const learnMatch = learningSkills2.find(s => s.skill === teachSkill.skill);
      if (learnMatch) {
        // Base match score
        let skillScore = 1;
        
        // Adjust score based on priority
        if (learnMatch.priority === 'high') skillScore *= 1.5;
        if (learnMatch.priority === 'low') skillScore *= 0.7;
        
        // Adjust score based on teaching level
        if (teachSkill.level === 'expert') skillScore *= 1.3;
        if (teachSkill.level === 'intermediate') skillScore *= 1.1;
        
        // Adjust score based on years of experience
        if (teachSkill.yearsOfExperience >= 5) skillScore *= 1.2;
        if (teachSkill.yearsOfExperience >= 10) skillScore *= 1.3;
        
        // Category bonus
        if (teachSkill.category === learnMatch.category) {
          skillScore *= 1.1;
        }
        
        matchScore += skillScore;
        totalPossibleMatches++;
      }
    }

    // Calculate learning-to-teaching matches (user2 teaches what user1 learns)
    for (const learnSkill of learningSkills1) {
      const teachMatch = teachingSkills2.find(s => s.skill === learnSkill.skill);
      if (teachMatch) {
        // Base match score
        let skillScore = 1;
        
        // Adjust score based on priority
        if (learnSkill.priority === 'high') skillScore *= 1.5;
        if (learnSkill.priority === 'low') skillScore *= 0.7;
        
        // Adjust score based on teaching level
        if (teachMatch.level === 'expert') skillScore *= 1.3;
        if (teachMatch.level === 'intermediate') skillScore *= 1.1;
        
        // Adjust score based on years of experience
        if (teachMatch.yearsOfExperience >= 5) skillScore *= 1.2;
        if (teachMatch.yearsOfExperience >= 10) skillScore *= 1.3;
        
        // Category bonus
        if (teachMatch.category === learnSkill.category) {
          skillScore *= 1.1;
        }
        
        matchScore += skillScore;
        totalPossibleMatches++;
      }
    }

    return totalPossibleMatches > 0 ? matchScore / totalPossibleMatches : 0;
  } catch (error) {
    console.error('Error calculating skill match:', error);
    return 0;
  }
};

// Calculate learning and teaching style compatibility with improved scoring
const calculateStyleCompatibility = (prefs1, prefs2) => {
  try {
    if (!prefs1 || !prefs2) return 0;
    
    let score = 0;
    let totalFactors = 0;
    
    // Compare learning styles
    if (prefs1.learningStyle && prefs2.learningStyle) {
      if (prefs1.learningStyle === prefs2.learningStyle) {
        score += 1;
      } else if (areStylesCompatible(prefs1.learningStyle, prefs2.learningStyle)) {
        score += 0.7;
      }
      totalFactors++;
    }

    // Compare teaching styles
    if (prefs1.teachingStyle && prefs2.teachingStyle) {
      if (prefs1.teachingStyle === prefs2.teachingStyle) {
        score += 1;
      } else if (areStylesCompatible(prefs1.teachingStyle, prefs2.teachingStyle)) {
        score += 0.7;
      }
      totalFactors++;
    }

    // Compare communication preferences
    if (prefs1.communicationPreference && prefs2.communicationPreference) {
      if (prefs1.communicationPreference === prefs2.communicationPreference) {
        score += 1;
      }
      totalFactors++;
    }

    // Compare preferred meeting formats
    if (prefs1.preferredMeetingFormat && prefs2.preferredMeetingFormat) {
      if (prefs1.preferredMeetingFormat === prefs2.preferredMeetingFormat) {
        score += 1;
      }
      totalFactors++;
    }

    // Compare language preferences
    if (prefs1.preferredLanguage && prefs2.preferredLanguage) {
      if (prefs1.preferredLanguage === prefs2.preferredLanguage) {
        score += 1;
      }
      totalFactors++;
    }

    return totalFactors > 0 ? score / totalFactors : 0;
  } catch (error) {
    console.error('Error calculating style compatibility:', error);
    return 0;
  }
};

// Helper function to check if learning/teaching styles are compatible
const areStylesCompatible = (style1, style2) => {
  try {
    if (!style1 || !style2) return false;
    
    const styleGroups = {
      visual: ['visual', 'kinesthetic'],
      auditory: ['auditory', 'reading'],
      reading: ['reading', 'auditory'],
      kinesthetic: ['kinesthetic', 'visual']
    };
    
    return styleGroups[style1]?.includes(style2) || styleGroups[style2]?.includes(style1);
  } catch (error) {
    console.error('Error checking style compatibility:', error);
    return false;
  }
};

// Calculate availability overlap with improved accuracy
const calculateAvailabilityOverlap = (prefs1, prefs2) => {
  try {
    if (!prefs1?.availability || !prefs2?.availability) return 0;
    
    const availability1 = prefs1.availability;
    const availability2 = prefs2.availability;

    if (!Array.isArray(availability1) || !Array.isArray(availability2)) {
      return 0;
    }

    let overlapCount = 0;
    let totalSlots = Math.max(availability1.length, availability2.length);

    for (const slot1 of availability1) {
      if (!slot1 || typeof slot1 !== 'object') continue;
      
      for (const slot2 of availability2) {
        if (!slot2 || typeof slot2 !== 'object') continue;
        
        if (isTimeSlotOverlapping(slot1, slot2)) {
          // Calculate overlap duration
          const overlapDuration = calculateOverlapDuration(slot1, slot2);
          const totalDuration = Math.min(
            getSlotDuration(slot1),
            getSlotDuration(slot2)
          );
          
          overlapCount += overlapDuration / totalDuration;
        }
      }
    }

    return totalSlots > 0 ? overlapCount / totalSlots : 0;
  } catch (error) {
    console.error('Error calculating availability overlap:', error);
    return 0;
  }
};

// Calculate overlap duration between two time slots
const calculateOverlapDuration = (slot1, slot2) => {
  try {
    if (!slot1 || !slot2) return 0;
    
    const start = Math.max(slot1.startTime || 0, slot2.startTime || 0);
    const end = Math.min(slot1.endTime || 0, slot2.endTime || 0);
    return Math.max(0, end - start);
  } catch (error) {
    console.error('Error calculating overlap duration:', error);
    return 0;
  }
};

// Get duration of a time slot in hours
const getSlotDuration = (slot) => {
  try {
    if (!slot) return 0;
    
    const start = slot.startTime || 0;
    const end = slot.endTime || 0;
    return Math.max(0, end - start);
  } catch (error) {
    console.error('Error calculating slot duration:', error);
    return 0;
  }
};

// Check if two time slots overlap
const isTimeSlotOverlapping = (slot1, slot2) => {
  try {
    if (!slot1 || !slot2) return false;
    
    return slot1.day === slot2.day &&
           ((slot1.startTime <= slot2.startTime && slot1.endTime > slot2.startTime) ||
            (slot2.startTime <= slot1.startTime && slot2.endTime > slot1.startTime));
  } catch (error) {
    console.error('Error checking time slot overlap:', error);
    return false;
  }
};

// Calculate timezone compatibility with improved scoring
const calculateTimezoneCompatibility = (prefs1, prefs2) => {
  try {
    if (!prefs1?.timezone || !prefs2?.timezone) return 0;
    
    const timezoneDiff = Math.abs(prefs1.timezone - prefs2.timezone);
    
    // More granular timezone compatibility scoring
    if (timezoneDiff === 0) return 1;
    if (timezoneDiff <= 2) return 0.8;
    if (timezoneDiff <= 4) return 0.6;
    if (timezoneDiff <= 6) return 0.4;
    if (timezoneDiff <= 8) return 0.2;
    return 0;
  } catch (error) {
    console.error('Error calculating timezone compatibility:', error);
    return 0;
  }
};

// Get enhanced matches for a user
exports.getEnhancedMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('skills.skill')
      .populate('preferences');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const preferences = await UserPreferences.findOne({ user: user._id });
    if (!preferences) {
      return res.status(404).json({ message: 'User preferences not found' });
    }

    // Get existing exchanges to filter out
    const existingExchanges = await Exchange.find({
      $or: [
        { initiator: user._id },
        { recipient: user._id }
      ],
      status: { $in: ['pending', 'active'] }
    });

    const excludedUsers = existingExchanges.map(exchange => 
      exchange.initiator.toString() === user._id.toString() ? 
        exchange.recipient : 
        exchange.initiator
    );

    // Get potential matches with improved filtering
    const potentialMatches = await User.find({
      _id: { 
        $ne: user._id,
        $nin: excludedUsers
      },
      'skills.status': 'teaching',
      isActive: true // Only match with active users
    })
    .populate('skills.skill')
    .populate('preferences')
    .select('name email profilePicture skills preferences rating location bio education workExperience languages certifications socialLinks availability interests preferredLearningStyle preferredTeachingStyle timezone');

    // Calculate match scores
    const matches = await Promise.all(potentialMatches.map(async (match) => {
      try {
        const matchPreferences = await UserPreferences.findOne({ user: match._id });
        if (!matchPreferences) return null;

        const score = calculateMatchScore(user, match, preferences, matchPreferences);
        
        // Skip matches with very low scores
        if (score < 20) return null;

        // Calculate individual compatibility scores
        const skillMatch = calculateSkillMatch(user.skills, match.skills);
        const styleCompatibility = calculateStyleCompatibility(preferences, matchPreferences);
        const availabilityOverlap = calculateAvailabilityOverlap(preferences, matchPreferences);
        const timezoneCompatibility = calculateTimezoneCompatibility(preferences, matchPreferences);

        // Get matching skills
        const matchingTeachingSkills = match.skills
          .filter(s => s.status === 'teaching')
          .filter(s => user.skills.some(us => 
            us.status === 'learning' && 
            us.skill.toString() === s.skill.toString()
          ))
          .map(s => s.skill);

        const matchingLearningSkills = match.skills
          .filter(s => s.status === 'learning')
          .filter(s => user.skills.some(us => 
            us.status === 'teaching' && 
            us.skill.toString() === s.skill.toString()
          ))
          .map(s => s.skill);

        return {
          user: {
            _id: match._id,
            name: match.name,
            email: match.email,
            profilePicture: match.profilePicture,
            location: match.location,
            rating: match.rating || 0,
            bio: match.bio,
            education: match.education,
            workExperience: match.workExperience,
            languages: match.languages,
            certifications: match.certifications,
            socialLinks: match.socialLinks,
            availability: match.availability,
            interests: match.interests,
            preferredLearningStyle: match.preferredLearningStyle,
            preferredTeachingStyle: match.preferredTeachingStyle,
            timezone: match.timezone
          },
          score,
          skills: match.skills,
          matchingTeachingSkills,
          matchingLearningSkills,
          compatibility: {
            skillMatch,
            styleCompatibility,
            availabilityOverlap,
            timezoneCompatibility
          }
        };
      } catch (error) {
        console.error('Error processing match:', error);
        return null;
      }
    }));

    // Filter out null matches and sort by score
    const validMatches = matches.filter(match => match !== null);
    validMatches.sort((a, b) => b.score - a.score);

    // Add match quality indicators
    const enhancedMatches = validMatches.map(match => ({
      ...match,
      matchQuality: getMatchQualityIndicator(match.score),
      matchStrength: getMatchStrengthIndicator(match.compatibility)
    }));

    res.json(enhancedMatches);
  } catch (error) {
    console.error('Error getting enhanced matches:', error);
    res.status(500).json({ message: 'Error getting enhanced matches' });
  }
};

// Get match quality indicator based on score
const getMatchQualityIndicator = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Moderate';
  return 'Low';
};

// Get match strength indicator based on compatibility factors
const getMatchStrengthIndicator = (compatibility) => {
  const { skillMatch, styleCompatibility, availabilityOverlap, timezoneCompatibility } = compatibility;
  
  // Calculate weighted average of compatibility factors
  const weightedScore = 
    (skillMatch * 0.4) + 
    (styleCompatibility * 0.3) + 
    (availabilityOverlap * 0.2) + 
    (timezoneCompatibility * 0.1);
  
  if (weightedScore >= 0.8) return 'Strong';
  if (weightedScore >= 0.6) return 'Moderate';
  if (weightedScore >= 0.4) return 'Fair';
  return 'Weak';
};

// @desc    Get match details between two users
// @route   GET /api/matches/:userId
// @access  Private
exports.getMatchDetails = asyncHandler(async (req, res) => {
  try {
    // Get current user with populated skills and preferences
    const currentUser = await User.findById(req.user._id)
      .populate('skills.skill')
      .populate('preferences');

    // Get target user with populated skills and preferences
    const targetUser = await User.findById(req.params.userId)
      .populate('skills.skill')
      .populate('preferences');

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user preferences
    const currentUserPrefs = await UserPreferences.findOne({ user: currentUser._id });
    const targetUserPrefs = await UserPreferences.findOne({ user: targetUser._id });

    // Calculate match score
    const matchScore = calculateMatchScore(
      currentUser,
      targetUser,
      currentUserPrefs || {},
      targetUserPrefs || {}
    );

    // Calculate individual compatibility scores
    const skillMatch = calculateSkillMatch(currentUser.skills, targetUser.skills);
    const styleCompatibility = calculateStyleCompatibility(currentUserPrefs || {}, targetUserPrefs || {});
    const availabilityOverlap = calculateAvailabilityOverlap(currentUserPrefs || {}, targetUserPrefs || {});
    const timezoneCompatibility = calculateTimezoneCompatibility(currentUserPrefs || {}, targetUserPrefs || {});

    // Get matching skills
    const matchingTeachingSkills = targetUser.skills
      .filter(s => s.status === 'teaching')
      .filter(s => currentUser.skills.some(us => 
        us.status === 'learning' && 
        us.skill.toString() === s.skill.toString()
      ))
      .map(s => ({
        skill: s.skill,
        level: s.level,
        yearsOfExperience: s.yearsOfExperience
      }));

    const matchingLearningSkills = targetUser.skills
      .filter(s => s.status === 'learning')
      .filter(s => currentUser.skills.some(us => 
        us.status === 'teaching' && 
        us.skill.toString() === s.skill.toString()
      ))
      .map(s => ({
        skill: s.skill,
        priority: s.priority
      }));

    // Return match details
    res.status(200).json({
      matchPercentage: matchScore,
      matchQuality: getMatchQualityIndicator(matchScore),
      matchStrength: getMatchStrengthIndicator({
        skillMatch,
        styleCompatibility,
        availabilityOverlap,
        timezoneCompatibility
      }),
      compatibility: {
        skillMatch,
        styleCompatibility,
        availabilityOverlap,
        timezoneCompatibility
      },
      matchingSkills: {
        teaching: matchingTeachingSkills,
        learning: matchingLearningSkills
      }
    });
  } catch (error) {
    console.error('Error in getMatchDetails:', error);
    res.status(500).json({ message: 'Error calculating match details' });
  }
}); 