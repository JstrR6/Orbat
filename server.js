const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const { passport } = require('./auth');
const User = require('./models/User');
const Order = require('./models/Order');
const path = require('path');
const Training = require('./models/Training');
const MongoStore = require('connect-mongo');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: true,  // Changed to true
    saveUninitialized: true,  // Changed to true
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // 1 day
    })
}));

// Initialize passport after session middleware
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
    (req, res) => res.redirect('/dashboard')
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
  res.render('forms/training', { user: req.user });
});

app.post('/forms/training/submit', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    try {
        const { trainerId, attendeeIds, xpAmount } = req.body;
        const attendeeList = attendeeIds.split('\n').map(id => id.trim()).filter(Boolean);
        const xpNum = Number(xpAmount);

        // Validate trainer
        const trainer = await User.findOne({ discordId: trainerId });
        if (!trainer || !trainer.roles.some(role => role.name === 'Drill Instructor')) {
            return res.render('forms/training', {
                error: 'Trainer must have Drill Instructor role',
                user: req.user
            });
        }

        // Validate attendees
        for (const attendeeId of attendeeList) {
            const attendee = await User.findOne({ discordId: attendeeId });
            
            // Check if attendee exists
            if (!attendee) {
                return res.render('forms/training', {
                    error: `Attendee ${attendeeId} not found`,
                    user: req.user
                });
            }

            // Check if attendee is not a Commissioned Officer
            if (attendee.roles.some(role => role.name === 'Commissioned Officer')) {
                return res.render('forms/training', {
                    error: 'Attendees cannot be Commissioned Officers',
                    user: req.user
                });
            }

            // Check for spam (3 submissions in 5 minutes)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const recentSubmissions = await Training.countDocuments({
                attendeeIds: attendeeId,
                submittedAt: { $gte: fiveMinutesAgo }
            });

            if (recentSubmissions >= 3) {
                return res.render('forms/training', {
                    error: `Too many recent submissions for ${attendeeId}`,
                    user: req.user
                });
            }
        }

        // Create training record
        const training = new Training({
            trainerId,
            attendeeIds: attendeeList,
            xpAmount: xpNum,
            trainingType: 'basic',
            status: xpNum >= 10 ? 'pending' : 'approved',
            submittedBy: req.user.discordId
        });

        await training.save();

        // If XP is less than 10, update immediately
        if (xpNum < 10) {
            for (const attendeeId of attendeeList) {
                await User.findOneAndUpdate(
                    { discordId: attendeeId },
                    { $inc: { xp: xpNum } }
                );
            }
            return res.redirect('/forms?success=true');
        }

        // If XP is 10 or more, redirect to pending approval
        return res.redirect('/forms?pending=true');

    } catch (error) {
        console.error('Training submission error:', error);
        return res.render('forms/training', {
            error: 'An error occurred while submitting the training',
            user: req.user
        });
    }
});

// Officer training form routes
app.get('/forms/officer-training', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.render('forms/officer-training', { user: req.user });
});

app.post('/forms/officer-training/submit', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  try {
    const { trainerId, attendeeIds, description } = req.body;
    const attendeeList = attendeeIds.split('\n').map(id => id.trim()).filter(id => id);

    // Check if trainer has High Command role
    const trainer = await User.findOne({ discordId: trainerId });
    if (!trainer || !trainer.roles.some(role => role.name === 'High Command')) {
      return res.status(400).send('Trainer must have High Command role');
    }

    // Check if attendees have Commissioned Officer role
    for (const attendeeId of attendeeList) {
      const attendee = await User.findOne({ discordId: attendeeId });
      if (!attendee || !attendee.roles.some(role => role.name === 'Commissioned Officer')) {
        return res.status(400).send('Attendees must be Commissioned Officers');
      }
    }

    // Create officer training record
    const training = new Training({
      trainerId,
      attendeeIds: attendeeList,
      type: 'officer',
      description,
      status: 'approved' // Officer training is auto-approved
    });

    await training.save();
    res.redirect('/forms?success=true');
  } catch (error) {
    console.error('Officer training submission error:', error);
    res.status(500).send('Error submitting officer training');
  }
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
