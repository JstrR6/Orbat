const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const config = require('./config');
const { updateUserInfo, shouldUpdateUser } = require('./mongo');

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

// Setup Discord Strategy
passport.use(new DiscordStrategy({
    clientID: config.discord.clientID,
    clientSecret: config.discord.clientSecret,
    callbackURL: config.discord.callbackURL,
    scope: DISCORD_SCOPES
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Fetch additional guild (server) information
        const guilds = profile.guilds;
        const botGuilds = await getBotGuilds(); // We'll implement this
        const mutualGuilds = getMutualGuilds(guilds, botGuilds);
        
        // Fetch member details for each mutual guild
        const enrichedGuilds = await Promise.all(
            mutualGuilds.map(async guild => {
                const memberInfo = await getGuildMember(guild.id, profile.id, accessToken);
                return {
                    ...guild,
                    memberInfo
                };
            })
        );

        // Create enriched user profile
        const userProfile = {
            id: profile.id,
            username: profile.username,
            discriminator: profile.discriminator,
            avatar: profile.avatar,
            email: profile.email,
            guilds: enrichedGuilds,
            accessToken,
            refreshToken
        };

        // Check if user needs update
        if (await shouldUpdateUser(profile.id)) {
            // Update user in database
            await updateUserInfo(userProfile);
        }

        return done(null, userProfile);
    } catch (error) {
        return done(error, null);
    }
}));

// Helper functions
async function getBotGuilds() {
    try {
        // This will use the bot client to get guilds
        const botGuilds = await global.botClient.guilds.fetch();
        return botGuilds.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon
        }));
    } catch (error) {
        console.error('Error fetching bot guilds:', error);
        return [];
    }
}

function getMutualGuilds(userGuilds, botGuilds) {
    return userGuilds.filter(guild => 
        botGuilds.some(botGuild => botGuild.id === guild.id)
    );
}

async function getGuildMember(guildId, userId, accessToken) {
    try {
        const guild = await global.botClient.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);
        
        return {
            roles: member.roles.cache.map(role => ({
                id: role.id,
                name: role.name,
                color: role.color,
                position: role.position
            })),
            joinedAt: member.joinedAt,
            nickname: member.nickname,
            highestRole: {
                id: member.roles.highest.id,
                name: member.roles.highest.name,
                color: member.roles.highest.color,
                position: member.roles.highest.position
            }
        };
    } catch (error) {
        console.error(`Error fetching member info for guild ${guildId}:`, error);
        return null;
    }
}

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
