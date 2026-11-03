const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedE2eUser() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const hash = await bcrypt.hash('password123', 10);
  await client.query(`
    INSERT INTO users (username, email, password_hash, display_name, role)
    VALUES ('testuser', 'test@example.com', $1, 'Test Reader', 'reader')
    ON CONFLICT (email) DO UPDATE SET password_hash = $1, display_name = 'Test Reader'
  `, [hash]);
  console.log('Test reader ready: test@example.com / password123');
  await client.end();
}

seedE2eUser().catch(console.error);
