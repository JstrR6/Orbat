const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const { passport } = require('./auth');
const User = require('./models/User');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

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
app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.render('login', { user: req.user });
  }
});

app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', 
  passport.authenticate('discord', { failureRedirect: '/login' }),
  (req, res) => res.redirect('/dashboard')
);

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

app.post('/dashboard/add-order', requireHighCommand, async (req, res) => {
  try {
    const { orderName, orderContent } = req.body;
    
    // Create new order
    const newOrder = new Order({
      name: orderName,
      content: orderContent,
      createdBy: req.user.username
    });

    // Save to database
    await newOrder.save();
    console.log('New order saved:', newOrder);
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).send('Error adding order');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
