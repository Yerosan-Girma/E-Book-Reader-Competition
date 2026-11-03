require('dotenv').config();
const db = require('../src/config/db');

async function cleanAndPrepareBooks() {
  // 1. Unpublish unnecessary sample formats (RTF, TXT, EPUB)
  await db.query(`
    UPDATE books 
       SET is_published = FALSE 
     WHERE id IN (23, 25, 26)
  `);
  console.log('Unpublished clutter sample books (ids 23, 25, 26).');

  // 2. Check if Image Format book exists
  const imgCheck = await db.query(`SELECT id FROM books WHERE title = 'Visual Ethiopia & Architecture (Image Album)'`);
  if (!imgCheck.rowCount) {
    const res = await db.query(`
      INSERT INTO books (title, author, description, language, file_url, file_type, file_size, total_chapters, is_published, cover_url)
      VALUES (
        'Visual Ethiopia & Architecture (Image Album)',
        'Cultural Heritage Archive',
        'A curated visual collection of Ethiopian architectural marvels, manuscripts, landscape photography, and heritage art in high resolution image format.',
        'English',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200',
        'image/jpeg',
        2400000,
        6,
        TRUE,
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'
      )
      RETURNING id
    `);
    const newId = res.rows[0].id;
    // Add image pages as chapters
    const pages = [
      { num: 1, title: 'Plate 1: Historic Architecture & Highlands', content: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1400' },
      { num: 2, title: 'Plate 2: Ancient Manuscript & Script', content: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1400' },
      { num: 3, title: 'Plate 3: Monolithic Rock Churches', content: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1400' },
      { num: 4, title: 'Plate 4: The Great Rift Valley Landscapes', content: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1400' },
      { num: 5, title: 'Plate 5: Royal Castles of Gondar', content: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1400' },
      { num: 6, title: 'Plate 6: Traditional Art & Frescoes', content: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=1400' },
    ];
    for (const p of pages) {
      await db.query(`
        INSERT INTO chapters (book_id, chapter_number, title, content, word_count)
        VALUES ($1, $2, $3, $4, 50)
      `, [newId, p.num, p.title, p.content]);
    }
    // Add category Art & Culture
    const catRes = await db.query(`
      INSERT INTO categories (name, slug) VALUES ('Art & Culture', 'art-culture')
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id
    `);
    await db.query(`
      INSERT INTO book_categories (book_id, category_id) VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [newId, catRes.rows[0].id]);
    console.log('Created Image Format Book with ID:', newId);
  }

  const list = await db.query('SELECT id, title, author, file_type, file_url, is_published FROM books WHERE is_published = TRUE ORDER BY id DESC');
  console.log('Clean published books list:');
  console.table(list.rows);
  process.exit(0);
}

cleanAndPrepareBooks().catch(err => {
  console.error(err);
  process.exit(1);
});
