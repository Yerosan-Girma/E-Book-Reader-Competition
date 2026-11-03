const fs = require('node:fs/promises');
const path = require('node:path');
require('dotenv').config();

const { Client } = require('pg');

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Copy .env.example to .env and configure PostgreSQL.');
  }

  const isNeon = process.env.DATABASE_URL.includes('neon.tech');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: isNeon ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 6000,
  });

  try {
    await client.connect();
    const sqlDir = path.join(__dirname, '..', 'sql');
    const sqlFiles = (await fs.readdir(sqlDir))
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const schema = (await Promise.all(
      sqlFiles.map((file) => fs.readFile(path.join(sqlDir, file), 'utf8')),
    )).join('\n');

    await client.query('BEGIN');
    await client.query(schema);
    await client.query('COMMIT');

    const { rows } = await client.query(
      `SELECT COUNT(*)::int AS count
         FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
    );
    console.log(`ReadRise schema is ready (${rows[0].count} tables in public).`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end().catch(() => {});
  }
}

setupDatabase().catch((error) => {
  console.error('Database setup failed:', error.message);
  process.exitCode = 1;
});
