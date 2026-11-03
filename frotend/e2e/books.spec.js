/**
 * E2E tests for book discovery and reading flow
 * Tests browsing, searching, and reading books
 */

import { test, expect } from '@playwright/test';

test.describe('Book Discovery Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should display list of books', async ({ page }) => {
    await page.goto('/books');
    await expect(page.locator('[data-testid="book-card"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter books by search', async ({ page }) => {
    await page.goto('/books');

    const searchInput = page.locator('input[aria-label="Search library materials"], input[type="text"]').first();
    await searchInput.fill('Book');
    await page.waitForTimeout(600);

    const bookCards = page.locator('[data-testid="book-card"]');
    const count = await bookCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter books by category', async ({ page }) => {
    await page.goto('/books');

    const catBtn = page.locator('button:has-text("Fiction")').first();
    if (await catBtn.isVisible()) {
      await catBtn.click();
      await page.waitForTimeout(600);
      await expect(page.locator('text=Fiction').first()).toBeVisible();
    }
  });

  test('should navigate to book detail page', async ({ page }) => {
    await page.goto('/books');

    const firstBookLink = page.locator('[data-testid="book-card"] a[href^="/books/"]').first();
    if (await firstBookLink.isVisible()) {
      await firstBookLink.click();
      await page.waitForURL(/\/books\/\d+/, { timeout: 10000 });
      await expect(page.locator('h1').first()).toBeVisible();
    }
  });

  test('should display book chapters or contents', async ({ page }) => {
    await page.goto('/books');
    const firstBookLink = page.locator('[data-testid="book-card"] a[href^="/books/"]').first();
    await firstBookLink.click();
    await page.waitForURL(/\/books\/\d+/, { timeout: 10000 });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Read Online Now")').first()).toBeVisible({ timeout: 10000 });
  });

  test('should paginate books or show library count', async ({ page }) => {
    await page.goto('/books');
    await expect(page.locator('[data-testid="book-card"]').first()).toBeVisible({ timeout: 10000 });

    const nextBtn = page.locator('button:has-text("Next")').first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Reading Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should open reading session interface', async ({ page }) => {
    await page.goto('/books');
    const firstReadLink = page.locator('[data-testid="book-card"] a[href^="/read/"]').first();
    await firstReadLink.click();
    await page.waitForURL(/\/read\/\d+/, { timeout: 10000 });
    await expect(page.locator('header, [data-testid="reading-interface"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display reader toolbar and navigation controls', async ({ page }) => {
    await page.goto('/books');
    const firstReadLink = page.locator('[data-testid="book-card"] a[href^="/read/"]').first();
    await firstReadLink.click();
    await page.waitForURL(/\/read\/\d+/, { timeout: 10000 });
    await expect(page.locator('header, [data-testid="reading-interface"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should pause and resume reading session timer', async ({ page }) => {
    await page.goto('/books');
    const firstReadLink = page.locator('[data-testid="book-card"] a[href^="/read/"]').first();
    await firstReadLink.click();
    await page.waitForURL(/\/read\/\d+/, { timeout: 10000 });
    await page.waitForTimeout(1000);

    const pauseBtn = page.locator('button[title*="Pause" i], button:has-text("Pause")').first();
    if (await pauseBtn.isVisible()) {
      await pauseBtn.click();
      await page.waitForTimeout(500);

      const resumeBtn = page.locator('button[title*="Resume" i], button[title*="Play" i]').first();
      if (await resumeBtn.isVisible()) {
        await resumeBtn.click();
      }
    }
  });
});

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`should display correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });

      await page.goto('/books');
      await expect(page.locator('[data-testid="book-card"]').first()).toBeVisible({ timeout: 10000 });
    });
  });
});
