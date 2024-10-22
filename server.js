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

// Session setup
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

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/forms', formsRoutes);

// Serve the main HTML file for all routes
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>USM Dashboard</title>
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
        </style>
    </head>
    <body>
        <div id="root"></div>
        <script type="text/babel">
            const Dashboard = () => {
                const [activeTab, setActiveTab] = React.useState('dashboard');

                const menuItems = [
                    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                    { id: 'orbat', label: 'ORBAT', icon: '👥' },
                    { id: 'forms', label: 'Forms', icon: '📝' },
                    { id: 'orders', label: 'Orders', icon: '📋' },
                    { id: 'profile', label: 'Profile', icon: '👤' }
                ];

                return (
                    <div className="min-h-screen bg-gray-100">
                        {/* Header */}
                        <header className="bg-white shadow">
                            <div className="max-w-7xl mx-auto px-4 py-6">
                                <h1 className="text-3xl font-bold text-gray-900">USM Dashboard</h1>
                            </div>
                        </header>

                        <div className="flex">
                            {/* Sidebar */}
                            <div className="w-64 min-h-screen bg-white shadow-lg">
                                <nav className="mt-5">
                                    {menuItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={\`w-full text-left px-4 py-2 flex items-center space-x-2 \${
                                                activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                            }\`}
                                        >
                                            <span>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 p-8">
                                <div className="max-w-7xl mx-auto">
                                    {activeTab === 'dashboard' && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-white p-6 rounded-lg shadow">
                                                <h3 className="text-lg font-semibold">Unit Status</h3>
                                                <p className="text-3xl font-bold mt-2">Active</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-lg shadow">
                                                <h3 className="text-lg font-semibold">Pending Forms</h3>
                                                <p className="text-3xl font-bold mt-2">3</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-lg shadow">
                                                <h3 className="text-lg font-semibold">Active Orders</h3>
                                                <p className="text-3xl font-bold mt-2">2</p>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'orbat' && (
                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-xl font-bold mb-4">ORBAT</h2>
                                            <p>ORBAT content will go here</p>
                                        </div>
                                    )}
                                    {activeTab === 'forms' && (
                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-xl font-bold mb-4">Forms</h2>
                                            <p>Forms content will go here</p>
                                        </div>
                                    )}
                                    {activeTab === 'orders' && (
                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-xl font-bold mb-4">Orders</h2>
                                            <p>Orders content will go here</p>
                                        </div>
                                    )}
                                    {activeTab === 'profile' && (
                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <h2 className="text-xl font-bold mb-4">Profile</h2>
                                            <p>Profile content will go here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            };

            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(
                <React.StrictMode>
                    <Dashboard />
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