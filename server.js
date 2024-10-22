const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, 'public')));

// Example API route (optional)
app.get('/api/example', (req, res) => {
  res.json({ message: 'API working!' });
});

// React routing: return React app for any route not starting with /api
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Set port for the server (use process.env.PORT for production environments)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
