// client/server/src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  discordId: {
    type: String,
    required: true,
    unique: true
  },
  email: String,
  roles: [{
    type: String,
    default: 'member'
  }],
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);