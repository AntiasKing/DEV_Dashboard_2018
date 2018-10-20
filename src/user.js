const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Intranet = require('intra-api');
const router = express.Router();

let User = require('../models/user');

// register

// register form
router.get('/register', function (req, res) {
    res.render('register');
});

router.post('/register', function (req, res) {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;

    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is invalid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    let errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        let newUser = new User({
            local: {
                username: username,
                email: email,
                password: password
            },
            displayName: username,
        });

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newUser.local.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                }
                newUser.local.password = hash;
                newUser.save(function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        req.flash('success', 'You are now registred and can log in');
                        res.redirect('/');
                    }
                });
            });
        });
    }
});

// Login

// Login Form
router.get('/', function (req, res) {
    if (req.user) {
        res.redirect('/dashboard');
    } else {
        res.render('login')
    }
});

router.post('/', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: "/dashboard",
        failureRedirect: '/',
        failureFlash: true,
    })(req, res, next);
});

// Login Twitter
router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
}));

// Login Azure
router.get('/auth/azureadoauth2', passport.authenticate('azure_ad_oauth2'));

router.get('/auth/azureadoauth2/callback', passport.authenticate('azure_ad_oauth2', {
    failureRedirect: '/',
    successRedirect: '/dashboard'
}));

// Login Twitch
router.get('/auth/twitch', passport.authenticate('twitch'));

router.get('/auth/twitch/callback', passport.authenticate("twitch", {
    failureRedirect: '/',
    successRedirect: '/dashboard'
}));

// Login Github
router.get('/auth/github', passport.authenticate('github'));

router.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/',
    successRedirect: '/dashboard'
}));

// StackExchange Login
router.get('/auth/stack-exchange', passport.authenticate('stack-exchange'));

router.get('/auth/stack-exchange/callback', passport.authenticate('stack-exchange', {
    failureRedirect: '/',
    successRedirect: '/dashboard'
}));

// Logout
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Dashboard
router.get("/dashboard", isLoggedIn, function (req, res) {
    const Intra = new Intranet("https://intra.epitech.eu/auth-0735ec8adde3ae473cc050bf36895a12bbc1e1f5", "antoine.briaux@epitech.eu");
    Intra.planning.get().then(function (res) {
        console.log(res);
    });
    res.render('dashboard', {
        displayPick: req.user.displayPick,
        username: req.user.displayName,
        githubToken: req.user.github.token
    });
});

function isLoggedIn(req, res, next) {
    if (req.user) {
        return next();
    }
    res.redirect('/');
};

module.exports = router;