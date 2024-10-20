const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const mongoose = require('mongoose');
const session = require('express-session'); // Add express-session

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => console.error('MongoDB connection error:', err));

const app = express();

// User Schema
const userSchema = new mongoose.Schema({
  discordUsername: String,
  discordId: String,
  highestRole: String,
  xp: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Session setup (necessary for passport to track login sessions)
app.use(session({
  secret: process.env.SESSION_SECRET || 'some-random-secret',  // You can replace with a secure secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }  // Set to true if using https
}));

// Initialize Passport and sessions
app.use(passport.initialize());
app.use(passport.session());  // Enable session support in Passport

// Passport OAuth strategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: 'https://usm-dashboard.onrender.com/callback',
  scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Save or update user info in MongoDB
    const user = await User.findOneAndUpdate(
      { discordId: profile.id },
      { discordUsername: profile.username, discordId: profile.id },
      { upsert: true, new: true }
    );
    return done(null, user);
  } catch (error) {
    console.error('Error in DiscordStrategy:', error);
    return done(error, null);
  }
}));

// Serialize and deserialize users for session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Routes
app.get('/verify/:id', (req, res) => {
  res.redirect('/auth/discord');
});

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
  res.send('Successfully verified! You can close this window.');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
