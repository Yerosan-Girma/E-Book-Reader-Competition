const repo = require('../repositories/book.repo');

const listBooks = async (q) => {
  const parsedPage = Number(q.page ?? 1);
  const parsedLimit = Number(q.limit ?? 12);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = Number.isSafeInteger(parsedLimit) && parsedLimit > 0
    ? Math.min(50, parsedLimit)
    : 12;
  const filters = {
    search: q.search || undefined,
    categoryId: q.categoryId ? Number(q.categoryId) : undefined,
    category: q.category || undefined,
    language: q.language || undefined,
    format: q.format || undefined,
  };

  const items = await repo.list({
    ...filters,
    page,
    limit,
  });
  const total = await repo.count(filters);
  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const getBook = async (id) => {
  const book = await repo.findById(id);
  if (!book) {
    const e = new Error('Book not found');
    e.status = 404;
    throw e;
  }
  return book;
};

const getChapters = async (bookId) => {
  await getBook(bookId);
  return repo.chapters(bookId);
};
const getChapter = async (bookId, chapterId) => {
  const ch = await repo.findChapter(bookId, chapterId);
  if (!ch) {
    const e = new Error('Chapter not found');
    e.status = 404;
    throw e;
  }
  return ch;
};

const createBook = async (bookData) => {
  const { title, author, description, language, file_url, file_type, file_size, total_chapters, created_by, categories, cover_url } = bookData;

  const book = await repo.create({
    title,
    author,
    description,
    language,
    file_url,
    file_type,
    file_size,
    total_chapters,
    created_by,
    is_published: true,
    cover_url
  });

  // Add categories if provided
  if (categories && categories.length > 0) {
    for (const categoryName of categories) {
      await repo.addCategory(book.id, categoryName);
    }
  }

  return book;
};

const updateBook = async (id, updates) => {
  const book = await repo.findById(id);
  if (!book) {
    const e = new Error('Book not found');
    e.status = 404;
    throw e;
  }

  const updated = await repo.update(id, updates);
  return updated;
};

const deleteBook = async (id) => {
  const book = await repo.findById(id);
  if (!book) {
    const e = new Error('Book not found');
    e.status = 404;
    throw e;
  }

  await repo.deleteBook(id);
};

const addChapter = async (bookId, chapterData) => {
  const { number, title, content, word_count } = chapterData;
  return await repo.createChapter(bookId, number, title, content, word_count);
};

module.exports = { listBooks, getBook, getChapters, getChapter, createBook, updateBook, deleteBook, addChapter };
