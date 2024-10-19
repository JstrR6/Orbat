const express = require('express');
const path = require('path');
const { initializeDiscordBot } = require('./server');

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

app.get('/api/orbat', (req, res) => {
  // TODO: Implement ORBAT data retrieval
  res.json({ message: 'ORBAT data will be served here' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server Started on: ${port}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Application is shutting down...');
  discordClient.destroy();
  process.exit(0);
});