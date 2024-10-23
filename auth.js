const User = require('./models/User');
const crypto = require('crypto');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

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
  if (req.isAuthenticated()) {
    return next();
  }
  // Instead of redirecting, send a 401 status
  res.status(401).json({ error: 'Unauthorized' });
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
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ discordId: profile.id });
    if (!user) {
      user = new User({
        discordId: profile.id,
        username: profile.username,
        // Add other fields as needed
      });
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = { 
  ensureAuthenticated,
  passport // Add this line
};
