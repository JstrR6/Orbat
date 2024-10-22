const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  highestRole: { type: String, default: 'Member' },
  xp: { type: Number, default: 0 },
  lastLogin: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);