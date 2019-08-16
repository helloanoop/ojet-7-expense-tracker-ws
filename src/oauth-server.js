const express = require('express');
const bodyParser = require('body-parser');
const oAuth2Server = require('node-oauth2-server');
const oAuthModel = require('./oauth/access-token-model');
const database = require('./oauth/database');
const uuidv4 = require('uuid/v4');
const _ = require('lodash');
const port = process.env.PORT || 9000;

const userDB = database.userDB;
const app = express();

app.oauth = oAuth2Server({
  model: oAuthModel,
  grants: ['password'],
  debug: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(app.oauth.errorHandler());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  if ('OPTIONS' === req.method) {
    res.send(200);
  }
  else {
    next();
  }
});

app.get('/', (req, res) => {
  return res.json({message: "OAuth server is running"});
});

app.post('/register', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if(!username || !password) {
    return res.status(400).json({message: "Missing params"});
  }

  userDB.findOne({username: username}, function(err, user) {
    if(err)
      return res.status(500).json({message: "An error occured while fetching user"});

    if(user && user.id) 
      return res.status(400).json({message: "User already exists"});

    userDB.insert({
      id: uuidv4(),
      username: username,
      password: password
    }, function (err, user){
      if(err)
        return res.status(500).json({message: "An error occured while creating user"});

      return res.status(201).json(user);
    });
  });
});

app.post('/login', app.oauth.grant());
app.get('/check', app.oauth.authorise(), function(req, res) {
  return res.json({message: "Access Validated"});
});

let server = app.listen(port, function() {
  let host = server.address().address;
  let port = server.address().port;

  console.log("Oauth server listening at http://%s:%s", host, port);
});