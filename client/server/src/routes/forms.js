const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

router.post('/submit', isAuthenticated, formController.submitForm);
router.get('/my-forms', isAuthenticated, formController.getFormsByUser);
router.put('/:id/review', 
  isAuthenticated, 
  hasRole('High Command'), 
  formController.reviewForm
);

module.exports = router;