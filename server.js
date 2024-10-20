const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User model
const User = mongoose.model('User', new mongoose.Schema({
  discordId: String,
  username: String,
  guilds: Array
}));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production" }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});

// Discord strategy
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'guilds']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Discord profile:', profile);
      let user = await User.findOne({ discordId: profile.id });
      if (!user) {
        user = new User({
          discordId: profile.id,
          username: profile.username,
          guilds: profile.guilds
        });
        await user.save();
      }
      return done(null, user);
    } catch (error) {
      console.error('Error in Discord strategy:', error);
      return done(error, null);
    }
  }
));

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the dashboard. <a href="/auth/discord">Login with Discord</a>');
});

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', 
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    console.log('Authentication successful. User:', req.user);
    res.redirect('/dashboard');
  }
);

app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Welcome to your dashboard, ${req.user.username}!`);
  } else {
    res.redirect('/auth/discord');
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('An error occurred');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));