const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  discordId: { type: String },
  rank: { type: String },
  isCommand: { type: Boolean, default: false }
});

const unitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  parentUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  positions: [positionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Unit', unitSchema);