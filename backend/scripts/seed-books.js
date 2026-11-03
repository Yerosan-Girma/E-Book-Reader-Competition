const fs = require('node:fs/promises');
const path = require('node:path');
require('dotenv').config();

const { Client } = require('pg');

const classicBooks = [
  {
    title: "Doctrine Martin Luther on Baptist",
    author: "Luther",
    category: "Spiritual",
    language: "English",
    description: "A comprehensive exploration of Martin Luther's theological perspectives on baptism and its significance in Christian faith.",
    chapters: [
      { number: 1, title: "Chapter 1", content: "The doctrine of baptism is one of the most fundamental teachings of the Christian faith. It represents the washing away of sins and the beginning of a new life in Christ. Through baptism, we are united with Christ in his death and resurrection." },
      { number: 2, title: "Chapter 2", content: "Martin Luther emphasized that baptism is not merely a symbol but a means of grace through which God delivers forgiveness and the Holy Spirit. It is a sacrament that connects us to the promise of salvation." },
      { number: 3, title: "Chapter 3", content: "The practice of infant baptism has been a topic of theological discussion for centuries. Luther defended it as consistent with the covenantal nature of God's relationship with His people, extending grace to children of believers." }
    ]
  },
  {
    title: "How to Invest Money",
    author: "George Henry",
    category: "Psychology",
    language: "English",
    description: "A practical guide to understanding the psychology of investment and making sound financial decisions.",
    chapters: [
      { number: 1, title: "Chapter 1", content: "Investing is not just about numbers and markets; it is deeply rooted in human psychology. Understanding our behavioral biases is the first step toward making better investment decisions. Fear and greed often drive investors to make irrational choices." },
      { number: 2, title: "Chapter 2", content: "The psychology of risk management is crucial for long-term success. Investors must learn to assess their risk tolerance honestly and avoid the common trap of chasing hot tips or following the crowd without proper analysis." },
      { number: 3, title: "Chapter 3", content: "Patience and discipline are the hallmarks of successful investors. The ability to stay the course during market volatility and avoid emotional decision-making separates successful investors from those who struggle to achieve their financial goals." }
    ]
  },
  {
    title: "SRC Students Academic Managements",
    author: "Yerosan Girma",
    category: "Education",
    language: "English",
    description: "A comprehensive guide for students on effective academic management and study strategies.",
    chapters: [
      { number: 1, title: "Chapter 1", content: "Effective academic management begins with proper planning and organization. Students who develop strong organizational skills are better equipped to handle the demands of their coursework and extracurricular activities." },
      { number: 2, title: "Chapter 2", content: "Time management is one of the most critical skills for academic success. Learning to prioritize tasks, avoid procrastination, and maintain a healthy work-life balance can significantly improve academic performance." },
      { number: 3, title: "Chapter 3", content: "Active learning strategies such as note-taking, summarizing, and self-testing can enhance retention and understanding. Students should develop study techniques that work best for their individual learning styles." }
    ]
  }
];

async function seedBooks() {
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

    await client.query('BEGIN');

    // Get or create categories
    const categories = {};
    const uniqueCategories = [...new Set(classicBooks.map(b => b.category))];

    for (const catName of uniqueCategories) {
      const slug = catName.toLowerCase().replace(/\s+/g, '-');
      let result = await client.query(
        'SELECT id FROM categories WHERE slug = $1',
        [slug]
      );

      if (result.rows.length === 0) {
        result = await client.query(
          'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id',
          [catName, slug]
        );
        console.log(`Created category: ${catName}`);
      }

      categories[catName] = result.rows[0].id;
    }

    // Insert books and chapters
    for (const book of classicBooks) {
      // Check if book already exists
      const existing = await client.query(
        'SELECT id FROM books WHERE title = $1 AND author = $2',
        [book.title, book.author]
      );

      let bookId;
      if (existing.rows.length > 0) {
        bookId = existing.rows[0].id;
        console.log(`Book already exists: ${book.title} (ID: ${bookId})`);

        // Check if chapters exist
        const existingChapters = await client.query(
          'SELECT COUNT(*) as count FROM chapters WHERE book_id = $1',
          [bookId]
        );

        if (existingChapters.rows[0].count === 0) {
          // Add chapters to existing book
          for (const chapter of book.chapters) {
            const wordCount = chapter.content.split(/\s+/).length;
            await client.query(
              `INSERT INTO chapters (book_id, chapter_number, title, content, word_count)
               VALUES ($1, $2, $3, $4, $5)`,
              [bookId, chapter.number, chapter.title, chapter.content, wordCount]
            );
          }
          console.log(`  Added ${book.chapters.length} chapters to existing book`);
        } else {
          console.log(`  Book already has ${existingChapters.rows[0].count} chapters, skipping`);
        }
        continue;
      }

      // Insert book
      const bookResult = await client.query(
        `INSERT INTO books (title, author, description, language, total_chapters, is_published)
         VALUES ($1, $2, $3, $4, $5, TRUE)
         RETURNING id`,
        [book.title, book.author, book.description, book.language, book.chapters.length]
      );

      bookId = bookResult.rows[0].id;
      console.log(`Created book: ${book.title} (ID: ${bookId})`);

      // Link to category
      const categoryId = categories[book.category];
      if (categoryId) {
        await client.query(
          'INSERT INTO book_categories (book_id, category_id) VALUES ($1, $2)',
          [bookId, categoryId]
        );
      }

      // Insert chapters
      for (const chapter of book.chapters) {
        const wordCount = chapter.content.split(/\s+/).length;
        await client.query(
          `INSERT INTO chapters (book_id, chapter_number, title, content, word_count)
           VALUES ($1, $2, $3, $4, $5)`,
          [bookId, chapter.number, chapter.title, chapter.content, wordCount]
        );
      }

      console.log(`  Added ${book.chapters.length} chapters`);
    }

    await client.query('COMMIT');
    console.log('\n✅ Successfully seeded classic books to database');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Error seeding books:', error.message);
    throw error;
  } finally {
    await client.end().catch(() => {});
  }
}

seedBooks().catch((error) => {
  console.error('Seed script failed:', error.message);
  process.exitCode = 1;
});
