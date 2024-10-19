const fs = require('fs').promises;
const path = require('path');

const structureFilePath = path.join(__dirname, 'orbatStructure.json');
const leadershipFilePath = path.join(__dirname, 'leadershipAssignments.json');

async function getOrbatStructure() {
    try {
      const data = await fs.readFile(structureFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading ORBAT structure:', error);
      return null;
    }
  }

  async function getLeadershipAssignments() {
    try {
      const data = await fs.readFile(leadershipFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading leadership assignments:', error);
      return null;
    }
  }

async function updateLeadership(unitId, position, name) {
  try {
    let leadershipAssignments = await getLeadershipAssignments();
    if (leadershipAssignments[unitId] && leadershipAssignments[unitId].hasOwnProperty(position)) {
      leadershipAssignments[unitId][position] = name;
      await fs.writeFile(leadershipFilePath, JSON.stringify(leadershipAssignments, null, 2));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating leadership:', error);
    return false;
  }
}

module.exports = { getOrbatStructure, getLeadershipAssignments, updateLeadership };