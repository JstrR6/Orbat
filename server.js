const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const { passport } = require('./auth');
const User = require('./models/User');
const Order = require('./models/Order');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
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

app.use(passport.initialize());
app.use(passport.session());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to check for High Command role
const requireHighCommand = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  
  const hasHighCommand = req.user.roles && 
    req.user.roles.some(role => role.name.toLowerCase() === 'high command');
  
  if (!hasHighCommand) {
    console.log('Unauthorized attempt to add order by:', req.user.username);
    return res.status(403).send('Only High Command can add orders');
  }
  
  next();
};

// Routes
app.get('/', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.redirect('/dashboard');
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
    console.log('Authentication successful');
    res.redirect('/dashboard');
  }
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Dashboard route
app.get('/dashboard', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  try {
    // Fetch all orders from the database
    const orders = await Order.find().sort({ createdAt: -1 });
    
    // Check for High Command role
    const hasHighCommand = req.user.roles && 
      req.user.roles.some(role => role.name.toLowerCase() === 'high command');

    res.render('dashboard', { 
      user: req.user,
      orders: orders,
      hasHighCommand: hasHighCommand
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Error loading dashboard');
  }
});

// Add order route (protected by High Command check)
app.post('/dashboard/add-order', requireHighCommand, async (req, res) => {
  try {
    const { orderName, orderContent } = req.body;
    
    const newOrder = new Order({
      name: orderName,
      content: orderContent,
      createdBy: req.user.username
    });

    await newOrder.save();
    console.log('New order saved:', newOrder);
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).send('Error adding order');
  }
});

// Forms routes
app.get('/forms', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.render('forms', { user: req.user });
});

// Individual form routes (to be implemented)
app.get('/forms/training', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.send('Training form - Coming soon');
});

app.get('/forms/officer-training', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.send('Officer training form - Coming soon');
});

app.get('/forms/promotion', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.send('Promotion form - Coming soon');
});

app.get('/forms/officer-promotion', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.send('Officer promotion form - Coming soon');
});

app.get('/forms/unit-assignment', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.send('Unit assignment form - Coming soon');
});

app.get('/forms/discharge', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.send('Discharge request form - Coming soon');
});

// ORBAT route (to be implemented)
app.get('/orbat', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.send('ORBAT - Coming soon');
});

// Profile route (to be implemented)
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.send('Profile - Coming soon');
});

// Settings route (to be implemented)
app.get('/settings', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.send('Settings - Coming soon');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Something broke! Error: ' + err.message);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
