const mongoose = require('mongoose');

const OrbatSchema = new mongoose.Schema({
  id: String,
  name: String,
  type: String,
  subordinates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orbat'
  }]
});

module.exports = mongoose.model('Orbat', OrbatSchema);