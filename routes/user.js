var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');

var csrfProtection = csrf();
router.use(csrfProtection);

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

router.get('/user/profile', isLoggedIn, function (req, res, next) {
    res.render('user/profile', {user: req.user});
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home/index', { title: 'Node Authentication' });
});

router.get('/user/signin', function(req, res, next) {
  var messages = req.flash('error');
  res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/user/signin', passport.authenticate('local.signin', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signin',
    failureFlash: true
}));

router.get('/user/signup', function(req, res, next) {
  var messages = req.flash('error');
  res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/user/signup', passport.authenticate('local.signup', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signup',
    failureFlash: true
}));

router.get('/user/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});


// fb routes
router.get('/user/auth/facebook',
passport.authenticate('facebook', {scope: ['email']}));

router.get('/user/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/user/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/user/profile');
  });


module.exports = router;
