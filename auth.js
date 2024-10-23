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

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Get user's server info
        const guild = profile.guilds.find(g => g.id === process.env.DISCORD_GUILD_ID);
        
        // Save user to database
        let user = await User.findOne({ discordId: profile.id });
        if (!user) {
            user = new User({
                discordId: profile.id,
                username: profile.username,
                roles: guild ? guild.roles : [],
                highestRole: guild ? guild.roles[0] : null
            });
        }
        await user.save();
        
        // Done - go to dashboard
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

module.exports = { passport, ensureAuthenticated };
