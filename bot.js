const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('./config');

// Discord bot setup
const client = new Client({
    intents: config.bot.intents.map(intent => GatewayIntentBits[intent])
});

// Make bot client available globally for auth.js
global.botClient = client;

// Bot commands
client.on('messageCreate', async message => {
    if (message.content.toLowerCase() === `${config.bot.prefix}login`) {
        try {
            // Create login URL
            const loginURL = `https://discord.com/oauth2/authorize?client_id=${config.discord.clientID}&redirect_uri=${encodeURIComponent(config.discord.callbackURL)}&response_type=code&scope=${config.oauth2Scopes.join('%20')}`;

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle('Website Login')
                .setDescription(`Click [here](${loginURL}) to login to our website!`)
                .setColor('#7289DA')
                .setTimestamp();

            // DM the user
            await message.author.send({ embeds: [embed] });
            
            // If the command was used in a server, acknowledge it
            if (message.guild) {
                await message.reply('I\'ve sent you a DM with the login link!');
            }
        } catch (error) {
            console.error('Error sending DM:', error);
            await message.reply('Sorry, I couldn\'t send you a DM. Please make sure your DMs are open!');
        }
    }
});

// Bot ready event
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(config.bot.activity.name, { type: config.bot.activity.type });
});

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

// Validate bot token before login
if (!config.discord.botToken) {
    console.error('Bot token is missing!');
    process.exit(1);
}

// Bot login
client.login(config.discord.botToken)
    .catch(error => {
        console.error('Failed to login:', error);
        process.exit(1);
    });

// Handle process termination
process.on('SIGINT', () => {
    console.log('Bot shutting down...');
    client.destroy();
    process.exit(0);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});
