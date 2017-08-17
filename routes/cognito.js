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
            req.session.cognitoUserData = result;
            res.redirect('/cognito/profile');
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

router.post('/getS3BucketList', function(req, res, next) {
  var messages = req.flash('error');
  // res.render('cognito/profile', {messages: messages, hasErrors: messages.length > 0});

  //POTENTIAL: Region needs to be set if not already set previously elsewhere.
  AWS.config.region = Auth.AWS.Region;

  // Add the User's Id Token to the Cognito credentials login map.
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: Auth.AWS.IdentityPoolId, // 'YOUR_IDENTITY_POOL_ID',
      Logins: {
          // 'cognito-idp.<region>.amazonaws.com/<YOUR_USER_POOL_ID>': session.getIdToken().getJwtToken()
          ['cognito-idp.' + Auth.AWS.Region + '.amazonaws.com/' + Auth.AWS.UserPoolId]: req.session.cognitoUserData.idToken.jwtToken
      }
  });

  AWS.config.credentials.refresh(function(){
     // Your S3 code here...
     // Instantiate aws sdk service objects now that the credentials have been updated.
     var s3 = new AWS.S3();
     var params = {};
     s3.listBuckets(params, function(err, data) {
       if(err) {
         console.error(err);
         res.json(err);
         return;
       }
       console.log(data);
       res.json(data);
     });
  });
});


module.exports = router;
