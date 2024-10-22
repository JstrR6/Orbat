// server.js
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const cors = require('cors');
const DiscordStrategy = require('passport-discord').Strategy;

// Import User model - Add this at the top
const User = require('./client/server/src/models/User');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  },
  proxy: process.env.NODE_ENV === 'production'
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.serializeUser((user, done) => {
  try {
    done(null, user.id);
  } catch (err) {
    console.error('Serialize error:', err);
    done(err, null);
  }
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error('Deserialize error:', err);
    done(err, null);
  }
});

// Discord Strategy with detailed logging
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify', 'email', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Discord profile:', profile);
    
    let user = await User.findOne({ discordId: profile.id });
    console.log('Existing user:', user);

    if (!user) {
      console.log('Creating new user for Discord ID:', profile.id);
      user = await User.create({
        username: profile.username,
        discordId: profile.id,
        email: profile.email,
        roles: ['member']
      });
      console.log('New user created:', user);
    }

    return done(null, user);
  } catch (error) {
    console.error('Discord strategy error:', error);
    return done(error, null);
  }
}));

// Auth Routes with error handling
app.get('/auth/discord', (req, res, next) => {
  console.log('Starting Discord auth');
  passport.authenticate('discord')(req, res, next);
});

app.get('/auth/discord/callback', 
  (req, res, next) => {
    console.log('Received callback from Discord');
    passport.authenticate('discord', (err, user, info) => {
      if (err) {
        console.error('Auth error:', err);
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        console.error('No user:', info);
        return res.redirect('/auth/discord');
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ error: err.message });
        }
        return res.redirect('/dashboard');
      });
    })(req, res, next);
  }
);

// MongoDB Connection with error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    details: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

// Protected route for dashboard
app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: req.user,
      message: "Welcome to the dashboard"
    });
  } else {
    res.redirect('/auth/discord');
  }
});

// Auth Routes
app.get('/auth/discord', passport.authenticate('discord', {
  scope: ['identify', 'email', 'guilds']
}));

app.get('/auth/discord/callback', 
  passport.authenticate('discord', { 
    failureRedirect: '/',
    successRedirect: '/dashboard'
  })
);

// Logout route
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.redirect('/');
  });
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/forms', formsRoutes);

// Error handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Callback URL:', process.env.DISCORD_CALLBACK_URL);
});

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});