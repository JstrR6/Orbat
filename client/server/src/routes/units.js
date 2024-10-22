const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Units route working' });
});

// Get all units
router.get('/', (req, res) => {
  res.json({ message: 'Get all units endpoint' });
});

module.exports = router;