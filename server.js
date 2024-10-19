const { Client, GatewayIntentBits, Collection } = require('discord.js');
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

// Define the military ranks
const militaryRanks = [
  'Private', 'Private First Class', 'Specialist', 'Corporal', 'Sergeant', 
  'Staff Sergeant', 'Sergeant First Class', 'Master Sergeant', 'First Sergeant', 
  'Sergeant Major', 'Command Sergeant Major', 'Sergeant Major of the Armed Forces', 
  'Second Lieutenant', 'First Lieutenant', 'Captain', 'Major', 'Lieutenant Colonel', 
  'Colonel', 'Brigadier General', 'Major General', 'Lieutenant General', 'General', 
  'General of the Armed Forces'
];

// Function to get roles that match military ranks
function getMilitaryRoles(guild) {
  return guild.roles.cache.filter(role => militaryRanks.includes(role.name));
}

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

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
