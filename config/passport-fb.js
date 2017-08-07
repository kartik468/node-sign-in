// facebook strategy
var passport = require('passport');
var User = require('../models/user');
var FacebookStrategy = require('passport-facebook').Strategy;
var auth = require('./auth')

passport.use(new FacebookStrategy({
    clientID: auth.facebookAuth.clientID,
    clientSecret: auth.facebookAuth.clientSecret,
    callbackURL: auth.facebookAuth.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
      User.findOne({"facebook.id": profile.id}, function (err, user) {
          if (err) {
              return done(err);
          }
          if (user) {
              return done(null, user);
          }
          var newUser = new User();
          newUser.facebook.id = profile.id;
          newUser.facebook.name = profile.displayName;
          newUser.facebook.token = accessToken;
          newUser.save(function(err, result) {
             if (err) {
                 return done(err);
             }
             return done(null, newUser);
          });
      });
  })
);
