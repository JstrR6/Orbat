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
      const rootUnit = await Orbat.findOne({ type: 'Army' });
      console.log('Root unit found:', rootUnit);
  
      if (!rootUnit) {
        console.log('Root unit not found in database, falling back to JSON file');
        const jsonPath = path.join(__dirname, 'orbatStructure.json');
        const jsonData = await fs.readFile(jsonPath, 'utf8');
        return JSON.parse(jsonData);
      }
  
      async function populateSubordinates(unitId, level = 0) {
        const unit = await Orbat.findById(unitId);
        if (!unit) {
          console.log(`${' '.repeat(level * 2)}Unit not found for ID: ${unitId}`);
          return null;
        }
  
        console.log(`${' '.repeat(level * 2)}Found unit: ${unit.name} (${unit.type})`);
        const populatedUnit = unit.toObject();
  
        if (unit.subordinates && unit.subordinates.length > 0) {
          console.log(`${' '.repeat(level * 2)}Populating ${unit.subordinates.length} subordinates for ${unit.name}`);
          populatedUnit.subordinates = await Promise.all(
            unit.subordinates.map(subId => populateSubordinates(subId, level + 1))
          );
        } else {
          console.log(`${' '.repeat(level * 2)}No subordinates for ${unit.name}`);
        }
  
        return populatedUnit;
      }
  
      const fullStructure = await populateSubordinates(rootUnit._id);
      console.log('Full structure:', JSON.stringify(fullStructure, null, 2));
      return fullStructure;
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
  
      async function createUnit(unitData, parentId = null) {
        console.log(`Creating unit: ${unitData.name} (${unitData.type})`);
        const unit = new Orbat({
          id: unitData.id,
          name: unitData.name,
          type: unitData.type,
          parentId: parentId,
          subordinates: []
        });
  
        await unit.save();
  
        if (unitData.subordinates && unitData.subordinates.length > 0) {
          for (const subordinateData of unitData.subordinates) {
            const subordinateUnit = await createUnit(subordinateData, unit._id);
            unit.subordinates.push(subordinateUnit._id);
          }
          await unit.save();
        }
  
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