const NeDB = require('nedb');
const path = require('path');
const dbPath = path.resolve(process.cwd(), 'db-data')

const userDB = new NeDB({
  filename: `${dbPath}/users.nedb`,
  autoload: true
});

const tokenDB = new NeDB({
  filename: `${dbPath}/oauth-token.nedb`,
  autoload: true
});

module.exports = {
  userDB: userDB,
  tokenDB: tokenDB
};