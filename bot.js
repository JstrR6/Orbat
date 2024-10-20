const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => console.error(err));

// User Schema
const userSchema = new mongoose.Schema({
  discordUsername: String,
  discordId: String,
  highestRole: String,
  xp: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Bot Login
client.login(process.env.DISCORD_TOKEN);

// !verify command
client.on('messageCreate', async (message) => {
  if (message.content === '!verify') {
    const userId = message.author.id;
    const verifyLink = `https://usm-dashboard.onrender.com/verify/${userId}`;
    message.author.send(`Click here to verify your account: ${verifyLink}`);
  }
});
