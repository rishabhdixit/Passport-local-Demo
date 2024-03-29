//var mongoose = require('mongoose');
var flash = require('connect-flash');
var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');
var path = require('path');
var app = express();




var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
    , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

function findById(id, fn) {
    var idx = id - 1;
    if (users[idx]) {
        fn(null, users[idx]);
    } else {
        fn(new Error('User ' + id + ' does not exist'));
    }
}

function findByUsername(username, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.username === username) {
            return fn(null, user);
        }
    }
    return fn(null, null);
}


app.configure(function() {
    /*app.set('views', __dirname + '/../client');
     app.set('view engine', 'html');*/
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, '/../','client')));
    console.log('hahahhahah'+path.join(__dirname,'/../','client'));
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // Find the user by username.  If there is no user with the given
            // username, or the password is not correct, set the user to `false` to
            // indicate failure and set a flash message.  Otherwise, return the
            // authenticated `user`.
            findByUsername(username, function(err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
                if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
                return done(null, user);
            })
        });
    }
));




app.get('/', function(req, res){
    var data = fs.readFileSync("" +
        "../client/index.html");
    res.writeHeader(200, {"Content-Type": "text/html"});
    res.write(data);
    res.end();
});

/*
app.get('/account', ensureAuthenticated, function(req, res){
    res.render('account', { user: req.user });
});
*/

app.get('/login', function(req, res){
    var data = fs.readFileSync("../client/login.html");
    res.writeHeader(200, {"Content-Type": "text/html"});
    res.write(data);
    res.end();
});

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login'  }),
    function(req, res) {
        res.redirect('/');
    });

app.listen(3000);