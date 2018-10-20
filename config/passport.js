const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const AzureStrategie = require('passport-azure-ad-oauth2').Strategy;
var twitchStrategy = require('passport-twitch').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var StackExchangeStrategy = require('passport-stack-exchange');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

module.exports = function (passport) {
    // local
    passport.use(new LocalStrategy({ usernameField: 'email' }, function (username, password, done) {
        let query = { 'local.email': username };
        User.findOne(query, function (err, user) {
            if (err) { return done(err) };
            if (!user) {
                return done(null, false, { message: 'No user found' });
            }

            bcrypt.compare(password, user.local.password, function (err, isMatch) {
                if (err) { return done(err) };
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Wrong password' });
                }
            });
        });
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // Twitter
    passport.use(new TwitterStrategy({
        consumerKey: 'sD6Bhd3sgGh4HIBMtCzFbDoA6',
        consumerSecret: 'DKI3BuQ2gPe05pB2e2g1JiXcDmb5e1fFCeEBgCursHDLuTNh50',
        callbackURL: 'http://91.134.141.40:8080/auth/twitter/callback'
    }, function (token, tokenSecret, profile, done) {
        let query = { 'twitter.id': profile.id };
        User.findOne(query, function (err, user) {
            if (err) { return done(err); };
            if (!user) {
                let newUser = new User({
                    twitter: {
                        id: profile.id,
                        username: profile.username,
                        token: token,
                        profilPick: profile._json.profile_image_url
                    },
                    displayName: profile.displayName,
                    displayPick: profile._json.profile_image_url
                });

                newUser.save(function (err) {
                    if (err) {
                        return done(err);
                    } else {
                        return done(null, newUser);
                    }
                });
            } else {
                return done(null, user);
            }
        });
    }));

    // Azure login
    passport.use(new AzureStrategie({
        clientID: '256bb5cc-0826-479e-a4a6-677a3698a797',
        clientSecret: '02eeb986-1b28-462c-86fc-269df614e68b',
        callbackURL: 'http://91.134.141.40:8080/auth/azureadoauth2/callback'
    }, function (accessToken, refresh_token, params, profile, done) {
        var waadProfile = profile || jwt.decode(params.id_token);
        console.log(waadProfile);
    }));

    // Twitch login
    passport.use(new twitchStrategy({
        clientID: 'j4j3cs18z01kcrtdz9r73ektec24vt',
        clientSecret: '8fh59wbdaqlt4attw4304jc2uxjj7k',
        callbackURL: 'http://91.134.141.40:8080/auth/twitch/callback',
        scope: 'user_read'
    }, function (accessToken, refresh_token, profile, done) {
        let query = { 'twitch.id': profile.id };
        User.findOne(query, function (err, user) {
            if (err) { return done(err); };
            if (!user) {
                let newUser = User({
                    twitch: {
                        id: profile.id,
                        token: accessToken,
                        username: profile.username,
                        profilPick: profile._json.logo
                    },
                    displayName: profile.displayName,
                    displayPick: profile._json.logo
                });

                newUser.save(function (err) {
                    if (err) {
                        return done(err);
                    } else {
                        return done(null, newUser);
                    }

                });
            } else {
                return done(null, user);
            }
        });
    }));

    // Github Login
    passport.use(new GitHubStrategy({
        clientID: '2ccd1aa2df850c8d8c70',
        clientSecret: 'f17f370d379cd78182858239fcff097ffe975656',
        callbackURL: 'http://91.134.141.40:8080/auth/github/callback'
    }, function (accessToken, refresh_token, profile, done) {
        let query = { 'github.id': profile.id };
        console.log(accessToken, refresh_token);
        User.findOne(query, function (err, user) {
            if (err) { return done(err); };
            if (!user) {
                let newUser = User({
                    github: {
                        id: profile.id,
                        token: accessToken,
                        username: profile.username,
                        profilPick: profile.photos[0].value
                    },
                    displayName: profile.displayName,
                    displayPick: profile.photos[0].value
                });

                newUser.save(function (err) {
                    if (err) {
                        return done(err);
                    } else {
                        return done(null, newUser);
                    }
                });
            } else {
                return done(null, user);
            }
        });
    }));

    // StackExchange Login
    passport.use(new StackExchangeStrategy({
        clientID: '13327',
        clientSecret: 'i5hZq6k9vBW4ET0I6dmbpg((',
        callbackURL: 'http://91.134.141.40:8080/auth/stack-exchange/callback',
        stackAppsKey: 'LV4rzSXr1AnhUDXlS12bpw',
        site: 'stackoverflow'
    }, function (accessToken, refresh_token, profile, done) {
        console.log(profile);
        let query = { username: profile.username };
        User.findOne(query, function (err, user) {
            if (err) { return done(err); };
            if (!user) {
                let newUser = User({
                    username: profile.username
                });

                newUser.save(function (err) {
                    if (err) {
                        return done(err);
                    } else {
                        return done(null, newUser);
                    }
                });
            } else {
                return done(null, user);
            }
        });
    }));
}