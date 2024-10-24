const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config');

// Create bot client
const client = new Client({
    intents: config.bot.intents.map(intent => GatewayIntentBits[intent])
});

// Login
client.login(config.discord.botToken)
    .then(() => console.log('Bot client ready for auth system'))
    .catch(error => {
        console.error('Bot client login failed:', error);
        process.exit(1);
    });

module.exports = client;
