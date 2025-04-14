const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  deadline: Date
});

const learningProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  exchange: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exchange',
    required: true
  },
  currentLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  milestones: [milestoneSchema],
  notes: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['Video', 'Article', 'Document', 'Other']
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  lastSession: Date,
  nextSession: Date,
  totalHoursSpent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LearningProgress', learningProgressSchema); 