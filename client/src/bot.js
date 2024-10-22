// server/src/bot.js
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Event: Client Ready
client.once(Events.ClientReady, c => {
  console.log(`Discord Bot Ready! Logged in as ${c.user.tag}`);
});

// Event: Member Update (for role changes)
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  try {
    // Update user roles in database
    await User.findOneAndUpdate(
      { discordId: newMember.id },
      { 
        roles: newMember.roles.cache.map(role => role.name),
        updatedAt: new Date()
      }
    );
  } catch (error) {
    console.error('Error updating user roles:', error);
  }
});

// Event: Member Join
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    // Create or update user in database
    await User.findOneAndUpdate(
      { discordId: member.id },
      {
        username: member.user.username,
        discordId: member.id,
        roles: ['member'],
        joinDate: new Date()
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error handling new member:', error);
  }
});

// Login handling with error checking
const startBot = async () => {
  if (!process.env.DISCORD_BOT_TOKEN) {
    console.error('DISCORD_BOT_TOKEN is not set in environment variables!');
    process.exit(1);
  }

  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
    console.log('Discord bot login successful');
  } catch (error) {
    console.error('Discord bot login failed:', error);
    process.exit(1);
  }
};

// Error handling
client.on('error', error => {
  console.error('Discord client error:', error);
});

client.on('disconnect', () => {
  console.log('Bot disconnected from Discord');
});

client.on('reconnecting', () => {
  console.log('Bot reconnecting to Discord');
});

// Start the bot
startBot();

module.exports = client;