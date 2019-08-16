'use strict';

const database = require('./database');
const tokenDB = database.tokenDB;
const userDB = database.userDB;

function getClient(clientID, clientSecret, callback){
  const client = {
    clientID,
    clientSecret,
    grants: null,
    redirectUris: null
  };

  return callback(false, client);
}

function saveAccessToken(accessToken, clientID, expires, user, callback){
  tokenDB.insert({
    access_token: accessToken,
    user_id: user.id
  }, function (err, created){
    if(err)
      return callback(err);
    else
      return callback(null, created);
  });
}

function getUser(username, password, callback){
  userDB.findOne({username: username, password: password}, function(err, user) {
    if(err)
      return callback(err);
    else if (!user)
      return callback(true);
    else
      return callback(null, user);
  });
}

function grantTypeAllowed(clientID, grantType, callback) {
  return callback(false, true);
}

function getAccessToken(bearerToken, callback) {
  tokenDB.findOne({
    access_token: bearerToken
  }, function(err, token) {
    if(err || !token) {
      return callback(true);
    } else {
      const accessToken = {
        user: {
          id: token.user_id,
        },
        expires: null
      }
      return callback(null, accessToken);
    }
  });
}

module.exports = {
  getClient: getClient,
  saveAccessToken: saveAccessToken,
  getUser: getUser,
  grantTypeAllowed: grantTypeAllowed,
  getAccessToken: getAccessToken
};