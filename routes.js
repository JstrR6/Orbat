const express = require('express');
const router = express.Router();
const passport = require('passport');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

// Routes
router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    res.render('login');
});

router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user });
});

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/login');
    });
});

// Discord OAuth routes
router.get('/auth/discord', passport.authenticate('discord'));

router.get('/auth/callback', 
    passport.authenticate('discord', {
        failureRedirect: '/login'
    }), 
    (req, res) => {
        res.redirect('/dashboard');
    }
);

module.exports = router;
