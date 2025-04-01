const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a skill name'],
    unique: true,
    trim: true,
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

// Index for search functionality
skillSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  tags: 'text',
});

// Additional indexes for faster searches
skillSchema.index({ category: 1 });
skillSchema.index({ difficulty: 1 });

module.exports = mongoose.model("Skill", skillSchema);
