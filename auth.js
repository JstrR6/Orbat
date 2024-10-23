const User = require('./models/User');
const crypto = require('crypto');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { client } = require('./bot');  // Import the Discord client from your bot file

const generateToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

const authenticate = async (req, res, next) => {
  const { token } = req.body;
  
  try {
    const user = await User.findOne({ token });
    if (user) {
      user.lastLogin = Date.now();
      await user.save();
      req.session.user = user;
      res.redirect('/dashboard');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.redirect('/login');
  }
};

const ensureAuthenticated = (req, res, next) => {
  console.log('ensureAuthenticated called');
  console.log('Is Authenticated:', req.isAuthenticated());
  console.log('User:', req.user);
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

const createOrUpdateUser = async (discordId, username, highestRole) => {
  try {
    let user = await User.findOne({ discordId });
    if (!user) {
      user = new User({ discordId, username, highestRole });
    } else {
      user.username = username;
      user.highestRole = highestRole;
    }
    user.token = generateToken();
    await user.save();
    return user.token;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return null;
  }
};

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user));
});

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify', 'guilds']  // Added 'guilds' scope to get server info
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find the highest role across all mutual servers
    let highestRole = 'Member';  // Default role
    let highestPosition = -1;

    // Loop through the user's guilds (servers)
    for (const guild of profile.guilds) {
      const botGuild = client.guilds.cache.get(guild.id);
      if (botGuild) {  // If the bot is in this server
        const member = await botGuild.members.fetch(profile.id).catch(() => null);
        if (member) {
          const topRole = member.roles.highest;
          if (topRole && topRole.position > highestPosition) {
            highestPosition = topRole.position;
            highestRole = topRole.name;
          }
        }
      }
    }

    // Find or create user in database
    let user = await User.findOne({ discordId: profile.id });
    if (!user) {
      user = await User.create({
        discordId: profile.id,
        username: profile.username,
        highestRole: highestRole,
        xp: 0
      });
    } else {
      // Update existing user's role if it changed
      user.highestRole = highestRole;
      user.username = profile.username;
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    console.error('Auth error:', err);
    return done(err, null);
  }
}));

module.exports = { passport, ensureAuthenticated };
