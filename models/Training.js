const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  trainerId: {
    type: String,
    required: true
  },
  attendeeIds: [{
    type: String,
    required: true
  }],
  xpAmount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  trainingType: {
    type: String,
    enum: ['basic', 'officer'],
    required: true
  },
  description: String,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  submittedBy: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Training', trainingSchema);
