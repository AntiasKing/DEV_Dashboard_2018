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
const port = 8080;

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

app.post("/saveWidget", function (req, res) {
    let query = { "_id": req.user._id };
    let widget = { type: req.body.type, id: req.body.id, posX: req.body.posX, posY: req.body.posY, sizeX: req.body.sizeX, sizeY: req.body.sizeY, config: req.body.config };
    User.update(query, { $push: { widgets: widget } }, function (err, raw) {
        if (err)
            console.log(err);
    });
});

app.get("/about.json", (req, res) => res.send(JSON.stringify({
    "client": {
        "host": `${req.ip}`
    }, "server": { "current_time": (new Date).getTime(), "services": [] }
})));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));