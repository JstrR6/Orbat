const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const config = require('./config');
const botClient = require('./botClient');

// Validate config before setting up passport
console.log('Auth Configuration Check:');
console.log('Client ID:', config.discord.clientID);
console.log('Callback URL:', config.discord.callbackURL);

if (!config.discord.clientID || !config.discord.clientSecret || !config.discord.callbackURL) {
    throw new Error('Missing required Discord configuration');
}

// Define the scopes we need
const DISCORD_SCOPES = [
    'identify',          // username, discriminator, avatar
    'email',            // email address
    'guilds',           // servers they're in
    'guilds.members.read' // roles in servers
];

// Initialize passport
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Get bot guilds helper function
async function getBotGuilds() {
    try {
        // Wait for bot client to be ready
        if (!botClient.isReady()) {
            console.log('Waiting for bot client to be ready...');
            await new Promise(resolve => {
                botClient.once('ready', resolve);
            });
        }

        // Force fetch all guilds
        const guilds = await botClient.guilds.fetch();
        console.log(`Bot is in ${guilds.size} guilds`);

        return Array.from(guilds.values()).map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon
        }));
    } catch (error) {
        console.error('Error fetching bot guilds:', error);
        throw new Error('Error fetching bot guilds: ' + error.message);
    }
}

// Get guild member helper function
async function getGuildMember(guildId, userId) {
    try {
        // Force fetch the guild first
        const guild = await botClient.guilds.fetch(guildId);
        if (!guild) {
            console.log(`Guild ${guildId} not found`);
            return null;
        }

        // Force fetch the member
        const member = await guild.members.fetch(userId);
        if (!member) {
            console.log(`Member ${userId} not found in guild ${guildId}`);
            return null;
        }

        // Get all roles for the member
        const roles = member.roles.cache.map(role => ({
            id: role.id,
            name: role.name,
            color: role.hexColor,
            position: role.position,
            permissions: role.permissions.toArray()
        }));

        console.log(`Found ${roles.length} roles for member ${userId} in guild ${guildId}`);

        return {
            roles,
            joinedAt: member.joinedAt,
            nickname: member.nickname,
            highestRole: {
                id: member.roles.highest.id,
                name: member.roles.highest.name,
                color: member.roles.highest.hexColor,
                position: member.roles.highest.position,
                permissions: member.roles.highest.permissions.toArray()
            },
            permissions: member.permissions.toArray()
        };
    } catch (error) {
        console.error(`Error fetching member info for guild ${guildId}, user ${userId}:`, error);
        return null;
    }
}

// Get mutual guilds helper function with role information
async function getMutualGuildsWithRoles(userGuilds, botGuilds, userId) {
    console.log('Getting mutual guilds with roles...');
    console.log('User Guilds:', userGuilds.length);
    console.log('Bot Guilds:', botGuilds.length);
    
    const mutualGuilds = userGuilds.filter(userGuild => 
        botGuilds.some(botGuild => botGuild.id === userGuild.id)
    );
    
    console.log('Found mutual guilds:', mutualGuilds.length);

    // Enrich mutual guilds with member information
    const enrichedGuilds = await Promise.all(
        mutualGuilds.map(async guild => {
            const memberInfo = await getGuildMember(guild.id, userId);
            return {
                ...guild,
                memberInfo
            };
        })
    );

    console.log('Enriched guilds with member info');
    return enrichedGuilds;
}

// Setup Discord Strategy
passport.use(new DiscordStrategy({
    clientID: config.discord.clientID,
    clientSecret: config.discord.clientSecret,
    callbackURL: config.discord.callbackURL,
    scope: DISCORD_SCOPES
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Processing Discord login for:', profile.username);
        
        // Fetch bot guilds
        console.log('Fetching bot guilds...');
        const botGuilds = await getBotGuilds();
        console.log('Bot guilds fetched:', botGuilds.length);
        
        // Get mutual guilds with roles
        console.log('Fetching mutual guilds with roles...');
        const mutualGuilds = await getMutualGuildsWithRoles(profile.guilds || [], botGuilds, profile.id);
        console.log('Mutual guilds processed:', mutualGuilds.length);

        // Create enriched user profile
        const userProfile = {
            id: profile.id,
            username: profile.username,
            discriminator: profile.discriminator,
            avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
            email: profile.email,
            guilds: mutualGuilds,
            accessToken,
            refreshToken
        };

        console.log('User profile created with guild information');
        return done(null, userProfile);
    } catch (error) {
        console.error('Error in Discord strategy:', error);
        return done(error, null);
    }
}));

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

// Middleware to check specific permissions
const hasGuildPermission = (guildId, requiredRole) => {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/login');
        }

        const guild = req.user.guilds.find(g => g.id === guildId);
        if (!guild || !guild.memberInfo) {
            return res.status(403).send('No access to this server');
        }

        const hasRole = guild.memberInfo.roles.some(role => 
            role.name === requiredRole || role.id === requiredRole
        );

        if (!hasRole) {
            return res.status(403).send('Insufficient permissions');
        }

        next();
    };
};

module.exports = {
    passport,
    isAuthenticated,
    hasGuildPermission
};
