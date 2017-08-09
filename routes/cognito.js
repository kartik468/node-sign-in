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
      UserPoolId : auth.AWS.UserPoolId, // Your user pool id here
      ClientId : auth.AWS.ClientId // Your client id here
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
          res.render('cognito/confirm-user', {messages: messages, hasErrors: messages.length > 0});
          return;
      }
      cognitoUser = result.user;
      console.log('user name is ' + cognitoUser.getUsername());
      res.render('cognito/profile', {messages: messages, hasErrors: messages.length > 0});
  });


});

module.exports = router;
