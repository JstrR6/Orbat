const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const config = require('./config');
const botClient = require('./botClient');
const { MongoClient } = require('mongodb');

console.log('Auth Configuration Check:');
console.log('Client ID:', config.discord.clientID);
console.log('Callback URL:', config.discord.callbackURL);

if (!config.discord.clientID || !config.discord.clientSecret || !config.discord.callbackURL) {
    throw new Error('Missing required Discord configuration');
}

const DISCORD_SCOPES = ['identify', 'email', 'guilds', 'guilds.members.read'];

passport.serializeUser((user, done) => {
    done(null, user.userId);
});

passport.deserializeUser(async (userId, done) => {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('your_database_name');
        const collection = db.collection('server_members');

        const user = await collection.findOne({ userId: userId });

        if (user) {
            done(null, user);
        } else {
            done(new Error('User not found'));
        }
    } catch (error) {
        done(error);
    } finally {
        await client.close();
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
    scope: ['identify']
}, async (accessToken, refreshToken, profile, done) => {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('your_database_name');
        const collection = db.collection('server_members');

        const user = await collection.findOne({ userId: profile.id });

        if (user) {
            console.log('User found in database:', user);
            return done(null, user);
        } else {
            console.log('User not found in database');
            return done(null, false, { message: 'You must be in a server with the bot to use this application.' });
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        return done(error);
    } finally {
        await client.close();
    }
}));

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
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
