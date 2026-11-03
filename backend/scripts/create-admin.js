const bcrypt = require('bcryptjs');
require('dotenv').config();

const { Client } = require('pg');

async function createAdmin() {
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
    console.log('Connected to database');

    const adminEmail = 'yerosang463@gmail.com';
    const adminPassword = 'yeroadmin123';
    const adminUsername = 'yerosang463';
    const adminDisplayName = 'Admin User';

    // Check if admin already exists
    const existing = await client.query(
      'SELECT id, role FROM users WHERE email = $1',
      [adminEmail.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      if (user.role === 'admin') {
        console.log('Admin user already exists with admin role');
        return;
      }

      // Update to admin role
      await client.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        ['admin', user.id]
      );
      console.log('Updated existing user to admin role');
      return;
    }

    // Create new admin user
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await client.query(
      `INSERT INTO users (username, email, password_hash, display_name, role, profile_public)
       VALUES ($1, $2, $3, $4, $5, TRUE)`,
      [adminUsername, adminEmail.toLowerCase(), passwordHash, adminDisplayName, 'admin']
    );

    console.log('✅ Admin user created successfully');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Username: ${adminUsername}`);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    throw error;
  } finally {
    await client.end().catch(() => {});
  }
}

createAdmin().catch((error) => {
  console.error('Admin creation failed:', error.message);
  process.exitCode = 1;
});
