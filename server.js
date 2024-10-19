const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

function initializeDiscordBot() {
  console.log('Starting bot...');

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    client.user.setPresence({
      activities: [{ name: 'ORBAT Management', type: ActivityType.Playing }],
      status: 'online',
    });
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    if (message.content === '!ping') {
      await message.reply('Pong!');
    }
  });

  client.on('error', error => {
    console.error('Discord client error:', error);
  });

  console.log('Attempting to log in...');
  client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log('Bot logged in successfully'))
    .catch(error => {
      console.error('Failed to log in:', error);
      console.log('DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? 'Token is set' : 'Token is not set');
    });

  return client;
}

module.exports = { initializeDiscordBot };