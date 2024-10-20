const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User model
const UserSchema = new mongoose.Schema({
  discordId: String,
  username: String,
  avatar: String,
  email: String,
  guilds: [{
    id: String,
    name: String,
    roles: [{
      id: String,
      name: String,
      position: Number
    }],
    highestRole: {
      id: String,
      name: String,
      position: Number
    }
  }]
});

const User = mongoose.model('User', UserSchema);

// Passport setup
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify', 'email', 'guilds', 'guilds.members.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ discordId: profile.id });
    
    // Fetch user's guilds and roles
    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const guilds = await guildsResponse.json();

    const userGuilds = await Promise.all(guilds.map(async (guild) => {
      const memberResponse = await fetch(`https://discord.com/api/users/@me/guilds/${guild.id}/member`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const member = await memberResponse.json();

      // Sort roles by position (highest first)
      const sortedRoles = member.roles.sort((a, b) => b.position - a.position);

      return {
        id: guild.id,
        name: guild.name,
        roles: sortedRoles.map(role => ({
          id: role.id,
          name: role.name,
          position: role.position
        })),
        highestRole: sortedRoles[0] ? {
          id: sortedRoles[0].id,
          name: sortedRoles[0].name,
          position: sortedRoles[0].position
        } : null
      };
    }));

    if (!user) {
      user = new User({
        discordId: profile.id,
        username: profile.username,
        email: profile.email,
        avatar: profile.avatar,
        guilds: userGuilds
      });
    } else {
      user.username = profile.username;
      user.email = profile.email;
      user.avatar = profile.avatar;
      user.guilds = userGuilds;
    }

    await user.save();
    done(null, user);
  } catch (err) {
    console.error(err);
    done(err, null);
  }
}));

// Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', passport.authenticate('discord', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect('/dashboard');
});

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user });
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));