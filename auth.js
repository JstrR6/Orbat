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

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'guilds', 'guilds.members.read']
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // Get the user's guild (server) information
        const guild = profile.guilds.find(g => g.id === process.env.DISCORD_GUILD_ID);
        
        if (!guild) {
            return done(null, false, { message: 'User is not a member of the required server' });
        }

        // Convert guild permissions number to roles array
        const roles = guild.roles || [];
        const highestRole = Math.max(...roles);

        let user = await User.findOne({ discordId: profile.id });
        if (!user) {
            user = await User.create({
                discordId: profile.id,
                username: profile.username,
                discriminator: profile.discriminator,
                avatar: profile.avatar,
                roles: roles,
                highestRole: highestRole
            });
        } else {
            // Update existing user's roles
            user.roles = roles;
            user.highestRole = highestRole;
            await user.save();
        }
        
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

module.exports = { passport, ensureAuthenticated };
