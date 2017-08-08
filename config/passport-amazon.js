// facebook strategy
var passport = require('passport');
var User = require('../models/user');
var AmazonStrategy = require('passport-amazon').Strategy;
var auth = require('./auth');

passport.use(new AmazonStrategy({
    clientID: auth.amazonAuth.clientID,
    clientSecret: auth.amazonAuth.clientSecret,
    callbackURL: "http://127.0.0.1:3000/auth/amazon/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ amazonId: profile.id }, function (err, user) {
      if (err) {
          return done(err);
      }
      if (user) {
          return done(null, user);
      }
      var newUser = new User();
      newUser.amazon.id = profile.id;
      newUser.amazon.name = profile.displayName;
      newUser.amazon.token = accessToken;
      newUser.save(function(err, result) {
         if (err) {
             return done(err);
         }
         return done(null, newUser);
      });
    });
  }
));
