const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const { passport, ensureAuthenticated } = require('./auth');
const dashboardRoutes = require('./dashboard');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.render('login', { user: req.user });
  }
});

// Discord authentication routes
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', 
  passport.authenticate('discord', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('Authentication successful, user:', req.user);
    console.log('Session:', req.session);
    console.log('Is Authenticated:', req.isAuthenticated());
    res.redirect('/dashboard');
  }
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      res.redirect('/');
    });
  });
});

// Dashboard routes
app.use('/dashboard', (req, res, next) => {
  console.log('Dashboard route hit');
  console.log('Is Authenticated:', req.isAuthenticated());
  console.log('User:', req.user);
  if (!req.isAuthenticated()) {
    console.log('User not authenticated, redirecting to login');
    return res.redirect('/login');
  }
  next();
}, dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  res.status(500).send('Something broke! Error: ' + err.message);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
