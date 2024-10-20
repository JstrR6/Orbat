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

    const army = new Orbat({
      id: '1st_army',
      name: '1st Army',
      type: 'Army'
    });

    const infantryCorp = new Orbat({
      id: '11th_infantry_corps',
      name: '11th Infantry Corps',
      type: 'Corps'
    });

    const infantryDivision = new Orbat({
      id: '101st_infantry_division',
      name: '101st Infantry Division',
      type: 'Division'
    });

    const infantrySquadron1 = new Orbat({
      id: '111th_infantry_squadron',
      name: '111th Infantry Squadron',
      type: 'Squadron'
    });

    const infantrySquadron2 = new Orbat({
      id: '112th_infantry_squadron',
      name: '112th Infantry Squadron',
      type: 'Squadron'
    });

    const supportSquadron = new Orbat({
      id: '113th_support_squadron',
      name: '113th Support Squadron',
      type: 'Squadron'
    });

    infantryDivision.subordinates = [infantrySquadron1._id, infantrySquadron2._id, supportSquadron._id];
    infantryCorp.subordinates = [infantryDivision._id];
    army.subordinates = [infantryCorp._id];

    await infantrySquadron1.save();
    await infantrySquadron2.save();
    await supportSquadron.save();
    await infantryDivision.save();
    await infantryCorp.save();
    await army.save();

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