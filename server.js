const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  // Set the bot's activity
  client.user.setPresence({
    activities: [{ name: 'ORBAT Management', type: ActivityType.Playing }],
    status: 'online',
  });
});

// Basic message listener (placeholder for future command handling)
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

// Error handling
client.on('error', console.error);
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('Bot logged in successfully'))
  .catch(error => console.error('Failed to log in:', error));
