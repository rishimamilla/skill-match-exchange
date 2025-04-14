const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    timeSlots: [{
      start: String,
      end: String
    }]
  }],
  timezone: {
    type: String,
    required: true
  },
  learningStyle: {
    type: String,
    enum: ['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic'],
    required: true
  },
  teachingStyle: {
    type: String,
    enum: ['Structured', 'Interactive', 'Project-based', 'Mentorship'],
    required: true
  },
  preferredSessionDuration: {
    type: Number,
    default: 60 // in minutes
  },
  preferredSessionFrequency: {
    type: String,
    enum: ['Once a week', 'Twice a week', 'Three times a week', 'Daily'],
    default: 'Once a week'
  },
  preferredPlatform: {
    type: String,
    enum: ['Zoom', 'Google Meet', 'Discord', 'Other'],
    default: 'Zoom'
  },
  language: {
    type: String,
    default: 'English'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserPreferences', userPreferencesSchema); 