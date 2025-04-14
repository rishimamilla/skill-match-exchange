// Skill validation utilities
export const validateSkillName = (name) => {
  if (!name || name.trim().length < 2) {
    return 'Skill name must be at least 2 characters long';
  }
  if (name.length > 50) {
    return 'Skill name must be less than 50 characters';
  }
  if (!/^[a-zA-Z0-9\s-]+$/.test(name)) {
    return 'Skill name can only contain letters, numbers, spaces, and hyphens';
  }
  return null;
};

export const isDuplicateSkill = (name, existingSkills) => {
  if (!name || !existingSkills || !Array.isArray(existingSkills)) return false;
  
  const normalizedName = name.toLowerCase().trim();
  return existingSkills.some(skill => {
    if (!skill || typeof skill !== 'object') return false;
    // Check both skill.name and skill.skill properties since the data structure might vary
    const skillName = (skill.name || skill.skill || '').toLowerCase().trim();
    return skillName === normalizedName;
  });
};

export const validateSkillData = (skill) => {
  const errors = [];

  // Validate name
  const nameError = validateSkillName(skill.name);
  if (nameError) errors.push(nameError);

  // Valid categories
  const validCategories = [
    'Programming', 'Design', 'Marketing', 'Business', 'Language',
    'Music', 'Art', 'Sports', 'Cooking', 'Other'
  ];

  // Valid levels
  const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  // Valid priorities
  const validPriorities = ['Low', 'Medium', 'High'];

  // Validate category
  if (!skill.category || !validCategories.includes(skill.category)) {
    errors.push('Invalid category selected');
  }

  // Validate level
  if (!skill.level || !validLevels.includes(skill.level)) {
    errors.push('Invalid skill level selected');
  }

  // Validate priority if it exists
  if (skill.priority && !validPriorities.includes(skill.priority)) {
    errors.push('Invalid priority level selected');
  }

  // Validate years of experience
  if (skill.yearsOfExperience < 0) {
    errors.push('Years of experience cannot be negative');
  }

  return errors;
};

export const sanitizeSkillData = (skill) => {
  // Map of valid skill levels with proper casing
  const validLevels = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
    'expert': 'Expert'
  };

  // Map of valid priorities with proper casing
  const validPriorities = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High'
  };

  // Map of valid categories with proper casing
  const validCategories = {
    'programming': 'Programming',
    'design': 'Design',
    'marketing': 'Marketing',
    'business': 'Business',
    'language': 'Language',
    'music': 'Music',
    'art': 'Art',
    'sports': 'Sports',
    'cooking': 'Cooking',
    'other': 'Other'
  };

  return {
    ...skill,
    name: skill.name.trim(),
    category: validCategories[skill.category.toLowerCase()] || 'Other',
    description: skill.description ? skill.description.trim() : '',
    level: validLevels[skill.level.toLowerCase()] || 'Beginner',
    priority: validPriorities[skill.priority?.toLowerCase()] || 'Medium',
    yearsOfExperience: Math.max(0, parseInt(skill.yearsOfExperience) || 0)
  };
}; 