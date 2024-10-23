const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

// Express app setup
const app = express();
const port = 3000; // Change this to your preferred port

// Discord bot setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ]
});

// Configuration - Replace these with your values
const config = {
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    botToken: 'YOUR_BOT_TOKEN',
    callbackURL: 'https://usm-dashboard.onrender.com/auth/callback',
};

// Passport configuration
passport.use(new DiscordStrategy({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    scope: ['identify', 'email']
}, function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
}));

// Express routes
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), function(req, res) {
    res.redirect('/dashboard');
});

// Start Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Bot commands
client.on('messageCreate', async message => {
    if (message.content.toLowerCase() === '!login') {
        try {
            // Create login URL
            const loginURL = `https://discord.com/oauth2/authorize?client_id=${config.clientID}&redirect_uri=${encodeURIComponent(config.callbackURL)}&response_type=code&scope=identify%20email`;

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle('USM Dashboard')
                .setDescription(`Click [here](${loginURL}) to login!`)
                .setColor('#7289DA')
                .setTimestamp();

            // DM the user
            await message.author.send({ embeds: [embed] });
            
            // If the command was used in a server, acknowledge it
            if (message.guild) {
                await message.reply('I\'ve sent you a DM with the login link!');
            }
        } catch (error) {
            console.error('Error sending DM:', error);
            await message.reply('Sorry, I couldn\'t send you a DM. Please make sure your DMs are open!');
        }
    }
});

// Bot login
client.login(config.botToken);

// Bot ready event
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
