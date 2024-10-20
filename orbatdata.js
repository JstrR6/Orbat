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
      // Fetch the root unit (e.g., 1st Army)
      const rootUnit = await Orbat.findOne({ type: 'Army' }).lean();
      if (!rootUnit) {
        console.log('Root unit not found in database');
        return null;
      }
  
      // Recursive function to populate all subordinates
      async function populateSubordinates(unit) {
        try {
          if (unit.subordinates && unit.subordinates.length > 0) {
            const populatedSubordinates = await Orbat.find({
              _id: { $in: unit.subordinates }
            }).lean();
      
            unit.subordinates = await Promise.all(
              populatedSubordinates.map(subUnit => populateSubordinates(subUnit))
            );
          }
          return unit;
        } catch (error) {
          console.error(`Error fetching subordinates for unit ${unit.name}:`, error);
          return unit;
        }
      }

  async function initializeOrbatStructure() {
    try {
      // Check if the ORBAT structure already exists
      const existingStructure = await Orbat.findOne({ type: 'Army' });
      if (existingStructure) {
        console.log('ORBAT structure already initialized');
        return;
      }
  
      // Load the ORBAT structure from JSON file
      const jsonPath = path.join(__dirname, 'orbatStructure.json');
      const jsonData = await fs.readFile(jsonPath, 'utf8');
      const orbatData = JSON.parse(jsonData);
  
      // Recursive function to create units and their subordinates
      async function createUnit(unitData, parentId = null, level = 0) {
        console.log(`${'  '.repeat(level)}Creating unit: ${unitData.name} (${unitData.type})`);
     
        const unit = new Orbat({
          id: unitData.id,
          name: unitData.name,
          type: unitData.type,
          parentId: parentId,
          subordinates: []
        });
     
        // Recursively create subordinates, if any
        if (unitData.subordinates && unitData.subordinates.length > 0) {
          console.log(`${'  '.repeat(level)}Creating ${unitData.subordinates.length} subordinates for ${unit.name}`);
     
          for (const subordinateData of unitData.subordinates) {
            const subordinateUnit = await createUnit(subordinateData, unit._id, level + 1);
            unit.subordinates.push(subordinateUnit._id);  // Store subordinate ID in the parent unit
          }
        }
     
        await unit.save();  // Save the unit once with all subordinates
        console.log(`${'  '.repeat(level)}Saved unit: ${unit.name} with ID: ${unit._id}`);
     
        return unit;
      }
  
      // Create the root unit (e.g., 1st Army) and recursively create its subordinates
      const rootUnit = await createUnit(orbatData);
      console.log(`ORBAT structure initialized. Root unit ID: ${rootUnit._id}`);
  
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