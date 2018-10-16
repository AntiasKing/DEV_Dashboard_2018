const mongoose = require('mongoose');

// User Schema
const UserSchema = mongoose.Schema({
    local: {
        username: String,
        email: String,
        password: String,
        profilPick: String
    },
    twitter: {
        id: String,
        token: String,
        username: String,
        profilPick: String
    },
    twitch: {
        id: String,
        token: String,
        username: String,
        profilPick: String
    },
    github: {
        id: String,
        token: String,
        username: String,
        profilPick: String
    },
    stackOverFlow: {
        id: String,
        token: String,
        username: String,
        profilPick: String
    },
    widgets: [{
        type: String,
        id: String,
        posX: Number,
        posY: Number,
        sizeX: Number,
        sizeY: Number,
        config: mongoose.Schema.Types.Mixed
    }],
    displayName: String,
    displayPick: String
});

const User = module.exports = mongoose.model('User', UserSchema);