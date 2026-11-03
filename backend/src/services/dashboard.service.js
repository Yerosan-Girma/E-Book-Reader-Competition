const db = require('../config/db');

const DAY_MS = 86_400_000;

function computeStreak(daysDesc) {
  if (!daysDesc || !daysDesc.length) return 0;
  const toDate = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const today = toDate(new Date());
  let cursor = today;
  let streak = 0;
  for (const dStr of daysDesc) {
    const d = toDate(dStr);
    const diff = Math.round((cursor - d) / DAY_MS);
    if (diff === 0 || diff === 1) {
      streak++;
      cursor = new Date(d.getTime() - DAY_MS);
    } else {
      break;
    }
  }
  return streak;
}

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

exports.getDashboard = async (userId) => {
  // 1. All-time Totals (sum of all recorded reading seconds for this user)
  const totalsRes = await db.query(
    `SELECT
       COALESCE(SUM(duration_seconds), 0)::int                   AS total_seconds,
       COUNT(DISTINCT book_id)::int                              AS books_touched,
       COUNT(*)::int                                             AS total_sessions,
       COUNT(*) FILTER (WHERE status = 'finished')::int          AS sessions_finished
     FROM reading_sessions
     WHERE user_id = $1 AND duration_seconds > 0`,
    [userId]
  );
  const totals = totalsRes.rows[0] || {
    total_seconds: 0,
    books_touched: 0,
    total_sessions: 0,
    sessions_finished: 0,
  };

  // 1b. Books completed from reading_progress
  const completedRes = await db.query(
    `SELECT COUNT(*)::int AS count FROM reading_progress WHERE user_id = $1 AND is_completed = TRUE`,
    [userId]
  );
  const booksCompleted = completedRes.rows[0]?.count || 0;

  // 2. Daily Reading Time (Today vs Yesterday)
  // Check both timezone-based CURRENT_DATE and 24-hour interval to ensure no readings are missed
  const dailyRes = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN DATE(started_at) = CURRENT_DATE OR started_at >= (NOW() - INTERVAL '24 hours') THEN duration_seconds ELSE 0 END), 0)::int AS today_seconds,
       COALESCE(SUM(CASE WHEN started_at >= (NOW() - INTERVAL '48 hours') AND started_at < (NOW() - INTERVAL '24 hours') THEN duration_seconds ELSE 0 END), 0)::int AS yesterday_seconds
     FROM reading_sessions
     WHERE user_id = $1 AND duration_seconds > 0`,
    [userId]
  );
  const todaySeconds = dailyRes.rows[0]?.today_seconds || 0;
  const yesterdaySeconds = dailyRes.rows[0]?.yesterday_seconds || 0;

  // 3. Weekly Activity: Last 7 Days (Past 7 calendar days breakdown)
  const weeklyRes = await db.query(
    `WITH past_days AS (
       SELECT (CURRENT_DATE - (i || ' day')::interval)::date AS day
       FROM generate_series(0, 6) AS i
     )
     SELECT
       to_char(pd.day, 'Dy') AS label,
       to_char(pd.day, 'Mon DD') AS date_label,
       pd.day,
       COALESCE(SUM(s.duration_seconds), 0)::int AS seconds
     FROM past_days pd
     LEFT JOIN reading_sessions s
       ON s.user_id = $1
      AND s.duration_seconds > 0
      AND DATE(s.started_at) = pd.day
     GROUP BY pd.day
     ORDER BY pd.day ASC`,
    [userId]
  );

  const thisWeekTotalSeconds = weeklyRes.rows.reduce((acc, r) => acc + (r.seconds || 0), 0);

  // Prior 7 days for comparison
  const lastWeekRes = await db.query(
    `SELECT COALESCE(SUM(duration_seconds), 0)::int AS seconds
     FROM reading_sessions
     WHERE user_id = $1
       AND duration_seconds > 0
       AND started_at >= CURRENT_DATE - INTERVAL '14 days'
       AND started_at < CURRENT_DATE - INTERVAL '7 days'`,
    [userId]
  );
  const lastWeekTotalSeconds = lastWeekRes.rows[0]?.seconds || 0;

  // 4. Monthly Activity: Current Month by Week + Last Month
  const monthlyRes = await db.query(
    `SELECT
       to_char(DATE_TRUNC('week', started_at), 'DD Mon') AS label,
       COALESCE(SUM(duration_seconds), 0)::int           AS seconds
     FROM reading_sessions
     WHERE user_id = $1
       AND duration_seconds > 0
       AND started_at >= NOW() - INTERVAL '30 days'
     GROUP BY DATE_TRUNC('week', started_at)
     ORDER BY DATE_TRUNC('week', started_at) ASC`,
    [userId]
  );

  const thisMonthRes = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN started_at >= DATE_TRUNC('month', NOW()) OR started_at >= (NOW() - INTERVAL '30 days') THEN duration_seconds ELSE 0 END), 0)::int AS this_month_seconds,
       COALESCE(SUM(CASE WHEN started_at >= (NOW() - INTERVAL '60 days') AND started_at < (NOW() - INTERVAL '30 days') THEN duration_seconds ELSE 0 END), 0)::int AS last_month_seconds
     FROM reading_sessions
     WHERE user_id = $1 AND duration_seconds > 0`,
    [userId]
  );
  const thisMonthSeconds = thisMonthRes.rows[0]?.this_month_seconds || 0;
  const lastMonthSeconds = thisMonthRes.rows[0]?.last_month_seconds || 0;

  // 5. Continue Reading Books (Active in-progress books with progress & position)
  const continueRes = await db.query(
    `SELECT
       rp.book_id,
       rp.chapter_id,
       rp.scroll_percent,
       rp.format,
       rp.position,
       rp.total_units,
       rp.is_completed,
       rp.updated_at AS last_read_at,
       b.title,
       b.author,
       b.cover_url,
       b.description,
       b.file_type,
       b.file_url,
       COALESCE(
         (SELECT c.name FROM book_categories bc JOIN categories c ON c.id = bc.category_id WHERE bc.book_id = b.id LIMIT 1),
         'Digital Library'
       ) AS category,
       COALESCE(ch.title, 'Chapter ' || ch.chapter_number) AS chapter_title,
       COALESCE(
         rp.total_reading_seconds,
         (SELECT SUM(s.duration_seconds)::int FROM reading_sessions s WHERE s.user_id = $1 AND s.book_id = rp.book_id),
         0
       )::int AS total_seconds_spent
     FROM reading_progress rp
     JOIN books b ON b.id = rp.book_id
     LEFT JOIN chapters ch ON ch.id = rp.chapter_id
     WHERE rp.user_id = $1
     ORDER BY rp.updated_at DESC
     LIMIT 10`,
    [userId]
  );

  // 6. Recent Reading History (Sessions list with book details)
  const historyRes = await db.query(
    `SELECT
       s.id,
       s.book_id,
       s.chapter_id,
       s.format,
       s.started_at,
       s.ended_at,
       s.duration_seconds,
       s.status,
       b.title,
       b.author,
       b.cover_url
     FROM reading_sessions s
     JOIN books b ON b.id = s.book_id
     WHERE s.user_id = $1 AND s.duration_seconds > 0
     ORDER BY s.started_at DESC
     LIMIT 15`,
    [userId]
  );

  // 7. Streak calculation from active reading days
  const daysRes = await db.query(
    `SELECT DISTINCT DATE(started_at) AS day
     FROM reading_sessions
     WHERE user_id = $1 AND duration_seconds >= 10
     ORDER BY day DESC
     LIMIT 60`,
    [userId]
  );

  // 8. Currently active or paused session
  const activeRes = await db.query(
    `SELECT s.id, s.book_id, s.chapter_id, s.started_at, s.status, s.duration_seconds,
            b.title AS book_title, b.author AS book_author, b.cover_url AS book_cover
     FROM reading_sessions s
     JOIN books b ON b.id = s.book_id
     WHERE s.user_id = $1 AND s.status IN ('active', 'paused')
     ORDER BY s.started_at DESC LIMIT 1`,
    [userId]
  );

  return {
    totals: {
      ...totals,
      books_completed: booksCompleted,
      total_hours: (totals.total_seconds / 3600).toFixed(1),
      total_minutes: Math.round(totals.total_seconds / 60),
      total_formatted: formatDuration(totals.total_seconds),
    },
    daily: {
      today_seconds: todaySeconds,
      today_minutes: Math.round(todaySeconds / 60),
      today_formatted: formatDuration(todaySeconds),
      yesterday_seconds: yesterdaySeconds,
      yesterday_minutes: Math.round(yesterdaySeconds / 60),
      yesterday_formatted: formatDuration(yesterdaySeconds),
      daily_goal_minutes: 20,
    },
    weekly: {
      this_week_seconds: thisWeekTotalSeconds,
      this_week_minutes: Math.round(thisWeekTotalSeconds / 60),
      this_week_formatted: formatDuration(thisWeekTotalSeconds),
      last_week_seconds: lastWeekTotalSeconds,
      last_week_minutes: Math.round(lastWeekTotalSeconds / 60),
      last_week_formatted: formatDuration(lastWeekTotalSeconds),
      breakdown: weeklyRes.rows.map((r) => ({
        ...r,
        minutes: Math.round((r.seconds || 0) / 60),
        formatted: formatDuration(r.seconds),
      })),
    },
    monthly: {
      this_month_seconds: thisMonthSeconds,
      this_month_minutes: Math.round(thisMonthSeconds / 60),
      this_month_formatted: formatDuration(thisMonthSeconds),
      last_month_seconds: lastMonthSeconds,
      last_month_minutes: Math.round(lastMonthSeconds / 60),
      last_month_formatted: formatDuration(lastMonthSeconds),
      breakdown: monthlyRes.rows.map((r) => ({
        ...r,
        minutes: Math.round((r.seconds || 0) / 60),
        formatted: formatDuration(r.seconds),
      })),
    },
    continueReading: continueRes.rows.map((r) => ({
      bookId: r.book_id,
      title: r.title,
      author: r.author,
      coverUrl: r.cover_url,
      description: r.description,
      category: r.category,
      format: r.format || 'chapter',
      scrollPercent: Number(r.scroll_percent || 0),
      position: r.position,
      chapterId: r.chapter_id,
      chapterTitle: r.chapter_title,
      isCompleted: r.is_completed,
      lastReadAt: r.last_read_at,
      totalSecondsSpent: r.total_seconds_spent,
      totalMinutesSpent: Math.round((r.total_seconds_spent || 0) / 60),
      timeFormatted: formatDuration(r.total_seconds_spent),
    })),
    recentHistory: historyRes.rows.map((r) => ({
      id: r.id,
      bookId: r.book_id,
      title: r.title,
      author: r.author,
      coverUrl: r.cover_url,
      format: r.format,
      startedAt: r.started_at,
      endedAt: r.ended_at,
      durationSeconds: r.duration_seconds,
      durationMinutes: Math.max(1, Math.round(r.duration_seconds / 60)),
      timeFormatted: formatDuration(r.duration_seconds),
      status: r.status,
    })),
    streak: computeStreak(daysRes.rows.map((r) => r.day)),
    activeSession: activeRes.rows[0] || null,
  };
};
