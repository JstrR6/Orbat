// server.js
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./client/server/src/routes/auth');
const unitsRoutes = require('./client/server/src/routes/units');
const formsRoutes = require('./client/server/src/routes/forms');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Session
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

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/src')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/forms', formsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve React frontend for any non-API routes
app.get('*', (req, res) => {
  // Create a simple HTML page that loads your React components
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>USM Dashboard</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body>
        <div id="root"></div>
        <script type="text/babel" src="/components/Layout.jsx"></script>
        <script type="text/babel">
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(
                <React.StrictMode>
                    <Layout />
                </React.StrictMode>
            );
        </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});