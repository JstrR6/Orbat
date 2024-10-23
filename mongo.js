const mongoose = require('mongoose');
const config = require('./config');

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    username: String,
    discriminator: String,
    email: String,
    avatar: String,
    guilds: [{
        id: String,
        name: String,
        icon: String,
        memberInfo: {
            roles: [{
                id: String,
                name: String,
                color: String,
                position: Number
            }],
            joinedAt: Date,
            nickname: String,
            highestRole: {
                id: String,
                name: String,
                color: String,
                position: Number
            }
        }
    }],
    lastUpdated: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Update user information
async function updateUserInfo(userProfile) {
    try {
        const update = {
            username: userProfile.username,
            discriminator: userProfile.discriminator,
            email: userProfile.email,
            avatar: userProfile.avatar,
            guilds: userProfile.guilds,
            lastUpdated: new Date()
        };

        const options = {
            new: true,          // Return the updated document
            upsert: true,       // Create if doesn't exist
            setDefaultsOnInsert: true
        };

        const updatedUser = await User.findOneAndUpdate(
            { discordId: userProfile.id },
            update,
            options
        );

        console.log(`Updated user info for ${userProfile.username}`);
        return updatedUser;
    } catch (error) {
        console.error('Error updating user info:', error);
        throw error;
    }
}

// Get user information
async function getUserInfo(discordId) {
    try {
        const user = await User.findOne({ discordId });
        
        if (!user) {
            console.log(`No user found with Discord ID: ${discordId}`);
            return null;
        }

        return user;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

// Get user by guild membership
async function getUsersByGuild(guildId) {
    try {
        const users = await User.find({
            'guilds.id': guildId
        });
        return users;
    } catch (error) {
        console.error('Error fetching users by guild:', error);
        throw error;
    }
}

// Get users by role in a specific guild
async function getUsersByRole(guildId, roleId) {
    try {
        const users = await User.find({
            'guilds.id': guildId,
            'guilds.memberInfo.roles.id': roleId
        });
        return users;
    } catch (error) {
        console.error('Error fetching users by role:', error);
        throw error;
    }
}

// Delete user
async function deleteUser(discordId) {
    try {
        const result = await User.findOneAndDelete({ discordId });
        return result;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

// Example usage of checking if user needs update
async function shouldUpdateUser(discordId) {
    try {
        const user = await getUserInfo(discordId);
        if (!user) return true;

        // Check if last update was more than 1 hour ago
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return user.lastUpdated < oneHourAgo;
    } catch (error) {
        console.error('Error checking user update status:', error);
        throw error;
    }
}

module.exports = {
    User,
    updateUserInfo,
    getUserInfo,
    getUsersByGuild,
    getUsersByRole,
    deleteUser,
    shouldUpdateUser
};
