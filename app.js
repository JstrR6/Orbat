const express = require('express');
const path = require('path');
const { initializeDiscordBot } = require('./server');
const { getOrbatStructure, getLeadershipAssignments, updateLeadership } = require('./orbatdata');
const militaryRanks = require('./ranks');
const connectDB = require('./db');

const app = express();
const port = process.env.PORT || 3000;

connectDB().then(() => {
  // Initialize ORBAT structure after database connection is established
  initializeOrbatStructure();
});

// Initialize Discord Bot
const discordClient = initializeDiscordBot();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'ORBAT Viewer' });
});

app.get('/rank-structure', (req, res) => {
  res.render('rankStructure', { title: 'Rank Structure', ranks: militaryRanks });
});

app.get('/orbat', async (req, res) => {
  try {
    const structure = await getOrbatStructure();
    const leadership = await getLeadershipAssignments();
    res.render('orbat', { title: 'ORBAT', structure, leadership });
  } catch (error) {
    console.error('Error loading ORBAT data:', error);
    res.status(500).send('Error loading ORBAT data');
  }
});

app.get('/forms', (req, res) => {
  res.render('forms', { title: 'Forms' });
});

app.get('/orders', (req, res) => {
  res.render('orders', { title: 'Orders By The General' });
});

// API Routes
app.post('/api/update-leadership', async (req, res) => {
  const { unitId, position, name } = req.body;
  try {
    const success = await updateLeadership(unitId, position, name);
    if (success) {
      res.json({ message: 'Leadership updated successfully' });
    } else {
      res.status(400).json({ message: 'Failed to update leadership' });
    }
  } catch (error) {
    console.error('Error updating leadership:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/api/orbat', async (req, res) => {
  try {
    const structure = await getOrbatStructure();
    const leadership = await getLeadershipAssignments();
    res.json({ structure, leadership });
  } catch (error) {
    console.error('Error fetching ORBAT data:', error);
    res.status(500).json({ message: 'Error fetching ORBAT data' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  console.error('Error stack:', err.stack);
  res.status(500).send(`Something went wrong! Error: ${err.message}`);
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).send("Sorry, can't find that!");
});

// Start the server
app.listen(port, () => {
  console.log(`Web server running on http://localhost:${port}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Application is shutting down...');
  discordClient.destroy();
  process.exit(0);
});

module.exports = app;