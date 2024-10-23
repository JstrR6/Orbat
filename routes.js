const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isAuthenticated, hasGuildPermission } = require('./auth');
const { getUserInfo, getUsersByGuild } = require('./mongo');

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

module.exports = router;
