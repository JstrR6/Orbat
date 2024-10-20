const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

// Environment variable check
console.log('Environment Check:');
console.log('DISCORD_CLIENT_ID:', process.env.DISCORD_CLIENT_ID ? 'Set' : 'Not Set');
console.log('DISCORD_CLIENT_SECRET:', process.env.DISCORD_CLIENT_SECRET ? 'Set' : 'Not Set');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not Set');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? 'Set' : 'Not Set');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => console.error('MongoDB connection error:', err));

const app = express();

// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// User Schema
const userSchema = new mongoose.Schema({
  discordUsername: String,
  discordId: String,
  highestRole: String,
  xp: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'some-random-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'discord.oauth2'
}));

// Initialize Passport and sessions
app.use(passport.initialize());
app.use(passport.session());

// Passport OAuth strategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.NODE_ENV === 'production' 
    ? 'https://usm-dashboard.onrender.com/callback'
    : 'http://localhost:3000/callback',
  scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Discord profile:', profile);
    let user = await User.findOne({ discordId: profile.id });
    
    if (!user) {
      user = new User({
        discordUsername: profile.username,
        discordId: profile.id,
        highestRole: 'Member', // Default role
        xp: 0
      });
    } else {
      user.discordUsername = profile.username;
    }
    
    await user.save();
    return done(null, user);
  } catch (error) {
    console.error('Error in DiscordStrategy:', error);
    return done(error, null);
  }
}));

// Serialize and deserialize users
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

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/discord');
}

// Role-based access middleware
function checkRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.highestRole === role) {
      next();
    } else {
      res.status(403).render('error', { 
        message: 'Access denied',
        user: req.user,
        userRole: req.user?.highestRole || 'Member'
      });
    }
  };
}

// Routes
app.get('/', (req, res) => {
  res.render('dashboard', {
    user: req.user,
    userRole: req.user?.highestRole || 'Member'
  });
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', {
    user: req.user,
    userRole: req.user?.highestRole || 'Member'
  });
});

app.get('/orbat', isAuthenticated, (req, res) => {
  res.render('orbat', {
    user: req.user,
    userRole: req.user?.highestRole || 'Member'
  });
});

app.get('/forms', isAuthenticated, (req, res) => {
  res.render('forms', {
    user: req.user,
    userRole: req.user?.highestRole || 'Member'
  });
});

app.get('/orders', isAuthenticated, (req, res) => {
  res.render('orders', {
    user: req.user,
    userRole: req.user?.highestRole || 'Member'
  });
});

app.get('/users', isAuthenticated, checkRole('Commissioned Officer'), (req, res) => {
  res.render('users', {
    user: req.user,
    userRole: req.user?.highestRole || 'Member'
  });
});

app.get('/general-panel', isAuthenticated, checkRole('High Command'), (req, res) => {
  res.render('general-panel', {
    user: req.user,
    userRole: req.user?.highestRole || 'Member'
  });
});

// Discord OAuth routes
app.get('/verify/:id', (req, res) => {
  req.session.verifyUserId = req.params.id;
  res.redirect('/auth/discord');
});

app.get('/auth/discord', (req, res, next) => {
  passport.authenticate('discord', {
    scope: ['identify', 'guilds'],
    prompt: 'consent'
  })(req, res, next);
});

app.get('/callback', (req, res, next) => {
  console.log('Callback route hit');
  console.log('Query parameters:', req.query);
  
  passport.authenticate('discord', { 
    failureRedirect: '/',
    failureFlash: true
  })(req, res, (err) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.redirect('/');
    }
    console.log('Authentication successful');
    console.log('User:', req.user);
    res.redirect('/dashboard');
  });
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/');
    }
    res.redirect('/');
  });
});

// Authentication status route
app.get('/auth/status', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user || null
  });
});

app.get('/session-check', (req, res) => {
  res.json({
    session: req.session,
    user: req.user,
    isAuthenticated: req.isAuthenticated()
  });
});

// API endpoints for XP and role updates
app.get('/api/user/:id', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ discordId: req.params.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render('error', {
    message: 'Page not found',
    user: req.user,
    userRole: req.user?.highestRole || 'Member'
  });
});

app.use((err, req, res, next) => {
  console.error('Detailed error:', err);
  res.status(500).render('error', {
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
    user: req.user,
    userRole: req.user?.highestRole || 'Member'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});