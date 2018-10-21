const express = require('express');
const pug = require('pug');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const passport = require('passport');
var morgan = require('morgan')

const app = express();

const port = process.env.PORT || 5000;

app.use(morgan('dev'));

const mongoUser = encodeURI('back');
const mongoPass = encodeURI('ktDa3GE2}NnfT8cx~J)x');
const mongoURI = `mongodb://${mongoUser}:${mongoPass}@ds125683.mlab.com:25683/dashboard`;

mongoose.connect(mongoURI, { useNewUrlParser: true });
let db = mongoose.connection;

let User = require('../models/user');

db.once('open', function () {
    console.log("Connected to mongoDB");
});

db.on('error', function (err) {
    console.log(err);
});

app.set('view engine', 'pug');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

require('../config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// Routes Files
let user = require('./user.js');
app.use('/', user);
app.set('port', (process.env.PORT || 5000))

app.post("/saveWidget", function (req, res) {
    let widget = { widgetType: req.body.widgetType, id: req.body.id, posX: req.body.posX, posY: req.body.posY, sizeX: req.body.sizeX, sizeY: req.body.sizeY, config: req.body.config };
    User.findById(req.user._id, function (err, user) {
        if (err) {
            console.log(err);
            return;
        }
        user.widgets.push(widget);
        user.save();
    });
    res.send();
});

app.post("/deleteWidget", function (req, res) {
    let widgetId = req.body.widgetId;
    User.findById(req.user._id, function (err, user) {
        if (err) {
            console.log(err);
            return;
        }
        var i = user.widgets.map(function (e) { return e.id; }).indexOf(widgetId);
        if (i > -1) {
            user.widgets.splice(i, 1);
            user.save();
        }
    });
    res.send();
});

app.get("/loadWidget", function (req, res) {
    var widgets = req.user.widgets;
    res.send(JSON.stringify({
        widgets
    }));
});

app.get("/about.json", function (req, res) {
    var ip = req.ip;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7);
    }
    res.send(JSON.stringify({
        "client": {
            "host": ip
        }, "server": {
            "current_time": (new Date).getTime(), "services": [{
                "name": "twitter",
                "widgets": [{
                    "name": "twitter-timeline",
                    "description": "Affiche la timeline pour un utilisateur donné",
                    "params": [{
                        "name": "@",
                        "type": "string"
                    }]
                }]
            }, {
                "name": "twitch",
                "widgets": [{
                    "name": "Embed Twitch Channel",
                    "description": "Affiche un live twitch d'une chaine N",
                    "params": [{
                        "name": "channel",
                        "type": "string"
                    }]
                }]
            }, {
                "name": "github",
                "widgets": [{
                    "name": "Repo stats",
                    "description": "Affiche le nombre branches, de pull-request et de fork pour un repo N d'un utilisateur X",
                    "params": [{
                        "name": "owner",
                        "type": "string"
                    }, {
                        "name": "repo",
                        "type": "string"
                    }]
                }]
            }, {
                "name": "youtube",
                "widgets": [{
                    "name": "Embed video",
                    "description": "Affiche une video youtube N",
                    "params": [{
                        "name": "videoID",
                        "type": "string"
                    }]
                }]
            }, {
                "name": "intra",
                "widgets": [{
                    "name": "Intra",
                    "description": "Affiche l'intra Epitech pour l'utilisateur X",
                    "params": [{
                        "name": "autologgingLink",
                        "type": "string"
                    }]
                }]
            }]
        }
    }));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));