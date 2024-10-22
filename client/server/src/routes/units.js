const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

router.get('/', isAuthenticated, unitController.getAllUnits);
router.post('/', isAuthenticated, hasRole('High Command'), unitController.createUnit);
router.put('/:id', isAuthenticated, hasRole('High Command'), unitController.updateUnit);
router.post('/assign', isAuthenticated, hasRole('High Command'), unitController.assignMember);

module.exports = router;