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
    // Track both highest role and all roles
    let highestRole = 'Member';
    let highestPosition = -1;
    let allRoles = [];

    // Loop through the user's guilds (servers)
    for (const guild of profile.guilds) {
      const botGuild = client.guilds.cache.get(guild.id);
      if (botGuild) {  // If the bot is in this server
        const member = await botGuild.members.fetch(profile.id).catch(() => null);
        if (member) {
          // Get all roles for this member in this server
          member.roles.cache.forEach(role => {
            if (role.name !== '@everyone') {  // Skip the default role
              allRoles.push({
                name: role.name,
                position: role.position,
                guildName: botGuild.name
              });
            }
          });

          // Update highest role if necessary
          const topRole = member.roles.highest;
          if (topRole && topRole.position > highestPosition) {
            highestPosition = topRole.position;
            highestRole = topRole.name;
          }
        }
      }
    }

    // Sort roles by position (highest first)
    allRoles.sort((a, b) => b.position - a.position);

    // Find or create user in database
    let user = await User.findOne({ discordId: profile.id });
    if (!user) {
      user = await User.create({
        discordId: profile.id,
        username: profile.username,
        highestRole: highestRole,
        roles: allRoles,  // Store all roles
        xp: 0
      });
    } else {
      // Update existing user's roles
      user.highestRole = highestRole;
      user.roles = allRoles;
      user.username = profile.username;
      await user.save();
    }

    console.log('User saved with roles:', user);
    return done(null, user);
  } catch (err) {
    console.error('Auth error:', err);
    return done(err, null);
  }
}));

module.exports = { passport, ensureAuthenticated };
