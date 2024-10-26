// Import necessary modules
require('dotenv').config();  // Loads .env file contents into process.env
const { Client, GatewayIntentBits } = require('discord.js');

// Create a new Discord client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Log the bot in using the token from the .env file
client.login(process.env.DISCORD_TOKEN).then(() => {
    console.log('Bot successfully logged in');
}).catch((error) => {
    console.error('Failed to login:', error);
});

// When the client is ready, run this code once
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Example command handler
client.on('messageCreate', (message) => {
    if (message.content === '!hello' && !message.author.bot) {
        message.channel.send('Hello there! 👋');
    }
});

// Access Client ID and Client Secret if needed
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

console.log(`Client ID: ${clientId}`);
console.log(`Client Secret: ${clientSecret}`);
