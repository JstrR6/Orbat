const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const config = require('./config');
const botClient = require('./botClient');

console.log('Auth Configuration Check:');
console.log('Client ID:', config.discord.clientID);
console.log('Callback URL:', config.discord.callbackURL);

if (!config.discord.clientID || !config.discord.clientSecret || !config.discord.callbackURL) {
    throw new Error('Missing required Discord configuration');
}

const DISCORD_SCOPES = ['identify', 'email', 'guilds', 'guilds.members.read'];

passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    console.log('Deserializing user:', id);
    try {
        // Fetch user data from your database or storage
        const user = await getUserById(id);
        if (!user) {
            console.log('User not found during deserialization:', id);
            return done(null, false);
        }
        console.log('User deserialized successfully:', id);
        done(null, user);
    } catch (error) {
        console.error('Error deserializing user:', error);
        done(error, null);
    }
});

async function getUserById(id) {
    // This is a placeholder. Replace with actual database query
    console.log('Fetching user by ID:', id);
    
    // Simulating database fetch
    const user = {
        id: id,
        username: 'User_' + id,
        // Add other user properties as needed
    };

    return user;
}

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

passport.use(new DiscordStrategy({
    clientID: config.discord.clientID,
    clientSecret: config.discord.clientSecret,
    callbackURL: config.discord.callbackURL,
    scope: DISCORD_SCOPES
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Processing Discord login for:', profile.username);
        
        const botGuilds = await getBotGuilds();
        const mutualGuilds = await getMutualGuildsWithRoles(profile.guilds || [], botGuilds, profile.id);

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

        console.log('User profile created:', userProfile.id);
        return done(null, userProfile);
    } catch (error) {
        console.error('Error in Discord strategy:', error);
        return done(error, null);
    }
}));

const isAuthenticated = (req, res, next) => {
    console.log('Checking authentication');
    if (req.isAuthenticated()) {
        console.log('User is authenticated via session');
        return next();
    }

    // Check if the user has any mutual guilds with the bot
    if (req.user && req.user.guilds && req.user.guilds.length > 0) {
        console.log('User has mutual guilds with the bot');
        return next();
    }

    console.log('User is not authenticated and has no mutual guilds');
    res.redirect('/login');
};

const hasGuildPermission = (guildId, requiredRole) => {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            return res.redirect('/login');
        }

        const guild = req.user.guilds.find(g => g.id === guildId);
        if (!guild || !guild.memberInfo) {
            console.log('No access to server:', guildId);
            return res.status(403).send('No access to this server');
        }

        const hasRole = guild.memberInfo.roles.some(role => 
            role.name === requiredRole || role.id === requiredRole
        );

        if (!hasRole) {
            console.log('Insufficient permissions for user:', req.user.id);
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
