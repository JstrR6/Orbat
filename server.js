const { Client, GatewayIntentBits } = require('discord.js');
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
  console.log('Discord bot is ready!');
});

// Listen for messages
client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Check if the message starts with '!'
  if (message.content.startsWith('!')) {
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Handle commands
    if (command === 'ping') {
      await message.reply('Pong!');
    } else if (command === 'orbat') {
      // TODO: Implement ORBAT command
      await message.reply('ORBAT command not yet implemented.');
    }
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
