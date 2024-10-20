const mongoose = require('mongoose');

const LeadershipSchema = new mongoose.Schema({
  unitId: {
    type: String,
    required: true,
    unique: true
  },
  commander: {
    type: String,
    default: ''
  },
  deputyCommander: {
    type: String,
    default: ''
  },
  seniorEnlistedLeader: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Leadership', LeadershipSchema);