const config = {
    // Discord Application Settings
    discord: {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        botToken: process.env.DISCORD_BOT_TOKEN,
        callbackURL: process.env.DISCORD_CALLBACK_URL,
    },

    // Bot Configuration
    bot: {
        prefix: process.env.BOT_PREFIX || '!',
        activity: {
            type: 'WATCHING',
            name: 'for !login'
        },
        intents: [
            'Guilds',
            'GuildMessages',
            'MessageContent',
            'DirectMessages',
            'GuildMembers'
        ]
    },

    // Web Server Configuration
    server: {
        port: process.env.PORT || 3000,
        baseURL: process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000',
    },

    // MongoDB Configuration
    mongodb: {
        uri: process.env.MONGO_URI,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },

    // Session Configuration
    session: {
        secret: process.env.SESSION_SECRET,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            secure: process.env.NODE_ENV === 'production'
        },
        resave: false,
        saveUninitialized: false
    },

    // OAuth2 Scopes
    oauth2Scopes: [
        'identify',
        'email',
        'guilds',
        'guilds.members.read'
    ],

    // Environment
    isProduction: process.env.NODE_ENV === 'production'
};

module.exports = config;
