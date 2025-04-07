const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a skill name'],
    unique: true,
    trim: true,
    index: true,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Programming',
      'Design',
      'Marketing',
      'Business',
      'Language',
      'Music',
      'Art',
      'Sports',
      'Cooking',
      'Other'
    ],
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
  },
  difficulty: {
    type: String,
    required: [true, 'Please add difficulty level'],
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    index: true,
  },
  prerequisites: [{
    type: String,
    ref: 'Skill',
  }],
  relatedSkills: [{
    type: String,
    ref: 'Skill',
  }],
  popularity: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  subcategories: [{
    type: String,
    trim: true,
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  availability: {
    type: String,
    required: true,
    enum: ['Available', 'In Exchange', 'Completed'],
    default: 'Available',
  },
  preferredExchange: {
    type: String,
    required: [true, 'Please specify preferred exchange'],
  },
  location: {
    type: String,
    required: [true, 'Please add location'],
  },
  isRemote: {
    type: Boolean,
    default: false,
  },
  duration: {
    type: String,
    required: [true, 'Please specify duration'],
    enum: ['1-2 hours', '2-4 hours', '4-8 hours', '8+ hours'],
  },
  materials: [{
    type: String,
    trim: true,
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  views: {
    type: Number,
    default: 0,
  },
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Add text search index
skillSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  'subcategories': 'text',
  'tags': 'text'
}, {
  weights: {
    name: 10,
    category: 5,
    description: 3,
    subcategories: 2,
    tags: 2
  },
  name: 'skill_search_index'
});

// Add compound index for common queries
skillSchema.index({ category: 1, difficulty: 1, popularity: -1 });

// Add method to calculate search relevance score
skillSchema.methods.calculateSearchScore = function(searchTerms) {
  let score = 0;
  const searchTermsArray = searchTerms.toLowerCase().split(' ');
  
  // Check name matches (highest weight)
  searchTermsArray.forEach(term => {
    if (this.name.toLowerCase().includes(term)) score += 10;
    if (this.name.toLowerCase() === term) score += 20; // Exact match bonus
  });
  
  // Check category matches
  searchTermsArray.forEach(term => {
    if (this.category.toLowerCase().includes(term)) score += 5;
    if (this.category.toLowerCase() === term) score += 10; // Exact match bonus
  });
  
  // Check description matches
  searchTermsArray.forEach(term => {
    if (this.description.toLowerCase().includes(term)) score += 3;
  });
  
  // Check subcategories and tags
  searchTermsArray.forEach(term => {
    this.subcategories?.forEach(subcat => {
      if (subcat.toLowerCase().includes(term)) score += 2;
    });
    this.tags?.forEach(tag => {
      if (tag.toLowerCase().includes(term)) score += 2;
    });
  });
  
  // Add popularity bonus
  score += Math.min(this.popularity / 10, 5);
  
  return score;
};

module.exports = mongoose.model("Skill", skillSchema);
