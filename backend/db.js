const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || '123',
  database: process.env.DB_NAME || 'sweet_shop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Startup connection verification test query
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('[DB] Connecting to MySQL database:', process.env.DB_NAME);
    await connection.query('SELECT 1');
    connection.release();
    console.log('[DB] DATABASE CONNECTED OK');
  } catch (err) {
    console.error('[DB] DATABASE CONNECTION FAILED:', err.message);
  }
})();

module.exports = pool;
