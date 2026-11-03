const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const pdfParse = require('pdf-parse');
const mime = require('mime-types');

const db = require('../config/db');
const svc = require('../services/book.service');

// Upload a book file (PDF, DOC, etc.)
exports.uploadBook = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No file uploaded');
      error.status = 400;
      throw error;
    }

    const { title, author, description, category, language, cover_url } = req.body;

    if (!title || !author) {
      const error = new Error('Title and author are required');
      error.status = 400;
      throw error;
    }

    // Extract text from PDF for content
    let content = '';
    let chapters = [];

    if (req.file.mimetype === 'application/pdf') {
      try {
        const dataBuffer = await fsPromises.readFile(req.file.path);
        const data = await pdfParse(dataBuffer);
        content = data.text;
        console.log(`PDF parsed successfully. Total pages: ${data.numpages}, Text length: ${content.length}`);

        const chapterPattern = /(?:^|\n)\s*(?:Chapter|CHAPTER)\s+\d+[:\s]/g;
        const chapterMatches = content.split(chapterPattern);

        if (chapterMatches.length > 1) {
          chapters = chapterMatches.slice(1).map((chapterText, index) => ({
            number: index + 1,
            title: `Chapter ${index + 1}`,
            content: chapterText.trim().substring(0, 50000),
            word_count: chapterText.trim().split(/\s+/).length,
          }));
          console.log(`Extracted ${chapters.length} chapters from PDF`);
        } else {
          chapters = [{
            number: 1,
            title: 'Full Content',
            content: content.substring(0, 50000),
            word_count: content.split(/\s+/).length,
          }];
          console.log('No chapter markers found, created single chapter');
        }
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError.message);
      }
    }

    const detectedMime =
      mime.lookup(req.file.originalname) || req.file.mimetype || 'application/octet-stream';

    // Store relative path for cross-environment portability
    const relativeFilePath = path.join('uploads', req.file.filename).replace(/\\/g, '/');
    const finalCategory = category && category.trim() ? category.trim() : 'Digital Library';

    // Create book record stored into Book Library
    const book = await svc.createBook({
      title,
      author,
      description: description || 'Uploaded material',
      language: language || 'English',
      file_url: relativeFilePath,
      file_type: detectedMime,
      file_size: req.file.size,
      total_chapters: chapters.length,
      created_by: req.user.sub,
      cover_url: cover_url || null,
      categories: [finalCategory],
    });

    // Add chapters if extracted
    if (chapters.length > 0) {
      for (const chapter of chapters) {
        await svc.addChapter(book.id, chapter);
      }
    }

    res.status(201).json({
      book,
      message: 'Material successfully stored in Book Library',
      chapters_extracted: chapters.length,
      has_file: true,
    });
  } catch (e) {
    console.error('Error uploading book:', e);
    if (req.file) {
      fsPromises.unlink(req.file.path).catch(() => {});
    }
    next(e);
  }
};

// List all books for Admin (both published and unpublished)
exports.getAllBooks = async (req, res, next) => {
  try {
    const { search, status, format, category } = req.query;
    const params = [];
    const where = ['1=1'];

    if (search) {
      params.push(`%${search}%`);
      where.push(`(b.title ILIKE $${params.length} OR b.author ILIKE $${params.length} OR b.description ILIKE $${params.length})`);
    }

    if (status === 'published') {
      where.push('b.is_published = TRUE');
    } else if (status === 'unpublished') {
      where.push('b.is_published = FALSE');
    }

    if (category) {
      params.push(`%${category}%`);
      where.push(`EXISTS (
        SELECT 1 FROM book_categories bc JOIN categories c ON c.id = bc.category_id
        WHERE bc.book_id = b.id AND c.name ILIKE $${params.length}
      )`);
    }

    if (format && format !== 'all') {
      if (format === 'pdf') {
        where.push(`(b.file_type ILIKE '%pdf%' OR b.file_url ILIKE '%.pdf')`);
      } else if (format === 'docx' || format === 'doc') {
        where.push(`(b.file_type ILIKE '%word%' OR b.file_url ILIKE '%.docx' OR b.file_url ILIKE '%.doc')`);
      } else if (format === 'image') {
        where.push(`(b.file_type ILIKE '%image%' OR b.file_type ILIKE '%jpeg%' OR b.file_type ILIKE '%png%' OR b.file_url ILIKE '%.jpg%' OR b.file_url ILIKE '%.png%')`);
      } else if (format === 'epub') {
        where.push(`(b.file_type ILIKE '%epub%' OR b.file_url ILIKE '%.epub')`);
      } else if (format === 'chapter') {
        where.push(`(b.file_url IS NULL OR b.file_url = '')`);
      }
    }

    const sql = `
      SELECT
        b.id,
        b.title,
        b.author,
        b.cover_url,
        b.description,
        b.language,
        b.total_chapters,
        b.file_url,
        b.file_type,
        b.file_size,
        b.is_published,
        b.created_at,
        b.updated_at,
        COALESCE(
          (SELECT JSON_AGG(c.name) FROM book_categories bc JOIN categories c ON c.id = bc.category_id WHERE bc.book_id = b.id),
          '[]'::json
        ) AS categories,
        COALESCE((SELECT COUNT(*)::int FROM reading_sessions s WHERE s.book_id = b.id), 0) AS total_reads,
        COALESCE((SELECT SUM(s.duration_seconds)::int FROM reading_sessions s WHERE s.book_id = b.id), 0) AS total_seconds_read
      FROM books b
      WHERE ${where.join(' AND ')}
      ORDER BY b.id DESC
    `;

    const { rows } = await db.query(sql, params);
    res.json({
      items: rows,
      total: rows.length,
    });
  } catch (e) {
    next(e);
  }
};

// Toggle publish status
exports.togglePublish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;

    let targetStatus;
    if (typeof is_published === 'boolean') {
      targetStatus = is_published;
    } else {
      const current = await db.query('SELECT is_published FROM books WHERE id = $1', [id]);
      if (!current.rowCount) {
        const error = new Error('Book not found');
        error.status = 404;
        throw error;
      }
      targetStatus = !current.rows[0].is_published;
    }

    const { rows } = await db.query(
      'UPDATE books SET is_published = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [targetStatus, id]
    );

    res.json({
      book: rows[0],
      message: `Book is now ${targetStatus ? 'Published' : 'Unpublished'}`,
    });
  } catch (e) {
    next(e);
  }
};

// Update book details
exports.updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, author, description, category, language, cover_url, is_published } = req.body;

    const allowed = ['title', 'author', 'description', 'language', 'cover_url', 'is_published'];
    const sets = [];
    const vals = [];

    const updates = { title, author, description, language, cover_url, is_published };
    for (const [k, v] of Object.entries(updates)) {
      if (allowed.includes(k) && v !== undefined) {
        vals.push(v);
        sets.push(`${k} = $${vals.length}`);
      }
    }

    if (sets.length > 0) {
      vals.push(id);
      await db.query(
        `UPDATE books SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${vals.length}`,
        vals
      );
    }

    // Update category if provided
    if (category && category.trim()) {
      await db.query('DELETE FROM book_categories WHERE book_id = $1', [id]);
      await svc.createBook; // trigger category creation
      const cleanName = category.trim();
      const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const catRes = await db.query(
        `INSERT INTO categories (name, slug)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [cleanName, slug]
      );
      await db.query(
        `INSERT INTO book_categories (book_id, category_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [id, catRes.rows[0].id]
      );
    }

    const updated = await db.query(
      `SELECT b.*,
         COALESCE((SELECT JSON_AGG(c.name) FROM book_categories bc JOIN categories c ON c.id = bc.category_id WHERE bc.book_id = b.id), '[]'::json) AS categories
       FROM books b WHERE b.id = $1`,
      [id]
    );

    res.json({
      book: updated.rows[0],
      message: 'Book updated successfully',
    });
  } catch (e) {
    next(e);
  }
};

// Delete a book and its physical file
exports.deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM books WHERE id = $1', [id]);
    if (!rows.length) {
      const error = new Error('Book not found');
      error.status = 404;
      throw error;
    }

    const book = rows[0];

    // Delete associated physical file if exists
    if (book.file_url && !book.file_url.startsWith('http')) {
      const candidates = [
        path.resolve(__dirname, '../../', book.file_url),
        path.resolve(__dirname, '../../uploads', path.basename(book.file_url)),
      ];
      for (const p of candidates) {
        try {
          if (fs.existsSync(p)) {
            await fsPromises.unlink(p);
          }
        } catch {
          /* ignore */
        }
      }
    }

    // Cascade delete in DB
    await db.query('DELETE FROM reading_progress WHERE book_id = $1', [id]);
    await db.query('DELETE FROM reading_sessions WHERE book_id = $1', [id]);
    await db.query('DELETE FROM book_categories WHERE book_id = $1', [id]);
    await db.query('DELETE FROM chapters WHERE book_id = $1', [id]);
    await db.query('DELETE FROM books WHERE id = $1', [id]);

    res.json({ message: `Book "${book.title}" was successfully deleted` });
  } catch (e) {
    next(e);
  }
};

// List all users with reading stats
exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const params = [];
    const where = ['1=1'];

    if (search) {
      params.push(`%${search}%`);
      where.push(`(u.username ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.display_name ILIKE $${params.length})`);
    }

    if (role && role !== 'all') {
      params.push(role);
      where.push(`u.role = $${params.length}`);
    }

    const sql = `
      SELECT
        u.id,
        u.username,
        u.email,
        u.display_name,
        u.role,
        u.created_at,
        COALESCE((
          SELECT SUM(duration_seconds)::int
          FROM reading_sessions s
          WHERE s.user_id = u.id AND s.duration_seconds > 0
        ), 0) AS total_reading_seconds,
        COALESCE((
          SELECT COUNT(*)::int
          FROM reading_sessions s
          WHERE s.user_id = u.id
        ), 0) AS total_sessions,
        COALESCE((
          SELECT COUNT(DISTINCT book_id)::int
          FROM reading_progress rp
          WHERE rp.user_id = u.id
        ), 0) AS books_read,
        COALESCE((
          SELECT MAX(started_at)
          FROM reading_sessions s
          WHERE s.user_id = u.id
        ), u.created_at) AS last_active_at
      FROM users u
      WHERE ${where.join(' AND ')}
      ORDER BY u.id ASC
    `;

    const { rows } = await db.query(sql, params);
    res.json({
      users: rows.map((u) => ({
        ...u,
        total_reading_minutes: Math.round(u.total_reading_seconds / 60),
        total_reading_hours: (u.total_reading_seconds / 3600).toFixed(1),
      })),
      total: rows.length,
    });
  } catch (e) {
    next(e);
  }
};

// Update user role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'reader', 'visitor', 'competition_reviewer'].includes(role)) {
      const error = new Error('Invalid role specified');
      error.status = 400;
      throw error;
    }

    // Protect against self demotion of the last admin
    if (Number(id) === req.user.sub && role !== 'admin') {
      const error = new Error('You cannot remove admin privileges from your own account');
      error.status = 400;
      throw error;
    }

    const { rows } = await db.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, email, role',
      [role, id]
    );

    if (!rows.length) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    res.json({
      user: rows[0],
      message: `User role updated to ${role}`,
    });
  } catch (e) {
    next(e);
  }
};

// Delete user account
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.sub) {
      const error = new Error('You cannot delete your own account');
      error.status = 400;
      throw error;
    }

    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (e) {
    next(e);
  }
};

// Platform Analytics & System Overview
exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const userCount = await db.query('SELECT COUNT(*)::int AS count FROM users');
    const bookStats = await db.query(`
      SELECT
        COUNT(*)::int AS total_books,
        COUNT(*) FILTER (WHERE is_published = TRUE)::int AS published_books,
        COUNT(*) FILTER (WHERE is_published = FALSE)::int AS unpublished_books
      FROM books
    `);

    const sessionStats = await db.query(`
      SELECT
        COALESCE(SUM(duration_seconds), 0)::int AS total_reading_seconds,
        COUNT(*)::int AS total_sessions,
        COUNT(*) FILTER (WHERE status = 'finished')::int AS finished_sessions,
        COALESCE(SUM(CASE WHEN started_at >= CURRENT_DATE THEN duration_seconds ELSE 0 END), 0)::int AS today_seconds,
        COALESCE(SUM(CASE WHEN started_at >= DATE_TRUNC('week', NOW()) THEN duration_seconds ELSE 0 END), 0)::int AS this_week_seconds,
        COALESCE(SUM(CASE WHEN started_at >= DATE_TRUNC('month', NOW()) THEN duration_seconds ELSE 0 END), 0)::int AS this_month_seconds
      FROM reading_sessions
      WHERE duration_seconds > 0 OR status = 'finished'
    `);

    // Top read books
    const topBooks = await db.query(`
      SELECT
        b.id,
        b.title,
        b.author,
        b.cover_url,
        b.file_type,
        COUNT(s.id)::int AS sessions_count,
        COALESCE(SUM(s.duration_seconds), 0)::int AS total_seconds
      FROM books b
      LEFT JOIN reading_sessions s ON s.book_id = b.id
      GROUP BY b.id
      ORDER BY total_seconds DESC, sessions_count DESC
      LIMIT 6
    `);

    const s = sessionStats.rows[0];
    res.json({
      users: {
        total: userCount.rows[0].count,
      },
      books: bookStats.rows[0],
      sessions: {
        total_sessions: s.total_sessions,
        finished_sessions: s.finished_sessions,
        total_reading_seconds: s.total_reading_seconds,
        total_reading_minutes: Math.round(s.total_reading_seconds / 60),
        total_reading_hours: (s.total_reading_seconds / 3600).toFixed(1),
        today_minutes: Math.round(s.today_seconds / 60),
        this_week_minutes: Math.round(s.this_week_seconds / 60),
        this_month_minutes: Math.round(s.this_month_seconds / 60),
      },
      topBooks: topBooks.rows.map((b) => ({
        ...b,
        total_minutes: Math.round(b.total_seconds / 60),
      })),
    });
  } catch (e) {
    next(e);
  }
};

// Serve book file for reading
exports.serveBookFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM books WHERE id = $1', [id]);

    if (!rows.length || !rows[0].file_url) {
      const error = new Error('No file available for this book');
      error.status = 404;
      throw error;
    }

    const book = rows[0];
    const fileField = book.file_url;

    // Check if it's an external URL
    if (fileField.startsWith('http://') || fileField.startsWith('https://')) {
      return res.redirect(fileField);
    }

    // Try multiple possible paths to guarantee file is located
    const candidates = [
      path.resolve(fileField),
      path.resolve(__dirname, '../../', fileField),
      path.resolve(__dirname, '../../uploads', path.basename(fileField)),
      path.resolve('uploads', path.basename(fileField)),
    ];

    let foundPath = null;
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        foundPath = c;
        break;
      }
    }

    if (!foundPath) {
      console.error(`File not found for book ${id}. Checked paths:`, candidates);
      const error = new Error('Book file not found on server storage');
      error.status = 404;
      throw error;
    }

    const fileExt = path.extname(foundPath).toLowerCase();
    const mimeType = mime.lookup(foundPath) || book.file_type || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(book.title)}${fileExt}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    res.sendFile(foundPath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error streaming file' });
        }
      }
    });
  } catch (e) {
    next(e);
  }
};
