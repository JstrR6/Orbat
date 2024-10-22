const express = require('express');
const router = express.Router();
const { client, botStats } = require('./bot');
const User = require('./models/User');

router.get('/', async (req, res) => {
  const guilds = client.guilds.cache.size;
  const users = client.users.cache.size;
  
  const user = await User.findOne({ discordId: req.session.user.discordId });
  
  res.render('dashboard', {
    guilds,
    users,
    messageCount: botStats.messageCount,
    commandCount: botStats.commandCount,
    user
  });
});

router.post('/update-user', async (req, res) => {
  const { highestRole, xp } = req.body;
  
  try {
    const user = await User.findOne({ discordId: req.session.user.discordId });
    if (user) {
      user.highestRole = highestRole;
      user.xp = parseInt(xp, 10);
      await user.save();
      res.redirect('/dashboard');
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Error updating user');
  }
});

module.exports = router;