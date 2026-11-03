const { Pool } = require('pg');

const isNeon = process.env.DATABASE_URL?.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (err) => console.error('PG pool error', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};