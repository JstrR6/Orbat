const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  discordId: String,
  username: String,
  discriminator: String,
  avatar: String,
  roles: [String],
  highestRole: String,
  xp: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);
