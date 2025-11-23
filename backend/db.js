const path = require('path');
const mysql = require('mysql2/promise');

// Always load env from the backend folder so running from the repo root still picks up DB creds.
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASS,
  DB_PASSWORD,
  DB_NAME = 'TimeGarden',
  DB_PORT = 3306
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  // Support both DB_PASS and DB_PASSWORD to match env file naming.
  password: DB_PASS || DB_PASSWORD || '',
  database: DB_NAME,
  port: Number(DB_PORT) || 3306, // Standard MySQL port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true // Cast DECIMAL/NUMERIC to JS numbers so frontend math/toFixed works
});

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