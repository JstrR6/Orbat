const express = require('express');
const router = express.Router();
const User = require('./models/User');
const { client, botStats } = require('./bot');

// Root dashboard route
router.get('/', async (req, res) => {
  console.log('Dashboard root route hit');
  console.log('User:', req.user);
  try {
    const user = await User.findById(req.user.id);
    const guilds = client.guilds.cache.size;
    const users = client.users.cache.size;

    res.render('dashboard', {
      user: user,
      guilds: guilds,
      users: users,
      messageCount: botStats.messageCount,
      commandCount: botStats.commandCount
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Error loading dashboard');
  }
});

// Update user route
router.post('/update-user', async (req, res) => {
  try {
    const { highestRole, xp } = req.body;
    const user = await User.findById(req.user.id);

    if (user) {
      user.highestRole = highestRole;
      user.xp = parseInt(xp, 10);
      await user.save();
      res.redirect('/dashboard');
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).send('Error updating user');
  }
});

// Add more dashboard routes as needed

module.exports = router;
