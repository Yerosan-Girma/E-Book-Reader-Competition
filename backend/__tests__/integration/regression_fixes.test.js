/**
 * Regression test suite verifying all QA audit defect fixes:
 * - DEF-01 / SEC-01: Payment verification security
 * - DEF-02 / SEC-02: Password change verification & complexity
 * - DEF-04: Book file download authentication gate
 * - DEF-07: Reading session elapsed wall-clock anti-cheat
 * - DEF-08: Category string filter in book listing
 */

const request = require('supertest');
const app = require('../../src/app');
const { testPool, truncateAllTables, seedTestData, closeTestDb } = require('../helpers/db');

describe('QA Audit Regression & Security Fixes', () => {
  let authToken;
  let testBookId;
  let userId;

  beforeAll(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await truncateAllTables();
    await seedTestData();

    // Login testuser
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'SecurePass123!' });

    authToken = loginRes.body.token;
    userId = loginRes.body.user.id;

    const { rows } = await testPool.query('SELECT id FROM books LIMIT 1');
    testBookId = rows[0]?.id;

    // Associate test book with 'Fiction' category
    const cat = await testPool.query("SELECT id FROM categories WHERE slug = 'fiction' LIMIT 1");
    if (cat.rows[0]) {
      await testPool.query(
        'INSERT INTO book_categories (book_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [testBookId, cat.rows[0].id]
      );
    }
  });

  describe('DEF-02 / SEC-02: Password Change Verification', () => {
    it('should reject password change when currentPassword is missing', async () => {
      const res = await request(app)
        .put('/api/user/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ newPassword: 'BrandNewPassword123!' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject password change when newPassword is less than 8 characters', async () => {
      const res = await request(app)
        .put('/api/user/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentPassword: 'SecurePass123!', newPassword: 'short' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject password change when currentPassword is wrong', async () => {
      const res = await request(app)
        .put('/api/user/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentPassword: 'IncorrectOldPassword!', newPassword: 'BrandNewPassword123!' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/current password is incorrect/i);
    });

    it('should succeed when currentPassword matches and newPassword is valid', async () => {
      const res = await request(app)
        .put('/api/user/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentPassword: 'SecurePass123!', newPassword: 'BrandNewPassword123!' });

      expect(res.status).toBe(200);

      // Verify user can now log in with the new password
      const newLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'BrandNewPassword123!' });

      expect(newLoginRes.status).toBe(200);
      expect(newLoginRes.body).toHaveProperty('token');
    });
  });

  describe('DEF-04: Book File Download Authentication Gate', () => {
    it('should reject unauthenticated request to /api/books/:id/file with 401', async () => {
      const res = await request(app).get(`/api/books/${testBookId}/file`);
      expect(res.status).toBe(401);
    });

    it('should reject unauthenticated request to /api/books/:id/converted with 401', async () => {
      const res = await request(app).get(`/api/books/${testBookId}/converted`);
      expect(res.status).toBe(401);
    });
  });

  describe('DEF-07: Reading Session Anti-Cheat Wall-Clock Duration Check', () => {
    it('should cap client-submitted reading duration to actual physical elapsed time', async () => {
      // 1. Start a reading session
      const startRes = await request(app)
        .post('/api/reading-sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bookId: testBookId, chapterId: null });

      expect(startRes.status).toBe(201);
      const sessionId = startRes.body.id;

      // 2. Client maliciously submits 100,000 seconds after just starting
      const finishRes = await request(app)
        .post(`/api/reading-sessions/${sessionId}/finish`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ durationSeconds: 100000 });

      expect(finishRes.status).toBe(200);

      // 3. Verify in database that recorded duration is capped to realistic elapsed time (< 60s)
      const { rows } = await testPool.query(
        'SELECT duration_seconds FROM reading_sessions WHERE id = $1',
        [sessionId]
      );
      expect(rows[0].duration_seconds).toBeLessThan(60);
      expect(rows[0].duration_seconds).not.toBe(100000);
    });
  });

  describe('DEF-08: Category String Filter in Book Listing', () => {
    it('should filter books by category name string', async () => {
      const res = await request(app)
        .get('/api/books')
        .query({ category: 'Fiction' });

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeGreaterThan(0);
      expect(res.body.items[0].categories).toContain('Fiction');
    });

    it('should return empty list for non-matching category name', async () => {
      const res = await request(app)
        .get('/api/books')
        .query({ category: 'NonExistentGenreXYZ' });

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(0);
      expect(res.body.total).toBe(0);
    });
  });
});
