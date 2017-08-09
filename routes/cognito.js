var express = require('express');
var router = express.Router();

var AWS = require('aws-sdk');
var AWSCognito = require('amazon-cognito-identity-js-node');

var auth = require('../config/auth');


router.get('/signup', function(req, res, next) {
  var messages = req.flash('error');
  res.render('cognito/signup', {messages: messages, hasErrors: messages.length > 0});
});

router.post('/signup', function(req, res, next) {
  var messages = req.flash('error');

  var poolData = {
      UserPoolId : auth.AWS.UserPoolId,
      ClientId : auth.AWS.ClientId
  };

  var userPool = new AWSCognito.CognitoUserPool(poolData);

  var attributeList = [];
  var attributeEmail = new AWSCognito.CognitoUserAttribute('email', req.body.email);
  var attributePhoneNumber = new AWSCognito.CognitoUserAttribute('phone_number', req.body.phone);

  attributeList.push(attributeEmail);
  attributeList.push(attributePhoneNumber);

  var cognitoUser;

  userPool.signUp('username', 'password', attributeList, null, function(err, result){
      if (err) {
          for (var key in err) {
            if (err.hasOwnProperty(key) && typeof(err[key]) !== 'function') {
              messages.push(key + ' : ' + err[key]);
            }
          }
          res.render('cognito/signup', {messages: messages, hasErrors: messages.length > 0});
          return;
      }
      req.session.cognitoUser = cognitoUser = result.user;
      req.session.cognitoUserConfirmed = result.userConfirmed;
      console.log('user name is ' + cognitoUser.getUsername());
      res.render('cognito/confirm-user', {messages: messages, hasErrors: messages.length > 0});
  });
});

router.post('/confirm-user', function(req, res, next) {
  var messages = req.flash('error');

  var poolData = {
      UserPoolId : auth.AWS.UserPoolId,
      ClientId : auth.AWS.ClientId
  };

  var userPool = new AWSCognito.CognitoUserPool(poolData);
  var userData = {
      Username : 'username',
      Pool : userPool
  };

  var cognitoUser = new AWSCognito.CognitoUser(userData);
  cognitoUser.confirmRegistration(req.body.code, true, function(err, result) {
      if (err) {
          alert(err);
          return;
      }
      console.log('call result: ' + result);
      res.render('cognito/profile', {messages: messages, hasErrors: messages.length > 0});
  });
});

router.post('/resend-code', function(req, res, next) {
  var messages = req.flash('error');

  var poolData = {
      UserPoolId : auth.AWS.UserPoolId,
      ClientId : auth.AWS.ClientId
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

module.exports = router;
