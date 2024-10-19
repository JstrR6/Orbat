const express = require('express');
const path = require('path');
const { initializeDiscordBot } = require('./server');
const militaryRanks = require('./ranks');

const app = express();
const port = process.env.PORT || 3000;

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

app.get('/orbat', (req, res) => {
  res.render('orbat', { title: 'ORBAT' });
});

app.get('/forms', (req, res) => {
  res.render('forms', { title: 'Forms' });
});

app.get('/orders', (req, res) => {
  res.render('orders', { title: 'Orders By The General' });
});

app.get('/api/orbat', (req, res) => {
  // TODO: Implement ORBAT data retrieval
  res.json({ message: 'ORBAT data will be served here' });
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