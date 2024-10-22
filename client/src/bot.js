const { Client, Events, GatewayIntentBits } = require('discord.js');
const { initializeDiscord } = require('./config/discord');
const User = require('./models/User');

const client = initializeDiscord();

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  try {
    await User.findOneAndUpdate(
      { discordId: newMember.id },
      { roles: newMember.roles.cache.map(role => role.name) }
    );
  } catch (error) {
    console.error('Error updating user roles:', error);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // Add your command handlers here
});

module.exports = client;