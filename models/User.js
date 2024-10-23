const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  discordId: String,
  username: String,
  highestRole: String,
  roles: [{
    name: String,
    position: Number,
    guildName: String
  }],
  xp: Number
});

module.exports = mongoose.model('User', userSchema);
