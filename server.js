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
        <script src="https://unpkg.com/react-router-dom/umd/react-router-dom.production.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
        </style>
    </head>
    <body>
        <div id="root"></div>
        <script type="text/babel">
            const { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } = ReactRouterDOM;

            // Dashboard Home Component
            const DashboardHome = () => (
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
            );

            // ORBAT Component
            const ORBAT = () => (
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">ORBAT Management</h2>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Create Unit
                        </button>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Sample Unit Card */}
                        <div className="border rounded-lg p-4">
                            <h3 className="font-bold text-lg">1st Battalion</h3>
                            <div className="mt-2 space-y-2">
                                <p><span className="font-medium">Commander:</span> Cpt. John Doe</p>
                                <p><span className="font-medium">Strength:</span> 45</p>
                            </div>
                        </div>
                    </div>
                </div>
            );

            // Forms Component
            const Forms = () => {
                const formTypes = [
                    { id: 'training', title: 'Training Form', description: 'Request training for specific skills' },
                    { id: 'promotion', title: 'Promotion Form', description: 'Submit for rank promotion' },
                    { id: 'officer', title: 'Officer Promotion Form', description: 'Officer rank promotion request' },
                    { id: 'discharge', title: 'Discharge Request', description: 'Request for discharge from service' }
                ];

                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Forms</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            {formTypes.map((form) => (
                                <div key={form.id} className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-bold">{form.title}</h3>
                                    <p className="text-gray-600 mt-2">{form.description}</p>
                                    <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                        Fill Form
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            };

            // Orders Component
            const Orders = () => (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-6">Orders</h2>
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2">Order ID</th>
                                <th className="text-left py-2">Title</th>
                                <th className="text-left py-2">Status</th>
                                <th className="text-left py-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="py-2">001</td>
                                <td className="py-2">Operation Phoenix</td>
                                <td className="py-2">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                        Active
                                    </span>
                                </td>
                                <td className="py-2">2024-10-21</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );

            // Profile Component
            const Profile = () => (
                <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-6">Profile</h2>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-2xl">👤</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">John Doe</h3>
                                <p className="text-gray-600">Captain</p>
                            </div>
                        </div>
                        <div className="border-t pt-4 mt-4">
                            <dl className="space-y-4">
                                <div className="flex justify-between">
                                    <dt className="font-medium">Unit:</dt>
                                    <dd>1st Battalion</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="font-medium">Role:</dt>
                                    <dd>Company Commander</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="font-medium">Join Date:</dt>
                                    <dd>January 15, 2023</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            );

            // Main Dashboard Component
            const Dashboard = () => {
                const navigate = useNavigate();
                const location = useLocation();

                const menuItems = [
                    { path: '/', label: 'Dashboard', icon: '📊' },
                    { path: '/orbat', label: 'ORBAT', icon: '👥' },
                    { path: '/forms', label: 'Forms', icon: '📝' },
                    { path: '/orders', label: 'Orders', icon: '📋' },
                    { path: '/profile', label: 'Profile', icon: '👤' }
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
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={\`block px-4 py-2 flex items-center space-x-2 \${
                                                location.pathname === item.path 
                                                    ? 'bg-blue-50 text-blue-600' 
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }\`}
                                        >
                                            <span>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}
                                </nav>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 p-8">
                                <Routes>
                                    <Route path="/" element={<DashboardHome />} />
                                    <Route path="/orbat" element={<ORBAT />} />
                                    <Route path="/forms" element={<Forms />} />
                                    <Route path="/orders" element={<Orders />} />
                                    <Route path="/profile" element={<Profile />} />
                                </Routes>
                            </div>
                        </div>
                    </div>
                );
            };

            // App Root
            const App = () => (
                <BrowserRouter>
                    <Dashboard />
                </BrowserRouter>
            );

            // Render the app
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(
                <React.StrictMode>
                    <App />
                </React.StrictMode>
            );
        </script>
    </body>
    </html>
  `);
});