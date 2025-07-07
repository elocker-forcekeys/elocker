const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '91.234.194.20',
  user: process.env.DB_USER || 'cp2111737p21_elocker',
  password: process.env.DB_PASSWORD || 'RDN-8g=CI;$1',
  database: process.env.DB_NAME || 'cp2111737p21_elocker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

testConnection();

module.exports = pool;