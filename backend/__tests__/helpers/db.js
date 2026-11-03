/**
 * Database helper for integration tests
 * Provides setup and teardown utilities
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { pool } = require('../../src/config/db');

const testPool = new Pool({
  connectionString:
    process.env.TEST_DATABASE_URL ||
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/readrise_test?sslmode=disable',
});

let cachedPasswordHash = null;

/**
 * Truncate all tables in the test database in a single atomic statement
 */
async function truncateAllTables() {
  const client = await testPool.connect();
  try {
    const { rows } = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `);

    if (rows.length > 0) {
      const tableList = rows.map((r) => `"${r.tablename}"`).join(', ');
      await client.query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);
    }
  } finally {
    client.release();
  }
}

/**
 * Seed test data
 */
async function seedTestData() {
  if (!cachedPasswordHash) {
    cachedPasswordHash = await bcrypt.hash('SecurePass123!', 10);
  }

  const client = await testPool.connect();
  try {
    await client.query('BEGIN');

    // Create test users
    await client.query(
      `INSERT INTO users (username, email, password_hash, display_name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      ['testuser', 'test@example.com', cachedPasswordHash, 'Test User', 'reader']
    );

    await client.query(
      `INSERT INTO users (username, email, password_hash, display_name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      ['admin', 'admin@example.com', cachedPasswordHash, 'Admin User', 'admin']
    );

    // Create test category
    await client.query(
      `INSERT INTO categories (name, slug, description)
       VALUES ($1, $2, $3)`,
      ['Fiction', 'fiction', 'Fictional works']
    );

    // Create test book
    const { rows: [book] } = await client.query(
      `INSERT INTO books (title, author, description, language, total_chapters, is_published, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, (SELECT id FROM users WHERE username = 'admin'))
       RETURNING *`,
      ['Test Book', 'Test Author', 'A test book for testing', 'en', 5, true]
    );

    // Create test chapters
    for (let i = 1; i <= 5; i++) {
      await client.query(
        `INSERT INTO chapters (book_id, chapter_number, title, content, word_count)
         VALUES ($1, $2, $3, $4, $5)`,
        [book.id, i, `Chapter ${i}`, `Content of chapter ${i}`, 100 * i]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close both the test pool and the application database connection
 */
async function closeTestDb() {
  await testPool.end().catch(() => {});
  await pool.end().catch(() => {});
}

module.exports = {
  testPool,
  truncateAllTables,
  seedTestData,
  closeTestDb,
};
