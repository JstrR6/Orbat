const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  discordId: { type: String, required: true, unique: true },
  roles: [{ type: String }],
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  rank: { type: String },
  joinDate: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);