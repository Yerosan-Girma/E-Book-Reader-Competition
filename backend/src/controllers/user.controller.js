const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Format seconds into readable duration (e.g., "1h 45m" or "45s")
function formatDuration(sec) {
  const s = Math.max(0, Number(sec) || 0);
  if (s === 0) return '0m';
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return remM > 0 ? `${h}h ${remM}m` : `${h}h`;
}

// 1. Get current user's profile and lifetime statistics
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const userRes = await db.query(
      `SELECT id, username, email, display_name, avatar_url, role,
              profile_public, created_at, google_id
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRes.rows[0];

    // Compute reader stats
    const statsRes = await db.query(
      `SELECT
         COALESCE((SELECT SUM(duration_seconds)::int FROM reading_sessions WHERE user_id = $1 AND duration_seconds > 0), 0) AS total_seconds,
         COALESCE((SELECT COUNT(*)::int FROM reading_progress WHERE user_id = $1 AND is_completed = TRUE), 0) AS completed_books,
         COALESCE((SELECT COUNT(*)::int FROM books WHERE created_by = $1), 0) AS uploaded_books,
         COALESCE((SELECT COUNT(DISTINCT DATE(started_at))::int FROM reading_sessions WHERE user_id = $1 AND duration_seconds >= 10), 0) AS active_days`,
      [userId]
    );

    const stats = statsRes.rows[0];
    const totalSec = Number(stats.total_seconds) || 0;

    res.json({
      user,
      stats: {
        totalSeconds: totalSec,
        totalFormatted: formatDuration(totalSec),
        totalHours: (totalSec / 3600).toFixed(1),
        completedBooks: Number(stats.completed_books) || 0,
        uploadedBooks: Number(stats.uploaded_books) || 0,
        activeDays: Number(stats.active_days) || 0,
      },
    });
  } catch (e) {
    next(e);
  }
};

// 2. Update user profile (display name, username, avatar URL, public status)
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { display_name, username, avatar_url, profile_public } = req.body;

    // Check if username is being changed and if it is taken
    if (username) {
      const cleanUsername = username.trim().toLowerCase();
      const conflict = await db.query(
        'SELECT id FROM users WHERE LOWER(username) = $1 AND id != $2',
        [cleanUsername, userId]
      );
      if (conflict.rows.length > 0) {
        return res.status(400).json({ error: 'Username is already taken by another reader.' });
      }
    }

    const { rows } = await db.query(
      `UPDATE users
          SET display_name = COALESCE($1, display_name),
              username = COALESCE($2, username),
              avatar_url = COALESCE($3, avatar_url),
              profile_public = COALESCE($4, profile_public),
              updated_at = NOW()
        WHERE id = $5
        RETURNING id, username, email, display_name, avatar_url, role, profile_public, created_at, google_id`,
      [
        display_name !== undefined ? display_name.trim() : null,
        username !== undefined ? username.trim().toLowerCase() : null,
        avatar_url !== undefined ? avatar_url.trim() : null,
        typeof profile_public === 'boolean' ? profile_public : null,
        userId,
      ]
    );

    res.json({
      user: rows[0],
      message: 'Profile updated successfully!',
    });
  } catch (e) {
    next(e);
  }
};

// 3. Change password
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const { rows } = await db.query(
      'SELECT password_hash, google_id FROM users WHERE id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = rows[0];

    // Current password is required and must match
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to update your password.' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, userId]
    );

    res.json({ message: 'Password updated successfully!' });
  } catch (e) {
    next(e);
  }
};

// 4. Get books uploaded by the current user
exports.getUploadedBooks = async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const { rows } = await db.query(
      `SELECT b.id, b.title, b.author, b.cover_url, b.description, b.file_type,
              b.file_url, b.is_published, b.created_at,
              COALESCE(
                (SELECT c.name FROM book_categories bc JOIN categories c ON c.id = bc.category_id WHERE bc.book_id = b.id LIMIT 1),
                'Digital Library'
              ) AS category
       FROM books b
       WHERE b.created_by = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );

    res.json({ books: rows });
  } catch (e) {
    next(e);
  }
};
