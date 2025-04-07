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
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
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
    type: Number,
    min: 1,
    max: 5
  },
  recipientRating: {
    type: Number,
    min: 1,
    max: 5
  },
  skillsExchanged: [{
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    skillName: String
  }]
});

// Indexes for better query performance
exchangeSchema.index({ initiator: 1, recipient: 1 });
exchangeSchema.index({ status: 1 });
exchangeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Exchange', exchangeSchema); 