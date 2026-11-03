const db = require('../config/db');

const makeError = (status, message) => Object.assign(new Error(message), { status });

const inTransaction = async (work) => {
  const client = await db.pool.connect();
  let begun = false;
  try {
    await client.query('BEGIN');
    begun = true;
    const result = await work(client);
    await client.query('COMMIT');
    begun = false;
    return result;
  } catch (error) {
    if (begun) await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Accurately compute active reading duration in seconds for a session
 */
const computeDuration = async (client, sessionId) => {
  const { rows: durationRows } = await client.query(
    `SELECT FLOOR(COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(next_at, NOW()) - occurred_at))), 0))::int AS seconds
       FROM (
         SELECT event_type, occurred_at,
                LEAD(occurred_at) OVER (ORDER BY occurred_at, id) AS next_at
           FROM reading_events
          WHERE session_id = $1
            AND event_type IN ('start', 'resume', 'pause', 'finish', 'heartbeat')
       ) AS state_events
      WHERE event_type IN ('start', 'resume', 'heartbeat')`,
    [sessionId]
  );

  let seconds = Math.max(0, durationRows[0]?.seconds ?? 0);
  if (seconds === 0) {
    const { rows: sessRows } = await client.query(
      `SELECT EXTRACT(EPOCH FROM (NOW() - started_at))::int AS elapsed
         FROM reading_sessions WHERE id = $1`,
      [sessionId]
    );
    seconds = Math.max(0, sessRows[0]?.elapsed ?? 0);
  }
  return seconds;
};

// Helper to keep reading_progress total_reading_seconds in sync with reading_sessions
const syncBookTotalReadingSeconds = async (client, userId, bookId, format = null) => {
  await client.query(
    `INSERT INTO reading_progress (
       user_id, book_id, format, scroll_percent, total_reading_seconds, updated_at
     )
     VALUES (
       $1, $2, COALESCE($3, 'chapter'), 0,
       COALESCE((SELECT SUM(duration_seconds)::int FROM reading_sessions WHERE user_id = $1 AND book_id = $2), 0),
       NOW()
     )
     ON CONFLICT (user_id, book_id) DO UPDATE
       SET total_reading_seconds = COALESCE((
         SELECT SUM(duration_seconds)::int
           FROM reading_sessions
          WHERE user_id = $1 AND book_id = $2
       ), reading_progress.total_reading_seconds),
       format = COALESCE(reading_progress.format, EXCLUDED.format),
       updated_at = NOW()`,
    [userId, bookId, format]
  );
};

const start = (userId, { bookId, chapterId, format }) => inTransaction(async (client) => {
  // Locking the user serializes session starts and prevents duplicate simultaneous sessions.
  const user = await client.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [userId]);
  if (!user.rowCount) throw makeError(404, 'User not found');

  const book = await client.query(
    'SELECT id, file_type, file_url FROM books WHERE id = $1 AND is_published = TRUE',
    [bookId]
  );
  if (!book.rowCount) throw makeError(404, 'Published book not found');

  if (chapterId != null) {
    const chapter = await client.query(
      'SELECT id FROM chapters WHERE id = $1 AND book_id = $2',
      [chapterId, bookId]
    );
    if (!chapter.rowCount) throw makeError(404, 'Chapter not found for this book');
  }

  // 1. If an active session already exists for this EXACT book and user, reuse it!
  const existingActive = await client.query(
    `SELECT * FROM reading_sessions
      WHERE user_id = $1 AND book_id = $2 AND status = 'active'
      ORDER BY id DESC LIMIT 1`,
    [userId, bookId]
  );

  // Get total previous reading seconds for this book across all sessions
  const { rows: progRows } = await client.query(
    `SELECT COALESCE(
       (SELECT SUM(duration_seconds)::int FROM reading_sessions WHERE user_id = $1 AND book_id = $2),
       (SELECT total_reading_seconds FROM reading_progress WHERE user_id = $1 AND book_id = $2),
       0
     )::int AS total_seconds`,
    [userId, bookId]
  );
  const previousTotalSeconds = progRows[0]?.total_seconds || 0;

  if (existingActive.rowCount > 0) {
    const session = existingActive.rows[0];
    return {
      ...session,
      previousTotalSeconds,
      reused: true,
    };
  }

  // 2. Finalize any OTHER active sessions for this user so their reading time is saved
  const { rows: otherActive } = await client.query(
    `SELECT id, book_id, duration_seconds FROM reading_sessions
      WHERE user_id = $1 AND status IN ('active', 'paused')`,
    [userId]
  );
  for (const prev of otherActive) {
    const dur = await computeDuration(client, prev.id);
    const finalDur = Math.max(dur, prev.duration_seconds || 0, 1);
    await client.query(
      `UPDATE reading_sessions
          SET status = 'finished',
              ended_at = NOW(),
              duration_seconds = $1
        WHERE id = $2`,
      [finalDur, prev.id]
    );
    await client.query(
      `INSERT INTO reading_events (session_id, event_type, metadata)
       VALUES ($1, 'finish', $2)`,
      [prev.id, JSON.stringify({ autoFinalized: true, duration: finalDur })]
    );
    await syncBookTotalReadingSeconds(client, userId, prev.book_id);
  }

  // Detect format if not passed
  let resolvedFormat = format;
  if (!resolvedFormat) {
    const ft = (book.rows[0].file_type || '').toLowerCase();
    const fu = (book.rows[0].file_url || '').toLowerCase();
    if (ft.includes('pdf') || fu.endsWith('.pdf')) resolvedFormat = 'pdf';
    else if (ft.includes('docx') || fu.endsWith('.docx')) resolvedFormat = 'docx';
    else if (ft.includes('doc') || fu.endsWith('.doc')) resolvedFormat = 'doc';
    else if (ft.includes('image') || fu.match(/\.(jpeg|jpg|png|webp|gif)$/i)) resolvedFormat = 'image';
    else if (ft.includes('epub') || fu.endsWith('.epub')) resolvedFormat = 'epub';
    else resolvedFormat = 'chapter';
  }

  const { rows } = await client.query(
    `INSERT INTO reading_sessions (user_id, book_id, chapter_id, format, status, duration_seconds)
     VALUES ($1, $2, $3, $4, 'active', 0)
     RETURNING *`,
    [userId, bookId, chapterId ?? null, resolvedFormat]
  );
  const session = rows[0];
  await client.query(
    `INSERT INTO reading_events (session_id, event_type) VALUES ($1, 'start')`,
    [session.id]
  );

  // Initialize/sync reading_progress record so book appears in Continue Reading immediately
  await syncBookTotalReadingSeconds(client, userId, bookId, resolvedFormat);

  return {
    ...session,
    previousTotalSeconds,
  };
});

const transition = (sessionId, userId, expectedStatus, nextStatus, eventType) =>
  inTransaction(async (client) => {
    const { rows } = await client.query(
      'SELECT * FROM reading_sessions WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [sessionId, userId]
    );
    const session = rows[0];
    if (!session) throw makeError(404, 'Session not found');
    if (session.status !== expectedStatus) {
      throw makeError(400, `Session is not ${expectedStatus}`);
    }

    await client.query(
      'INSERT INTO reading_events (session_id, event_type) VALUES ($1, $2)',
      [sessionId, eventType]
    );

    const duration = await computeDuration(client, sessionId);
    const finalDur = Math.max(duration, session.duration_seconds || 0);

    const updated = await client.query(
      'UPDATE reading_sessions SET status = $1, duration_seconds = $2, ended_at = NOW() WHERE id = $3 RETURNING *',
      [nextStatus, finalDur, sessionId]
    );

    await syncBookTotalReadingSeconds(client, userId, session.book_id);

    return updated.rows[0];
  });

const heartbeat = (sessionId, userId, clientSeconds) => inTransaction(async (client) => {
  const { rows } = await client.query(
    'SELECT * FROM reading_sessions WHERE id = $1 AND user_id = $2 FOR UPDATE',
    [sessionId, userId]
  );
  if (!rows[0]) throw makeError(404, 'Session not found');
  const session = rows[0];

  await client.query(
    `INSERT INTO reading_events (session_id, event_type)
     VALUES ($1, 'heartbeat')`,
    [sessionId]
  );

  const clientSec = Number(clientSeconds) || 0;
  const currentDuration = session.duration_seconds || 0;
  const maxElapsed = Math.max(1, Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000) + 30);
  const computed = await computeDuration(client, sessionId);
  const targetSeconds = clientSec > 0 ? Math.min(clientSec, maxElapsed) : computed;
  const finalSeconds = Math.min(maxElapsed, Math.max(computed, targetSeconds, currentDuration + 1));

  await client.query(
    `UPDATE reading_sessions
        SET duration_seconds = $1, ended_at = NOW()
      WHERE id = $2`,
    [finalSeconds, sessionId]
  );

  await syncBookTotalReadingSeconds(client, userId, session.book_id);

  // Get updated book total seconds
  const { rows: progRows } = await client.query(
    `SELECT total_reading_seconds FROM reading_progress WHERE user_id = $1 AND book_id = $2`,
    [userId, session.book_id]
  );

  return {
    sessionId,
    durationSeconds: finalSeconds,
    bookTotalSeconds: progRows[0]?.total_reading_seconds || finalSeconds,
    occurredAt: new Date().toISOString(),
  };
});

const finish = (sessionId, userId, maxAllowedGapSeconds, clientSeconds) =>
  inTransaction(async (client) => {
    const { rows } = await client.query(
      'SELECT * FROM reading_sessions WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [sessionId, userId]
    );
    const session = rows[0];
    if (!session) throw makeError(404, 'Session not found');
    if (!['active', 'paused'].includes(session.status)) {
      return session; // already finished
    }

    const clientSec = Number(clientSeconds) || 0;
    const computed = await computeDuration(client, sessionId);
    const maxElapsed = Math.max(1, Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000) + 30);
    const targetSeconds = clientSec > 0 ? Math.min(clientSec, maxElapsed) : computed;
    const durationSeconds = Math.min(maxElapsed, Math.max(computed, targetSeconds, session.duration_seconds || 0, 1));

    const { rows: finishedRows } = await client.query(
      `UPDATE reading_sessions
          SET status = 'finished', ended_at = NOW(), duration_seconds = $1
        WHERE id = $2
        RETURNING *`,
      [durationSeconds, sessionId]
    );

    await client.query(
      `INSERT INTO reading_events (session_id, event_type, metadata)
       VALUES ($1, 'finish', $2)`,
      [sessionId, { durationSeconds }]
    );

    await syncBookTotalReadingSeconds(client, userId, session.book_id);

    return finishedRows[0];
  });

const history = async (userId) => {
  const { rows } = await db.query(
    `SELECT s.id, s.book_id, s.chapter_id, s.format, s.status, s.started_at, s.ended_at,
            s.duration_seconds, s.pages_read, s.is_verified,
            b.title, b.author, b.cover_url
       FROM reading_sessions s
       JOIN books b ON b.id = s.book_id
      WHERE s.user_id = $1 AND (s.duration_seconds > 0 OR s.status = 'finished')
      ORDER BY s.started_at DESC
      LIMIT 100`,
    [userId]
  );
  return rows;
};

const saveProgress = async (
  userId,
  bookId,
  { chapterId, scrollPercent, format, position, totalUnits, isCompleted, bookmarks, seconds }
) => {
  const book = await db.query(
    'SELECT id, file_type, file_url FROM books WHERE id = $1 AND is_published = TRUE',
    [bookId]
  );
  if (!book.rowCount) throw makeError(404, 'Published book not found');

  if (chapterId != null) {
    const chapter = await db.query(
      'SELECT id FROM chapters WHERE id = $1 AND book_id = $2',
      [chapterId, bookId]
    );
    if (!chapter.rowCount) throw makeError(404, 'Chapter not found for this book');
  }

  // If seconds was provided, safely update current active reading_session duration bounded by elapsed wall time
  if (seconds && Number(seconds) > 0) {
    const safeSec = Math.max(0, Math.floor(Number(seconds)));
    await db.query(
      `UPDATE reading_sessions
          SET duration_seconds = LEAST(
            GREATEST(duration_seconds, $1),
            FLOOR(EXTRACT(EPOCH FROM (NOW() - started_at)) + 30)::int
          ),
          ended_at = NOW()
        WHERE user_id = $2 AND book_id = $3 AND status = 'active'`,
      [safeSec, userId, bookId]
    ).catch(() => {});
  }

  const { rows } = await db.query(
    `INSERT INTO reading_progress (
       user_id, book_id, chapter_id, scroll_percent, format, position, total_units, is_completed, completed_at, bookmarks, total_reading_seconds, updated_at
     )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8,
       CASE WHEN $8 = TRUE THEN NOW() ELSE NULL END,
       COALESCE($9::jsonb, '[]'::jsonb),
       COALESCE((SELECT SUM(duration_seconds)::int FROM reading_sessions WHERE user_id = $1 AND book_id = $2), 0),
       NOW()
     )
     ON CONFLICT (user_id, book_id) DO UPDATE
       SET chapter_id = COALESCE(EXCLUDED.chapter_id, reading_progress.chapter_id),
           scroll_percent = COALESCE(EXCLUDED.scroll_percent, reading_progress.scroll_percent),
           format = COALESCE(EXCLUDED.format, reading_progress.format),
           position = COALESCE(EXCLUDED.position, reading_progress.position),
           total_units = COALESCE(EXCLUDED.total_units, reading_progress.total_units),
           is_completed = CASE WHEN EXCLUDED.is_completed THEN TRUE ELSE reading_progress.is_completed END,
           completed_at = CASE WHEN EXCLUDED.is_completed AND reading_progress.completed_at IS NULL THEN NOW() ELSE reading_progress.completed_at END,
           bookmarks = CASE WHEN EXCLUDED.bookmarks IS NOT NULL AND jsonb_array_length(EXCLUDED.bookmarks) > 0 THEN EXCLUDED.bookmarks ELSE reading_progress.bookmarks END,
           total_reading_seconds = COALESCE((SELECT SUM(duration_seconds)::int FROM reading_sessions WHERE user_id = $1 AND book_id = $2), reading_progress.total_reading_seconds),
           updated_at = NOW()
     RETURNING *`,
    [
      userId,
      bookId,
      chapterId ?? null,
      scrollPercent ?? 0,
      format ?? null,
      position ?? null,
      totalUnits ?? null,
      Boolean(isCompleted),
      bookmarks ? JSON.stringify(bookmarks) : null,
    ]
  );

  const p = rows[0];
  return {
    chapterId: p.chapter_id,
    scrollPercent: Number(p.scroll_percent || 0),
    format: p.format,
    position: p.position,
    totalUnits: p.total_units ? Number(p.total_units) : null,
    totalReadingSeconds: p.total_reading_seconds ? Number(p.total_reading_seconds) : 0,
    isCompleted: p.is_completed,
    completedAt: p.completed_at,
    bookmarks: Array.isArray(p.bookmarks) ? p.bookmarks : [],
    updatedAt: p.updated_at,
  };
};

const getProgress = async (userId, bookId) => {
  const { rows } = await db.query(
    `SELECT chapter_id, scroll_percent, format, position, total_units, is_completed, completed_at, bookmarks,
            COALESCE(total_reading_seconds, (SELECT SUM(duration_seconds)::int FROM reading_sessions WHERE user_id = $1 AND book_id = $2), 0)::int AS total_reading_seconds,
            updated_at
       FROM reading_progress
      WHERE user_id = $1 AND book_id = $2`,
    [userId, bookId]
  );
  if (!rows[0]) {
    const { rows: sessRows } = await db.query(
      `SELECT COALESCE(SUM(duration_seconds), 0)::int AS total_reading_seconds
         FROM reading_sessions
        WHERE user_id = $1 AND book_id = $2`,
      [userId, bookId]
    );
    const totalSec = sessRows[0]?.total_reading_seconds || 0;
    return {
      chapterId: null,
      scrollPercent: 0,
      format: null,
      position: null,
      totalUnits: null,
      totalReadingSeconds: totalSec,
      isCompleted: false,
      completedAt: null,
      bookmarks: [],
      updatedAt: null,
    };
  }
  const p = rows[0];
  return {
    chapterId: p.chapter_id,
    scrollPercent: Number(p.scroll_percent || 0),
    format: p.format,
    position: p.position,
    totalUnits: p.total_units ? Number(p.total_units) : null,
    totalReadingSeconds: p.total_reading_seconds ? Number(p.total_reading_seconds) : 0,
    isCompleted: p.is_completed,
    completedAt: p.completed_at,
    bookmarks: Array.isArray(p.bookmarks) ? p.bookmarks : [],
    updatedAt: p.updated_at,
  };
};

module.exports = {
  start,
  transition,
  heartbeat,
  finish,
  history,
  saveProgress,
  getProgress,
};
