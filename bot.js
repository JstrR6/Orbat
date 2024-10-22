const { Client, GatewayIntentBits } = require('discord.js');
const { createOrUpdateUser } = require('./auth');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// Bot statistics
const botStats = {
  messageCount: 0,
  commandCount: 0,
};

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  botStats.messageCount++;

  if (message.content.startsWith('!')) {
    botStats.commandCount++;
  }

  if (message.content === '!login') {
    const member = message.guild.members.cache.get(message.author.id);
    const highestRole = member.roles.highest.name;
    const token = await createOrUpdateUser(message.author.id, message.author.username, highestRole);
    
    if (token) {
      const loginUrl = `${process.env.WEBSITE_URL}/login?token=${token}`;
      message.author.send(`Click here to log in to the dashboard: ${loginUrl}`);
      message.reply('I\'ve sent you a DM with the login link!');
    } else {
      message.reply('Sorry, there was an error generating your login link. Please try again later.');
    }
  }

  // Add XP for each message
  try {
    const user = await User.findOne({ discordId: message.author.id });
    if (user) {
      user.xp += 1;
      await user.save();
    }
  } catch (error) {
    console.error('Error updating XP:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);

module.exports = { client, botStats };