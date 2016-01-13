var express         = require('express');
var fs              = require('fs');
var passport        = require('passport');
var util            = require('util');
var GoogleStrategy  = require('passport-google-oauth').OAuth2Strategy;
var logger          = require('morgan');
var methodOverride  = require('method-override');
var bodyParser      = require('body-parser');
var session         = require('express-session');
var querystring     = require('query-string');

var PASSPORT_LOCAL_TEST = true;

// Set the following two values to match your client
var GOOGLE_CLIENT_ID = "";
var GOOGLE_CLIENT_SECRET = "";

var valid_users = JSON.parse(fs.readFileSync('users.json', 'utf8'));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Here we are providing a stategy and a callback function for verification
// Set callback URL appropriately
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5001/callback",
    passReqToCallback : true
  },
  function(req, accessToken, refreshToken, params, profile, done) {
    process.nextTick(function () {
      if (valid_users.indexOf(profile.emails[0].value) == -1) {
        return done(null, false, 'Unknown user');
      } else {
        req.session.authParams = params;
      }
      return done(null, profile);
    });
  }
));

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());

app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: 'my secret 007' }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/login', function(req, res){
  console.log("Rendering login");
  res.render('login', { user: req.user });
});

app.get('/authfailure', function(req, res){
  console.log("Rendering authfailure");
  res.render('authfailure');
});

app.get('/relogin', function(req, res){
  console.log("Rendering relogin");
  res.render('relogin', { user: req.user });
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['openid', 'email'] }),
  function(req, res){
    console.log("passport.authenticate");
  });

app.get('/callback', 
  passport.authenticate('google', { failureRedirect: '/relogin' }),
  function(req, res) {
    var tParams = '';
    if (PASSPORT_LOCAL_TEST) {
      tParams = "http://localhost:5002/?Token="+req.session.authParams.id_token;
    } else {
      tParams = "/app/?Token="+req.session.authParams.id_token;
    }
    console.log("/callback processes redirecting to : " + tParams);
    res.redirect(tParams);
  });

app.get('/logout', function(req, res){
  req.logout();
  res.set('Token','');
  res.render('logout');
});

app.listen(5001);
