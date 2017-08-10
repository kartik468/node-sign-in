var express = require('express');
var router = express.Router();

var AWS = require('aws-sdk');
var AWSCognito = require('amazon-cognito-identity-js-node');

var Auth = require('../config/auth');


router.get('/signup', function(req, res, next) {
  var messages = req.flash('error');
  res.render('cognito/signup', {messages: messages, hasErrors: messages.length > 0});
});

router.post('/signup', function(req, res, next) {
  var messages = req.flash('error');

  var poolData = {
      UserPoolId : Auth.AWS.UserPoolId,
      ClientId : Auth.AWS.ClientId
  };

  var userPool = new AWSCognito.CognitoUserPool(poolData);

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

  var poolData = {
      UserPoolId : Auth.AWS.UserPoolId,
      ClientId : Auth.AWS.ClientId
  };

  var userPool = new AWSCognito.CognitoUserPool(poolData);
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

  var poolData = {
      UserPoolId : Auth.AWS.UserPoolId,
      ClientId : Auth.AWS.ClientId
  };

  var userPool = new AWSCognito.CognitoUserPool(poolData);
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
   var poolData = {
       UserPoolId : Auth.AWS.UserPoolId,
       ClientId : Auth.AWS.ClientId
   };
   var userPool = new AWSCognito.CognitoUserPool(poolData);
   var userData = {
     Username : req.body.username,
     Pool : userPool
   };
   var cognitoUser = new AWSCognito.CognitoUser(userData);
   cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            console.log('access token + ' + result.getAccessToken().getJwtToken());

            //POTENTIAL: Region needs to be set if not already set previously elsewhere.
            AWS.config.region = Auth.AWS.Region;

            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId : Auth.AWS.UserPoolId, // your identity pool id here
                Logins : {
                    // Change the key below according to the specific region your user pool is in.
                    ['cognito-idp.'+ Auth.AWS.Region + '.amazonaws.com/'+ Auth.AWS.UserPoolId] : result.getIdToken().getJwtToken()
                }
            });

            // Instantiate aws sdk service objects now that the credentials have been updated.
            // example: var s3 = new AWS.S3();

        },

        onFailure: function(err) {
            alert(err);
        },

    });
});

router.get('/profile', function(req, res, next) {
  var messages = req.flash('error');
  res.render('cognito/profile', {messages: messages, hasErrors: messages.length > 0});
});


module.exports = router;
