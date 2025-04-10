const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema({
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
  skillsOffered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  }],
  skillsNeeded: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  completedAt: {
    type: Date
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
      ref: 'User'
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
exchangeSchema.index({ initiator: 1, recipient: 1 });
exchangeSchema.index({ status: 1 });
exchangeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Exchange', exchangeSchema); 