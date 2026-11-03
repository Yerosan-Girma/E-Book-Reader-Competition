/**
 * Setup test database for integration tests
 * Run this before running integration tests
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const TEST_DB_NAME = 'readrise_test';
const TEST_DB_USER = 'test';
const TEST_DB_PASS = 'test';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres',
});

async function setupTestDatabase() {
  try {
    console.log('Setting up test database...');

    // Drop test database if it exists
    await pool.query(`DROP DATABASE IF EXISTS ${TEST_DB_NAME}`);
    console.log(`Dropped existing ${TEST_DB_NAME} database`);

    // Create test database
    await pool.query(`CREATE DATABASE ${TEST_DB_NAME}`);
    console.log(`Created ${TEST_DB_NAME} database`);

    // Close connection to postgres
    await pool.end();

    // Connect to test database
    const testPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: TEST_DB_USER,
      password: TEST_DB_PASS,
      database: TEST_DB_NAME,
    });

    // Read and execute schema
    const sqlDir = path.join(__dirname, '../sql');
    const sqlFiles = fs.readdirSync(sqlDir)
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (const file of sqlFiles) {
      const sqlContent = fs.readFileSync(path.join(sqlDir, file), 'utf8');
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        await testPool.query(statement);
      }
    }

    console.log('Schema applied successfully');

    // Create test user
    await testPool.query(
      `INSERT INTO users (username, email, password_hash, display_name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      ['testuser', 'test@example.com', '$2a$10$test', 'Test User', 'reader']
    );

    // Create admin user
    await testPool.query(
      `INSERT INTO users (username, email, password_hash, display_name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      ['admin', 'admin@example.com', '$2a$10$test', 'Admin User', 'admin']
    );

    console.log('Test users created');

    await testPool.end();
    console.log('Test database setup complete!');
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}

setupTestDatabase();
