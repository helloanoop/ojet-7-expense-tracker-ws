const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const cors = require('cors');
const rp = require('request-promise');
const argv = require('yargs').argv

const NeDB = require('nedb');
const service = require('feathers-nedb');

const db = new NeDB({
  filename: './db-data/databasse.nedb',
  autoload: true
});
const oauthEnabled = argv['oauth-secured'] ? true : false;

// Create an Express compatible Feathers application instance.
const app = express(feathers());

// Turn on JSON parser for REST services
app.use(express.json());

// Turn on CORS
app.use(cors());
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

// Turn on URL-encoded parser for REST services
app.use(express.urlencoded({extended: true}));

// Enable REST services
app.configure(express.rest());

if(oauthEnabled){
  app.use(function(req, res, next) {
    var options = {
      method: 'GET',
      uri: 'http://localhost:9000/check',
      headers: {
        'Authorization': req.headers.authorization,
        'content-type': 'application/x-www-form-urlencoded'  // Is set automatically
      }
    };

    rp(options)
      .then(function (data) {
        return next();
      })
      .catch(function (err) {
        console.log(err);
        return res.status(403).send("Forbidden");
      });
  });
}


// Connect to the db, create and register a Feathers service.
app.use('/api/expense', service({
  Model: db,
  id: 'id',
  paginate: {
    default: 5,
    max: 100
  }
}));

app.use('/api/expense-category', service({
  Model: db,
  id: 'id',
  paginate: {
    default: 5,
    max: 100
  }
}));

// Event Handlers
let expenseService = app.service('api/expense');;
expenseService.on('created', (expense, context) => console.log('created', expense));
expenseService.on('updated', (expense, context) => console.log('updated', expense));
expenseService.on('removed', (expense, context) => console.log('removed', expense));

let categoryService = app.service('api/expense-category');;
categoryService.on('created', (category, context) => console.log('created', category));
categoryService.on('updated', (category, context) => console.log('updated', category));
categoryService.on('removed', (category, context) => console.log('removed', category));

// Set up default error handler
app.use(express.errorHandler());

// Start the server.
const port = 5000;

app.listen(port, () => {
  console.log(`Feathers expense server listening on port ${port}`);
});