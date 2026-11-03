/**
 * Integration tests for /api/books routes
 * Tests book endpoints with real database
 */

const request = require('supertest');
const app = require('../../src/app');
const { testPool, truncateAllTables, seedTestData, closeTestDb } = require('../helpers/db');

describe('Books API Integration Tests', () => {
  let authToken;
  let testBookId;

  // Setup and teardown
  beforeAll(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await truncateAllTables();
    await seedTestData();

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
      });
    authToken = loginResponse.body.token;

    // Get test book ID
    const { rows } = await testPool.query('SELECT id FROM books LIMIT 1');
    testBookId = rows[0]?.id;
  });

  describe('GET /api/books', () => {
    it('should list all published books', async () => {
      const response = await request(app)
        .get('/api/books');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/books')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
    });

    it('should support search by title', async () => {
      const response = await request(app)
        .get('/api/books')
        .query({ search: 'Test' });

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0].title).toMatch(/test/i);
    });

    it('should support search by author', async () => {
      const response = await request(app)
        .get('/api/books')
        .query({ search: 'Test Author' });

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBeGreaterThan(0);
    });

    it('should support category filter', async () => {
      const response = await request(app)
        .get('/api/books')
        .query({ categoryId: 1 });

      expect(response.status).toBe(200);
    });

    it('should support language filter', async () => {
      const response = await request(app)
        .get('/api/books')
        .query({ language: 'en' });

      expect(response.status).toBe(200);
    });

    it('should return 400 for invalid page parameter', async () => {
      const response = await request(app)
        .get('/api/books')
        .query({ page: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid limit parameter', async () => {
      const response = await request(app)
        .get('/api/books')
        .query({ limit: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject limit greater than 50 with 400', async () => {
      const response = await request(app)
        .get('/api/books')
        .query({ limit: 100 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return empty array when no results', async () => {
      const response = await request(app)
        .get('/api/books')
        .query({ search: 'NonExistentBook123456' });

      expect(response.status).toBe(200);
      expect(response.body.items).toEqual([]);
      expect(response.body.total).toBe(0);
    });
  });

  describe('GET /api/books/:id', () => {
    it('should return book details for valid ID', async () => {
      const response = await request(app)
        .get(`/api/books/${testBookId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('author');
      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
    });

    it('should return 404 for non-existent book', async () => {
      const response = await request(app)
        .get('/api/books/999999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/books/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/books/:id/chapters', () => {
    it('should return chapters for a book', async () => {
      const response = await request(app)
        .get(`/api/books/${testBookId}/chapters`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('chapter_number');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('word_count');
    });

    it('should return 404 for non-existent book', async () => {
      const response = await request(app)
        .get('/api/books/999999/chapters');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return empty array for book with no chapters', async () => {
      // Create a book without chapters
      const { rows: [book] } = await testPool.query(
        `INSERT INTO books (title, author, description, language, total_chapters, is_published)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        ['Empty Book', 'No Author', 'No chapters', 'en', 0, true]
      );

      const response = await request(app)
        .get(`/api/books/${book.id}/chapters`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/books/:id/chapters/:chapterId', () => {
    let chapterId;

    beforeEach(async () => {
      // Get first chapter ID
      const { rows } = await testPool.query(
        'SELECT id FROM chapters WHERE book_id = $1 LIMIT 1',
        [testBookId]
      );
      chapterId = rows[0]?.id;
    });

    it('should return chapter content', async () => {
      const response = await request(app)
        .get(`/api/books/${testBookId}/chapters/${chapterId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('word_count');
    });

    it('should return 404 for non-existent chapter', async () => {
      const response = await request(app)
        .get(`/api/books/${testBookId}/chapters/999999`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for chapter not in book', async () => {
      // Get a different book
      const { rows: [book2] } = await testPool.query(
        `INSERT INTO books (title, author, description, language, total_chapters, is_published)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        ['Another Book', 'Another Author', 'Description', 'en', 1, true]
      );

      const response = await request(app)
        .get(`/api/books/${book2.id}/chapters/${chapterId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/books/:id/file', () => {
    it('should return 401 when unauthenticated', async () => {
      const response = await request(app)
        .get(`/api/books/${testBookId}/file`);

      expect(response.status).toBe(401);
    });

    it('should return 404 when book has no file (with auth)', async () => {
      const response = await request(app)
        .get(`/api/books/${testBookId}/file`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent book (with auth)', async () => {
      const response = await request(app)
        .get('/api/books/999999/file')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/books/:id/converted', () => {
    it('should return 401 when unauthenticated', async () => {
      const response = await request(app)
        .get(`/api/books/${testBookId}/converted`);

      expect(response.status).toBe(401);
    });

    it('should return 404 when book has no file (with auth)', async () => {
      const response = await request(app)
        .get(`/api/books/${testBookId}/converted`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent book (with auth)', async () => {
      const response = await request(app)
        .get('/api/books/999999/converted')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});
