require('dotenv').config();
const db = require('../src/config/db');

async function seedMultiFormatBooks() {
  console.log('Seeding multi-format books into PostgreSQL...');

  // 1. Update book 21 to have PDF file attached
  await db.query(`
    UPDATE books
       SET file_url = 'uploads/book-1792614508705-770305594.pdf',
           file_type = 'application/pdf',
           file_size = 857908,
           is_published = TRUE
     WHERE id = 21
  `);

  // 2. Check/insert EPUB book
  const epubCheck = await db.query(`SELECT id FROM books WHERE title = 'The Art of Reading (EPUB)'`);
  if (!epubCheck.rowCount) {
    await db.query(`
      INSERT INTO books (title, author, description, language, file_url, file_type, file_size, total_chapters, is_published)
      VALUES (
        'The Art of Reading (EPUB)',
        'Classical Authors Collective',
        'An elegant EPUB edition complete with table of contents, pagination, and typography.',
        'English',
        'uploads/book-1792619699491-108677971.epub',
        'application/epub+zip',
        133839,
        5,
        TRUE
      )
    `);
  }

  // 3. Check/insert DOCX book
  const docxCheck = await db.query(`SELECT id FROM books WHERE title = 'Modern Digital Reading (Word DOCX)'`);
  if (!docxCheck.rowCount) {
    await db.query(`
      INSERT INTO books (title, author, description, language, file_url, file_type, file_size, total_chapters, is_published)
      VALUES (
        'Modern Digital Reading (Word DOCX)',
        'ReadRise Research Collective',
        'Word document converted in-browser using Mammoth.js with sanitized HTML typography.',
        'English',
        'uploads/sample-research.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        5200,
        1,
        TRUE
      )
    `);
  }

  // 4. Check/insert TXT book
  const txtCheck = await db.query(`SELECT id FROM books WHERE title = 'The Reader Handbook (TXT)'`);
  if (!txtCheck.rowCount) {
    await db.query(`
      INSERT INTO books (title, author, description, language, file_url, file_type, file_size, total_chapters, is_published)
      VALUES (
        'The Reader Handbook (TXT)',
        'ReadRise Editorial Team',
        'Plain text edition demonstrating custom font sizing, line-height, themes, and bookmarking.',
        'English',
        'uploads/sample-handbook.txt',
        'text/plain',
        1400,
        3,
        TRUE
      )
    `);
  }

  // 5. Check/insert RTF book
  const rtfCheck = await db.query(`SELECT id FROM books WHERE title = 'Literary Essays (RTF)'`);
  if (!rtfCheck.rowCount) {
    await db.query(`
      INSERT INTO books (title, author, description, language, file_url, file_type, file_size, total_chapters, is_published)
      VALUES (
        'Literary Essays (RTF)',
        'Philosophical Society',
        'Rich Text Format document rendered with custom formatting and search capabilities.',
        'English',
        'uploads/sample-manuscript.rtf',
        'application/rtf',
        1100,
        3,
        TRUE
      )
    `);
  }

  const { rows } = await db.query(`SELECT id, title, author, file_type, file_url FROM books WHERE is_published = TRUE ORDER BY id ASC`);
  console.log('Published books ready for reading:');
  console.table(rows);
  process.exit(0);
}

seedMultiFormatBooks().catch((err) => {
  console.error('Error seeding books:', err);
  process.exit(1);
});
