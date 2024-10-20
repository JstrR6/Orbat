const fs = require('fs').promises;
const path = require('path');
const Leadership = require('./leadershipModel');
const Orbat = require('./orbatModel');

async function getLeadershipAssignments() {
  try {
    const assignments = await Leadership.find();
    return assignments.reduce((acc, assignment) => {
      acc[assignment.unitId] = {
        commander: assignment.commander,
        deputyCommander: assignment.deputyCommander,
        seniorEnlistedLeader: assignment.seniorEnlistedLeader
      };
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching leadership assignments:', error);
    return {};
  }
}

async function updateLeadership(unitId, position, name) {
  try {
    const update = { [position]: name };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    await Leadership.findOneAndUpdate({ unitId }, update, options);
    return true;
  } catch (error) {
    console.error('Error updating leadership:', error);
    return false;
  }
}

async function getOrbatStructure() {
  try {
    const rootUnit = await Orbat.findOne({ type: 'Army' }).populate({
      path: 'subordinates',
      populate: {
        path: 'subordinates',
        populate: {
          path: 'subordinates'
        }
      }
    });
    return rootUnit;
  } catch (error) {
    console.error('Error fetching ORBAT structure:', error);
    return null;
  }
}

async function initializeOrbatStructure() {
  try {
    const existingStructure = await Orbat.findOne({ type: 'Army' });
    if (existingStructure) {
      console.log('ORBAT structure already initialized');
      return;
    }

    const jsonPath = path.join(__dirname, 'orbatStructure.json');
    const jsonData = await fs.readFile(jsonPath, 'utf8');
    const orbatData = JSON.parse(jsonData);

    async function createUnit(unitData) {
      const unit = new Orbat({
        id: unitData.id,
        name: unitData.name,
        type: unitData.type
      });

      if (unitData.subordinates && unitData.subordinates.length > 0) {
        const subordinateIds = [];
        for (const subordinate of unitData.subordinates) {
          const subordinateUnit = await createUnit(subordinate);
          subordinateIds.push(subordinateUnit._id);
        }
        unit.subordinates = subordinateIds;
      }

      await unit.save();
      return unit;
    }

    await createUnit(orbatData);
    console.log('ORBAT structure initialized');
  } catch (error) {
    console.error('Error initializing ORBAT structure:', error);
  }
}

module.exports = { 
  getOrbatStructure, 
  getLeadershipAssignments, 
  updateLeadership, 
  initializeOrbatStructure 
};