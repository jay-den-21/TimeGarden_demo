const path = require('path');
const mysql = require('mysql2/promise');

// Always load env from the backend folder so running from the repo root still picks up DB creds.
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASS,
  DB_PASSWORD,
  DB_NAME = 'TimeGarden',
  DB_PORT = 3306
} = process.env;

const poolConfig = {
  user: DB_USER,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true // Cast DECIMAL/NUMERIC to JS numbers so frontend math/toFixed works
};

// Use socket connection for localhost if no password is provided (common on macOS)
const password = DB_PASS || DB_PASSWORD || '';
if (password) {
  poolConfig.host = DB_HOST;
  poolConfig.port = Number(DB_PORT) || 3306;
  poolConfig.password = password;
} else if (DB_HOST === 'localhost' || DB_HOST === '127.0.0.1') {
  // Use socket connection for localhost without password
  poolConfig.socketPath = '/tmp/mysql.sock';
} else {
  poolConfig.host = DB_HOST;
  poolConfig.port = Number(DB_PORT) || 3306;
}

const pool = mysql.createPool(poolConfig);

// Test the connection immediately on startup to provide helpful feedback
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   -> Check your backend/.env file. Ensure DB_PASSWORD matches your local MySQL root password.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('   -> Is your MySQL server running?');
    }
  });

module.exports = pool;

