const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config');

// Create bot client with all necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ]
});

// Add ready event handler
client.once('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}`);
    console.log(`Bot is in ${client.guilds.cache.size} guilds`);
});

// Add debug logging
client.on('debug', info => {
    if (info.includes('GUILD') || info.includes('READY')) {
        console.log('Discord Debug:', info);
    }
});

// Login with error handling
client.login(config.discord.botToken)
    .then(() => {
        console.log('Bot client successfully logged in');
        // Force fetch all guilds on startup
        return client.guilds.fetch();
    })
    .then(guilds => {
        console.log(`Fetched ${guilds.size} guilds`);
    })
    .catch(error => {
        console.error('Bot client login failed:', error);
        process.exit(1);
    });

module.exports = client;
