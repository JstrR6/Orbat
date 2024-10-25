const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isAuthenticated, hasGuildPermission } = require('./auth');
const { getUserInfo, getUsersByGuild } = require('./mongo');
const Announcement = require('./models/Announcement');

// Public routes
router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    res.render('login');
});

// Protected routes
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', {
        user: req.user,
        guilds: req.user.guilds
    });
});

// Example of a route that requires specific guild permissions
router.get('/guild/:guildId', 
    isAuthenticated,
    hasGuildPermission('GUILD_ID', 'Admin'), // Replace GUILD_ID with actual guild ID
    (req, res) => {
        const guild = req.user.guilds.find(g => g.id === req.params.guildId);
        res.render('guild', { guild });
    }
);

// Auth routes
router.get('/auth/discord', passport.authenticate('discord'));
router.get('/auth/callback', 
    passport.authenticate('discord', {
        failureRedirect: '/login'
    }), 
    (req, res) => res.redirect('/dashboard')
);

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/login');
    });
});

// Example route to get user's guild info
router.get('/api/user/:discordId/guilds', isAuthenticated, async (req, res) => {
    try {
        const user = await getUserInfo(req.params.discordId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user.guilds);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Example route to get all users in a guild
router.get('/api/guild/:guildId/users', isAuthenticated, async (req, res) => {
    try {
        const users = await getUsersByGuild(req.params.guildId);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add these routes to handle announcements
router.get('/api/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ date: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load announcements' });
    }
});

router.post('/api/announcements', async (req, res) => {
    try {
        const announcement = new Announcement(req.body);
        await announcement.save();
        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create announcement' });
    }
});

router.put('/api/announcements/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(announcement);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update announcement' });
    }
});

router.delete('/api/announcements/:id', async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
});

// Add this route to check the current session state
router.get('/session-check', (req, res) => {
    res.json({
        sessionID: req.sessionID,
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    });
});

module.exports = router;
