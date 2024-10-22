const Form = require('../models/Form');
const notificationService = require('../services/notificationService');

const formController = {
  async submitForm(req, res) {
    try {
      const form = new Form({
        ...req.body,
        submittedBy: req.user._id
      });
      
      const savedForm = await form.save();
      
      // Notify relevant personnel
      await notificationService.notifyFormSubmission(savedForm);
      
      res.status(201).json(savedForm);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getFormsByUser(req, res) {
    try {
      const forms = await Form.find({ submittedBy: req.user._id })
        .populate('submittedBy', 'username')
        .populate('reviewedBy', 'username');
      res.json(forms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async reviewForm(req, res) {
    try {
      const { status, comments } = req.body;
      const form = await Form.findByIdAndUpdate(
        req.params.id,
        {
          status,
          reviewedBy: req.user._id,
          $push: {
            comments: {
              user: req.user._id,
              text: comments
            }
          },
          updatedAt: Date.now()
        },
        { new: true }
      );
      
      await notificationService.notifyFormUpdate(form);
      
      res.json(form);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};