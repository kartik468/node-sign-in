var express = require('express');
var router = express.Router();

var AWS = require('aws-sdk');
var AWSCognito = require('amazon-cognito-identity-js-node');

var Auth = require('../config/auth');

var poolData = {
    UserPoolId : Auth.AWS.UserPoolId,
    ClientId : Auth.AWS.ClientId
};

var userPool = new AWSCognito.CognitoUserPool(poolData);

router.get('/signup', function(req, res, next) {
  var messages = req.flash('error');
  res.render('cognito/signup', {messages: messages, hasErrors: messages.length > 0});
});

router.post('/signup', function(req, res, next) {
  var messages = req.flash('error');

  var attributeList = [];
  var attributeEmail = new AWSCognito.CognitoUserAttribute('email', req.body.email);
  var attributePhoneNumber = new AWSCognito.CognitoUserAttribute('phone_number', req.body.phone);

  attributeList.push(attributeEmail);
  // attributeList.push(attributePhoneNumber);
  var username = req.body.username;
  var password = req.body.password;

  userPool.signUp(username, password, attributeList, null, function(err, result){
      if (err) {
          for (var key in err) {
            if (err.hasOwnProperty(key) && typeof(err[key]) !== 'function') {
              messages.push(key + ' : ' + err[key]);
            }
          }
          res.render('cognito/signup', {messages: messages, hasErrors: messages.length > 0});
          return;
      }
      req.session.cognitoUser = result.user;
      req.session.cognitoUserConfirmed = result.userConfirmed;
      console.log('user name is ' + result.user.getUsername());
      res.redirect('/cognito/verify-code');
  });
});

router.get('/verify-code', function(req, res, next) {
  var messages = req.flash('error');
  res.render('cognito/verify-code', {messages: messages, hasErrors: messages.length > 0});
});

router.post('/verify-code', function(req, res, next) {
  var messages = req.flash('error');

  var userData = {
      Username : req.session.cognitoUser.username,
      Pool : userPool
  };

  var cognitoUser = new AWSCognito.CognitoUser(userData);
  cognitoUser.confirmRegistration(req.body.code, true, function(err, result) {
    if (err) {
      for (var key in err) {
        if (err.hasOwnProperty(key) && typeof(err[key]) !== 'function') {
          messages.push(key + ' : ' + err[key]);
        }
      }
      res.render('/cognito/verify-code', {messages: messages, hasErrors: messages.length > 0});
      return;
    }
    console.log('call result: ' + result);
    res.redirect('/cognito/signin');
  });
});

router.post('/resend-code', function(req, res, next) {
  var messages = req.flash('error');

  var userData = {
      Username : 'username',
      Pool : userPool
  };

  var cognitoUser = new AWSCognito.CognitoUser(userData);
  cognitoUser.resendConfirmationCode(function(err, result) {
      if (err) {
          alert(err);
          return;
      }
      console.log('call result: ' + result);
  });
});

router.get('/signin', function(req, res, next) {
  var messages = req.flash('error');
  res.render('cognito/signin', {messages: messages, hasErrors: messages.length > 0});
});

router.post('/signin', function(req, res, next) {
  var messages = req.flash('error');
  var authenticationData = {
       Username : req.body.username,
       Password : req.body.password,
   };
   var authenticationDetails = new AWSCognito.AuthenticationDetails(authenticationData);

   var userData = {
     Username : req.body.username,
     Pool : userPool
   };
   var cognitoUser = new AWSCognito.CognitoUser(userData);
   cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            console.log('access token + ' + result.getAccessToken().getJwtToken());
            res.redirect('/cognito/profile');
        },

        onFailure: function(err) {
            alert(err);
        },

    });
});

router.get('/profile', function(req, res, next) {
  var messages = req.flash('error');

  var cognitoUser = userPool.getCurrentUser();

  if (cognitoUser != null) {
    cognitoUser.getSession(function(err, session) {
        if (err) {
            alert(err);
            return;
        }
        console.log('session validity: ' + session.isValid());

        // NOTE: getSession must be called to authenticate user before calling getUserAttributes
        cognitoUser.getUserAttributes(function(err, attributes) {
            if (err) {
                // Handle error
            } else {
                // Do something with attributes
            }
        });

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId : '...', // your identity pool id here
            Logins : {
                // Change the key below according to the specific region your user pool is in.
                'cognito-idp.<region>.amazonaws.com/<YOUR_USER_POOL_ID>' : session.getIdToken().getJwtToken()
            }
        });

        // Instantiate aws sdk service objects now that the credentials have been updated.
        // example: var s3 = new AWS.S3();

    });
  }
  res.render('cognito/profile', {messages: messages, hasErrors: messages.length > 0});
});


module.exports = router;
