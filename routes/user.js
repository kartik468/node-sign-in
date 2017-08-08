var express = require('express');
var router = express.Router();
// var csrf = require('csurf');
var passport = require('passport');

// var csrfProtection = csrf();
// router.use(csrfProtection);

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

router.get('/profile', isLoggedIn, function (req, res, next) {
    res.render('user/profile', {user: req.user});
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home/index', { title: 'Node Authentication' });
});

router.get('/signin', function(req, res, next) {
  var messages = req.flash('error');
  res.render('user/signin', {messages: messages, hasErrors: messages.length > 0});
});

router.post('/signin', passport.authenticate('local.signin', {
    successRedirect: '/profile',
    failureRedirect: '/signin',
    failureFlash: true
}));

router.get('/signup', function(req, res, next) {
  var messages = req.flash('error');
  res.render('user/signup', {messages: messages, hasErrors: messages.length > 0});
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
}));

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});


// fb routes
router.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email',
    authType: 'reauthenticate',
    authNonce: 'foo123'
  }));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });


// amazon app routes
router.get('/auth/amazon',
  passport.authenticate('amazon', {
        scope: ['profile']
    }));

router.get('/auth/amazon/callback',
  passport.authenticate('amazon', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });

module.exports = router;
