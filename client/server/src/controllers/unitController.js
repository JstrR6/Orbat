const Unit = require('../models/Unit');
const User = require('../models/User');

const unitController = {
  async getAllUnits(req, res) {
    try {
      const units = await Unit.find().populate('parentUnit');
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async createUnit(req, res) {
    try {
      const unit = new Unit(req.body);
      const savedUnit = await unit.save();
      res.status(201).json(savedUnit);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async updateUnit(req, res) {
    try {
      const unit = await Unit.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true }
      );
      if (!unit) return res.status(404).json({ message: 'Unit not found' });
      res.json(unit);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async assignMember(req, res) {
    try {
      const { unitId, positionId, discordId } = req.body;
      const unit = await Unit.findById(unitId);
      const position = unit.positions.id(positionId);
      
      if (!position) {
        return res.status(404).json({ message: 'Position not found' });
      }

      position.discordId = discordId;
      await unit.save();
      
      // Update user's unit assignment
      await User.findOneAndUpdate(
        { discordId },
        { unit: unitId }
      );

      res.json(unit);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};