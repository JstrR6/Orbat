const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: String,
  content: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Order', orderSchema);
