// allow connection to mysql database
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-complete',
    password: 'نشققشغ'
});

module.exports = pool.promise();