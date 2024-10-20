const Leadership = require('./leadershipModel');

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
  // Implementation depends on how you want to store/retrieve the ORBAT structure
  // For now, we'll return a placeholder
  return {
    id: "1st_army",
    name: "1st Army",
    type: "Army",
    subordinates: [
      // ... (rest of the structure)
    ]
  };
}

module.exports = { getOrbatStructure, getLeadershipAssignments, updateLeadership };