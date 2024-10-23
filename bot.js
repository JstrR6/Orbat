const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('./config');

// Express app setup
const app = express();
const port = 3000; // Change this to your preferred port

// Discord bot setup
const client = new Client({
    intents: config.bot.intents.map(intent => GatewayIntentBits[intent])
});

// Make bot client available globally for auth.js
global.botClient = client;
config.discord.clientID
config.discord.clientSecret
config.discord.botToken
config.discord.callbackURL

// Passport configuration
passport.use(new DiscordStrategy({
    clientID: discordConfig.clientID,
    clientSecret: discordConfig.clientSecret,
    callbackURL: discordConfig.callbackURL,
    scope: ['identify', 'email']
}, function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
}));

// Express routes
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), function(req, res) {
    res.redirect('/dashboard');
});

// Start Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Bot commands
client.on('messageCreate', async message => {
    if (message.content.toLowerCase() === `${config.bot.prefix}login`) {
        try {
            // Create login URL
            const loginURL = `https://discord.com/oauth2/authorize?client_id=${discordConfig.clientID}&redirect_uri=${encodeURIComponent(discordConfig.callbackURL)}&response_type=code&scope=${config.oauth2Scopes.join('%20')}`;

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
    
    // Set bot activity
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

// Bot login with debug logging
console.log('Attempting bot login...');
client.login(config.discord.botToken)
    .then(() => console.log('Bot login successful!'))
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
