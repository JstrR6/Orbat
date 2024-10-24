const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('./config');
const botClient = require('./botClient');

// Bot commands
botClient.on('messageCreate', async message => {
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

// Error handling
botClient.on('error', error => {
    console.error('Discord client error:', error);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('Bot shutting down...');
    botClient.destroy();
    process.exit(0);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});
