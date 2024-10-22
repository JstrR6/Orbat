const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Forms route working' });
});

// Get all forms
router.get('/', (req, res) => {
  res.json({ message: 'Get all forms endpoint' });
});

module.exports = router;