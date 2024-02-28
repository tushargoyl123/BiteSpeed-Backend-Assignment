const mysql = require('mysql2');

const pool = mysql.createPool({
  user: 'root',
  host: 'localhost',
  database: 'testing',
  password: '1234'
});

const promisePool = pool.promise();
// module.exports = pool;

module.exports = promisePool;
