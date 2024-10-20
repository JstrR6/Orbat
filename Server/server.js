const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => console.error(err));

// Express app setup
const app = express();

// User Schema
const userSchema = new mongoose.Schema({
  discordUsername: String,
  discordId: String,
  highestRole: String,
  xp: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Setup Discord OAuth
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: 'https://usm-dashboard.onrender.com/callback',
  scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
  // Save or update user info in MongoDB
  const user = await User.findOneAndUpdate(
    { discordId: profile.id },
    { discordUsername: profile.username, discordId: profile.id },
    { upsert: true, new: true }
  );
  return done(null, user);
}));

app.use(passport.initialize());

app.get('/verify/:id', (req, res) => {
  res.redirect('/auth/discord');
});

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
  res.send('Successfully verified! You can close this window.');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
