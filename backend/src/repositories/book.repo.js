const db = require('../config/db');

const buildFilters = ({ search, categoryId, category, language, format } = {}) => {
  const params = [];
  const where = ['b.is_published = TRUE'];

  if (search) {
    params.push(`%${search}%`);
    where.push(`(b.title ILIKE $${params.length} OR b.author ILIKE $${params.length} OR b.description ILIKE $${params.length})`);
  }
  if (language) {
    params.push(language);
    where.push(`b.language = $${params.length}`);
  }
  if (format) {
    if (format === 'ebook') {
      where.push(`(b.file_url IS NULL OR b.file_url = '' OR b.file_type IS NULL)`);
    } else if (format === 'image') {
      params.push('%image%', '%jpg%', '%jpeg%', '%png%', '%webp%');
      const idx = params.length - 5;
      where.push(`(b.file_type ILIKE $${idx + 1} OR b.file_url ILIKE $${idx + 2} OR b.file_url ILIKE $${idx + 3} OR b.file_url ILIKE $${idx + 4} OR b.file_url ILIKE $${idx + 5})`);
    } else if (format === 'docx' || format === 'doc') {
      params.push('%word%', '%docx%', '%.docx%', '%.doc%');
      const idx = params.length - 4;
      where.push(`(b.file_type ILIKE $${idx + 1} OR b.file_type ILIKE $${idx + 2} OR b.file_url ILIKE $${idx + 3} OR b.file_url ILIKE $${idx + 4})`);
    } else {
      params.push(`%${format}%`);
      where.push(`(b.file_type ILIKE $${params.length} OR b.file_url ILIKE $${params.length})`);
    }
  }
  if (categoryId) {
    params.push(categoryId);
    where.push(`EXISTS (
      SELECT 1 FROM book_categories bc
      WHERE bc.book_id = b.id AND bc.category_id = $${params.length}
    )`);
  }
  if (category && category !== 'All') {
    params.push(`%${category}%`);
    where.push(`EXISTS (
      SELECT 1 FROM book_categories bc
      JOIN categories c ON c.id = bc.category_id
      WHERE bc.book_id = b.id AND c.name ILIKE $${params.length}
    )`);
  }

  return { params, where };
};

const list = async ({ search, categoryId, category, language, format, page, limit }) => {
  const { params, where } = buildFilters({ search, categoryId, category, language, format });

  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const sql = `
    SELECT b.id, b.title, b.author, b.cover_url, b.description, b.language, b.total_chapters,
           b.file_url, b.file_type, b.file_size, b.created_at,
           COALESCE(
             JSON_AGG(c.name) FILTER (WHERE c.id IS NOT NULL), '[]'
           ) AS categories
    FROM books b
    LEFT JOIN book_categories bc ON bc.book_id = b.id
    LEFT JOIN categories c       ON c.id = bc.category_id
    WHERE ${where.join(' AND ')}
    GROUP BY b.id
    ORDER BY b.created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  const { rows } = await db.query(sql, params);
  return rows;
};

const count = async (filters = {}) => {
  const { params, where } = buildFilters(filters);
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS n FROM books b WHERE ${where.join(' AND ')}`,
    params
  );
  return rows[0].n;
};

const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT b.*, COALESCE(JSON_AGG(c.name) FILTER (WHERE c.id IS NOT NULL), '[]') AS categories
     FROM books b
     LEFT JOIN book_categories bc ON bc.book_id = b.id
     LEFT JOIN categories c       ON c.id = bc.category_id
     WHERE b.id = $1 AND b.is_published = TRUE
     GROUP BY b.id`,
    [id]
  );
  return rows[0];
};

const chapters = async (bookId) => {
  const { rows } = await db.query(
    `SELECT c.id, c.chapter_number, c.title, c.word_count
       FROM chapters c
       JOIN books b ON b.id = c.book_id
      WHERE c.book_id = $1 AND b.is_published = TRUE
      ORDER BY c.chapter_number`,
    [bookId]
  );
  return rows;
};

const findChapter = async (bookId, chapterId) => {
  const { rows } = await db.query(
    `SELECT c.id, c.book_id, c.chapter_number, c.title, c.content, c.word_count
     FROM chapters c
     JOIN books b ON b.id = c.book_id
     WHERE c.id = $1 AND c.book_id = $2 AND b.is_published = TRUE`,
    [chapterId, bookId]
  );
  return rows[0];
};

const create = async ({ title, author, description, language, file_url, file_type, file_size, total_chapters, created_by, is_published = true, cover_url = null }) => {
  const { rows } = await db.query(
    `INSERT INTO books (title, author, description, language, file_url, file_type, file_size, total_chapters, created_by, is_published, cover_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [title, author, description, language || 'en', file_url, file_type, file_size, total_chapters || 0, created_by, is_published, cover_url]
  );
  return rows[0];
};

const addCategory = async (bookId, categoryName) => {
  if (!categoryName) return;
  const cleanName = categoryName.trim();
  if (!cleanName) return;

  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Find existing category by case-insensitive name or slug
  let catRes = await db.query(
    `SELECT id FROM categories WHERE LOWER(name) = LOWER($1) OR slug = $2 LIMIT 1`,
    [cleanName, slug]
  );

  let catId;
  if (catRes.rows.length > 0) {
    catId = catRes.rows[0].id;
  } else {
    const insertRes = await db.query(
      `INSERT INTO categories (name, slug)
       VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [cleanName, slug]
    );
    catId = insertRes.rows[0].id;
  }

  await db.query(
    `INSERT INTO book_categories (book_id, category_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [bookId, catId]
  );
};

const update = async (id, updates) => {
  const allowed = ['title', 'author', 'description', 'language', 'cover_url', 'is_published', 'file_url', 'file_type', 'file_size', 'total_chapters'];
  const sets = [];
  const vals = [];

  for (const [k, v] of Object.entries(updates)) {
    if (allowed.includes(k) && v !== undefined) {
      vals.push(v);
      sets.push(`${k} = $${vals.length}`);
    }
  }

  if (sets.length === 0) return findById(id);

  vals.push(id);
  const { rows } = await db.query(
    `UPDATE books SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${vals.length} RETURNING *`,
    vals
  );
  return rows[0];
};

const deleteBook = async (id) => {
  await db.query(`DELETE FROM books WHERE id = $1`, [id]);
};

const createChapter = async (bookId, number, title, content, word_count) => {
  const { rows } = await db.query(
    `INSERT INTO chapters (book_id, chapter_number, title, content, word_count)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (book_id, chapter_number)
     DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, word_count = EXCLUDED.word_count
     RETURNING *`,
    [bookId, number, title, content, word_count || (content ? content.split(/\s+/).length : 0)]
  );
  return rows[0];
};

module.exports = {
  list,
  count,
  findById,
  chapters,
  findChapter,
  create,
  addCategory,
  update,
  deleteBook,
  createChapter
};
