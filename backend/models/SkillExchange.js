const mongoose = require('mongoose');

const skillExchangeSchema = new mongoose.Schema({
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  offeredSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  }],
  requestedSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  initiatorRating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: Date
  },
  recipientRating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: Date
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  completionDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
skillExchangeSchema.index({ initiator: 1, recipient: 1 });
skillExchangeSchema.index({ status: 1 });
skillExchangeSchema.index({ createdAt: -1 });

// Update the updatedAt timestamp before saving
skillExchangeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SkillExchange', skillExchangeSchema); 