const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const mongoose = require('mongoose');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
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

// Function to update user's highest role in MongoDB and Discord
async function updateUserRole(member) {
  const highestRole = member.roles.highest.name;
  const userId = member.user.id;
  const username = member.user.username;

  let user = await User.findOne({ discordId: userId });

  if (!user) {
    // Create a new user entry in MongoDB if they don't exist
    user = new User({
      discordUsername: username,
      discordId: userId,
      highestRole: highestRole,
      xp: 0 // Initial XP
    });
    await user.save();
    console.log(`New user added: ${username}`);
  } else {
    // Update highest role in MongoDB if it changed
    if (user.highestRole !== highestRole) {
      user.highestRole = highestRole;
      await user.save();
      console.log(`User role updated: ${username} now has role ${highestRole}`);
    }
  }
}

// Automatically update role on guild member update (e.g., role change)
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  await updateUserRole(newMember);
});

// Automatically update role on member join (when they join the server)
client.on('guildMemberAdd', async (member) => {
  await updateUserRole(member);
});

// Function to update XP in MongoDB
async function updateXP(member, xpAmount) {
  const userId = member.user.id;
  let user = await User.findOne({ discordId: userId });

  if (user) {
    user.xp += xpAmount; // Increment XP
    await user.save();
    console.log(`Updated XP for ${member.user.username}. New XP: ${user.xp}`);
  } else {
    console.log('User not found in database.');
  }
}

// Example: Automatically give XP when a user sends a message
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore bot messages
  const member = await message.guild.members.fetch(message.author.id);
  await updateXP(member, 10); // Increment XP by 10 for each message (customize as needed)
});

// !verify command (optional, can still be used to manually register the user)
client.on('messageCreate', async (message) => {
  if (message.content === '!verify') {
    const member = await message.guild.members.fetch(message.author.id);
    await updateUserRole(member);
    const verifyLink = `https://usm-dashboard.onrender.com/verify/${member.user.id}`;
    await message.author.send(`Click here to verify your account: ${verifyLink}`);
  }
});
