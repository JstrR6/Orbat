const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const dotenv = require('dotenv');
const militaryRanks = require('./ranks');

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

// Function to get roles that match military ranks
function getMilitaryRoles(guild) {
  return guild.roles.cache.filter(role => militaryRanks.includes(role.name));
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  // Set the bot's activity
  client.user.setPresence({
    activities: [{ name: 'ORBAT Management', type: ActivityType.Playing }],
    status: 'online',
  });
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
    } else if (command === 'ranks') {
      const militaryRoles = getMilitaryRoles(message.guild);
      if (militaryRoles.size > 0) {
        const roleList = militaryRoles.map(role => role.name).join(', ');
        await message.reply(`Military ranks found in this server: ${roleList}`);
      } else {
        await message.reply('No military ranks found in this server.');
      }
    }
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
