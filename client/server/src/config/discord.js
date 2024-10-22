const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

const initializeDiscord = () => {
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
  });

  client.login(process.env.DISCORD_BOT_TOKEN);
  return client;
};

module.exports = { initializeDiscord };