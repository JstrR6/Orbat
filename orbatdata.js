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
    const rootUnit = await Orbat.findOne({ type: 'Army' }).lean();
    console.log('Root unit found:', rootUnit);

    if (!rootUnit) {
      console.log('Root unit not found in database');
      return null;
    }

    async function populateSubordinates(unit) {
      if (unit.subordinates && unit.subordinates.length > 0) {
        const populatedSubordinates = await Promise.all(
          unit.subordinates.map(async (subId) => {
            const subUnit = await Orbat.findById(subId).lean();
            if (subUnit) {
              return await populateSubordinates(subUnit);
            }
            return null;
          })
        );
        unit.subordinates = populatedSubordinates.filter(Boolean);
      }
      return unit;
    }

    const fullStructure = await populateSubordinates(rootUnit);
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

    async function createUnit(unitData, parentId = null, level = 0) {
      console.log(`${'  '.repeat(level)}Creating unit: ${unitData.name} (${unitData.type})`);
      const unit = new Orbat({
        id: unitData.id,
        name: unitData.name,
        type: unitData.type,
        parentId: parentId,
        subordinates: []
      });

      await unit.save();
      console.log(`${'  '.repeat(level)}Saved unit: ${unit.name} with ID: ${unit._id}`);

      if (unitData.subordinates && unitData.subordinates.length > 0) {
        console.log(`${'  '.repeat(level)}Creating ${unitData.subordinates.length} subordinates for ${unit.name}`);
        for (const subordinateData of unitData.subordinates) {
          const subordinateUnit = await createUnit(subordinateData, unit._id, level + 1);
          unit.subordinates.push(subordinateUnit._id);
        }
        await unit.save();
        console.log(`${'  '.repeat(level)}Updated ${unit.name} with ${unit.subordinates.length} subordinates`);
      }

      return unit;
    }

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