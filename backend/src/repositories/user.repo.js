const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const findByEmail = async (email) => {
  const { rows } = await db.query('SELECT * FROM users WHERE LOWER(email) = $1', [email.toLowerCase()]);
  return rows[0];
};

const findByGoogleId = async (googleId) => {
  const { rows } = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  return rows[0];
};

const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT id, username, email, display_name, avatar_url, role,
            profile_public, google_id, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0];
};

const create = async ({ username, email, passwordHash, displayName, avatarUrl, googleId }) => {
  const { rows } = await db.query(
    `INSERT INTO users (username, email, password_hash, display_name, avatar_url, google_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, username, email, display_name, avatar_url, role, created_at`,
    [username, email, passwordHash, displayName ?? username, avatarUrl ?? null, googleId ?? null]
  );
  return rows[0];
};

const findOrCreateGoogleUser = async ({ googleId, email, name, picture }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if user exists by googleId or by email
  const existing = await db.query(
    'SELECT * FROM users WHERE google_id = $1 OR LOWER(email) = $2',
    [googleId, normalizedEmail]
  );

  if (existing.rows.length > 0) {
    const user = existing.rows[0];
    // Update missing info
    const updated = await db.query(
      `UPDATE users
          SET google_id = COALESCE(google_id, $1),
              avatar_url = COALESCE($2, avatar_url),
              display_name = COALESCE(display_name, $3),
              role = CASE WHEN LOWER(email) = 'yerosang463@gmail.com' THEN 'admin' ELSE role END,
              updated_at = NOW()
        WHERE id = $4
        RETURNING id, username, email, display_name, avatar_url, role, created_at`,
      [googleId, picture || null, name || null, user.id]
    );
    return updated.rows[0];
  }

  // 2. Generate clean unique username from email/name
  let baseUsername = (name || normalizedEmail.split('@')[0])
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 30);
  if (!baseUsername || baseUsername.length < 3) {
    baseUsername = 'reader_' + Math.floor(Math.random() * 10000);
  }

  let username = baseUsername;
  let attempt = 1;
  while (true) {
    const conflict = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (!conflict.rowCount) break;
    username = `${baseUsername}${attempt++}`.slice(0, 45);
  }

  // Satisfy password_hash NOT NULL constraint with a secure random hash
  const randomPass = crypto.randomBytes(32).toString('hex');
  const passwordHash = await bcrypt.hash(randomPass, 10);
  const role = normalizedEmail === 'yerosang463@gmail.com' ? 'admin' : 'reader';

  const { rows } = await db.query(
    `INSERT INTO users (username, email, password_hash, display_name, avatar_url, role, google_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, username, email, display_name, avatar_url, role, created_at`,
    [username, normalizedEmail, passwordHash, name || username, picture || null, role, googleId]
  );

  return rows[0];
};

module.exports = {
  findByEmail,
  findByGoogleId,
  findById,
  create,
  findOrCreateGoogleUser,
};
