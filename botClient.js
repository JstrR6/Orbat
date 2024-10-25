const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const { MongoClient } = require('mongodb');

// Create bot client with all necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        // Add any other intents you need
    ]
});

// Add ready event handler with guild caching
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    setTimeout(syncServerMembers, 5000); // Wait 5 seconds before syncing
});

// Add debug logging
client.on('debug', info => {
    if (info.includes('GUILD') || info.includes('READY')) {
        console.log('Discord Debug:', info);
    }
});

// Login with error handling
client.login(config.discord.botToken)
    .then(() => console.log('Bot client successfully logged in'))
    .catch(error => {
        console.error('Bot client login failed:', error);
        process.exit(1);
    });

if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set in the environment variables');
    process.exit(1);
}

if (!process.env.DISCORD_BOT_TOKEN) {
    console.error('DISCORD_BOT_TOKEN is not set in the environment variables');
    process.exit(1);
}

async function syncServerMembers() {
    try {
        const guilds = await client.guilds.fetch();
        console.log(`Bot is in ${guilds.size} guilds`);
        for (const [guildId, guild] of guilds) {
            try {
                const fullGuild = await guild.fetch();
                const members = await fullGuild.members.fetch();
                console.log(`Synced ${members.size} members from ${fullGuild.name}`);
                // Process members here
            } catch (error) {
                if (error.code === 'NOT_FOUND') {
                    console.error(`Guild not found or bot doesn't have access: ${guildId}`);
                } else {
                    console.error(`Error fetching guild ${guildId}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error syncing server members:', error);
    }
}

// You might want to run this periodically, e.g., every hour
setInterval(syncServerMembers, 60 * 60 * 1000);

module.exports = client;
