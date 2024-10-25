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
client.once('ready', async () => {
    console.log(`Bot logged in as ${client.user.tag}`);
    
    // Force fetch all guilds and their members
    try {
        const guilds = await client.guilds.fetch();
        console.log(`Cached ${guilds.size} guilds`);
        
        // Cache members for each guild
        for (const [id, guild] of guilds) {
            try {
                const members = await guild.members.fetch();
                console.log(`Cached ${members.size} members for guild ${guild.name}`);
            } catch (error) {
                console.error(`Failed to cache members for guild ${guild.name}:`, error);
            }
        }
    } catch (error) {
        console.error('Failed to cache guilds:', error);
    }

    // Call this function when the bot starts up
    syncServerMembers();
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
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('your_database_name');
        const collection = db.collection('server_members');

        // Clear existing members
        await collection.deleteMany({});

        // Fetch all guilds the bot is in
        const guilds = await client.guilds.fetch();

        for (const [guildId, guild] of guilds) {
            let members;
            try {
                members = await guild.members.fetch();
            } catch (error) {
                console.error(`Failed to fetch members for guild ${guild.name}: ${error.message}`);
                continue; // Skip to the next guild
            }
            for (const [memberId, member] of members) {
                await collection.updateOne(
                    { userId: memberId },
                    { 
                        $set: { 
                            userId: memberId,
                            username: member.user.username,
                            discriminator: member.user.discriminator,
                            guildId: guildId
                        }
                    },
                    { upsert: true }
                );
            }
        }
        console.log('Server members synced to database');
    } catch (error) {
        console.error('Error syncing server members:', error);
    } finally {
        await client.close();
    }
}

// You might want to run this periodically, e.g., every hour
setInterval(syncServerMembers, 60 * 60 * 1000);

module.exports = client;
