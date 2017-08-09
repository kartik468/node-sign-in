// (function() {
//   'use strict';
//   // The usage examples below use the unqualified names for types in the Amazon Cognito Identity SDK for JavaScript.
//   // Remember to import or qualify access to any of these types:
//   // When using loose Javascript files:
//   var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
//
//   // Registering a user with the application. One needs to create a CognitoUserPool object by providing a UserPoolId and
//    // a ClientId and signing up by using a username, password, attribute list, and validation data.
//
//   var poolData = {
//       UserPoolId : MyApp.Amazon.UserPoolId, // Your user pool id here
//       ClientId : MyApp.Amazon.ClientId // Your client id here
//   };
//   var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
//
//   var attributeList = [];
//
//   var dataEmail = {
//       Name : 'email',
//       Value : 'rkartik1992@gmail.com'
//   };
//
//   var dataPhoneNumber = {
//       Name : 'phone_number',
//       Value : '+15555555555'
//   };
//   var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
//   var attributePhoneNumber = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataPhoneNumber);
//
//   attributeList.push(attributeEmail);
//   attributeList.push(attributePhoneNumber);
//
//   var cognitoUser;
//
//   userPool.signUp('username', 'password', attributeList, null, function(err, result){
//       if (err) {
//           alert(err);
//           return;
//       }
//       cognitoUser = result.user;
//       console.log('user name is ' + cognitoUser.getUsername());
//   });
//
//
// }());
