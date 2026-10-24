/**
 * E2E tests for book discovery and reading flow
 * Tests browsing, searching, and reading books
 */

import { test, expect } from '@playwright/test';

test.describe('Book Discovery Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.click('text=Log in');
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Log in")');
    await page.waitForURL('/dashboard');
  });

  test('should display list of books', async ({ page }) => {
    // Navigate to books page
    await page.click('text=Books');
    await page.waitForURL('/books');

    // Verify books are displayed
    await expect(page.locator('[data-testid="book-card"]').first()).toBeVisible();
  });

  test('should filter books by search', async ({ page }) => {
    await page.click('text=Books');
    await page.waitForURL('/books');

    // Enter search term
    await page.fill('input[placeholder="Search books..."]', 'Test');
    await page.press('input[placeholder="Search books..."]', 'Enter');

    // Wait for results
    await page.waitForTimeout(500);

    // Verify search results
    const bookCards = page.locator('[data-testid="book-card"]');
    const count = await bookCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter books by category', async ({ page }) => {
    await page.click('text=Books');
    await page.waitForURL('/books');

    // Click on a category filter
    await page.click('text=Fiction');

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Verify filter is applied
    await expect(page.locator('text=Fiction')).toBeVisible();
  });

  test('should navigate to book detail page', async ({ page }) => {
    await page.click('text=Books');
    await page.waitForURL('/books');

    // Click on first book
    await page.click('[data-testid="book-card"] >> first');

    // Wait for book detail page
    await page.waitForURL(/\/books\/\d+/);

    // Verify book details are displayed
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Author')).toBeVisible();
  });

  test('should display book chapters', async ({ page }) => {
    await page.click('text=Books');
    await page.waitForURL('/books');

    // Click on first book
    await page.click('[data-testid="book-card"] >> first');
    await page.waitForURL(/\/books\/\d+/);

    // Scroll to chapters section
    await page.evaluate(() => window.scrollTo(0, 500));

    // Verify chapters are listed
    await expect(page.locator('[data-testid="chapter-item"]').first()).toBeVisible();
  });

  test('should paginate books', async ({ page }) => {
    await page.click('text=Books');
    await page.waitForURL('/books');

    // Click next page
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);

      // Verify page changed
      await expect(page.locator('text=Page 2')).toBeVisible();
    }
  });
});

test.describe('Reading Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.click('text=Log in');
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Log in")');
    await page.waitForURL('/dashboard');
  });

  test('should start reading session', async ({ page }) => {
    // Navigate to books
    await page.click('text=Books');
    await page.waitForURL('/books');

    // Click on a book
    await page.click('[data-testid="book-card"] >> first');
    await page.waitForURL(/\/books\/\d+/);

    // Click "Start Reading" button
    await page.click('button:has-text("Start Reading")');

    // Wait for reading interface
    await page.waitForURL(/\/reading/);

    // Verify reading interface is displayed
    await expect(page.locator('[data-testid="reading-interface"]')).toBeVisible();
  });

  test('should navigate between chapters', async ({ page }) => {
    // Start reading
    await page.click('text=Books');
    await page.waitForURL('/books');
    await page.click('[data-testid="book-card"] >> first');
    await page.waitForURL(/\/books\/\d+/);
    await page.click('button:has-text("Start Reading")');
    await page.waitForURL(/\/reading/);

    // Click next chapter
    const nextButton = page.locator('button:has-text("Next Chapter")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);

      // Verify chapter changed
      await expect(page.locator('[data-testid="chapter-content"]')).toBeVisible();
    }
  });

  test('should track reading progress', async ({ page }) => {
    // Start reading
    await page.click('text=Books');
    await page.waitForURL('/books');
    await page.click('[data-testid="book-card"] >> first');
    await page.waitForURL(/\/books\/\d+/);
    await page.click('button:has-text("Start Reading")');
    await page.waitForURL(/\/reading/);

    // Scroll through content
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(1000);

    // Check progress indicator
    const progress = page.locator('[data-testid="reading-progress"]');
    if (await progress.isVisible()) {
      await expect(progress).toContainText(/\d+%/);
    }
  });

  test('should pause and resume reading session', async ({ page }) => {
    // Start reading
    await page.click('text=Books');
    await page.waitForURL('/books');
    await page.click('[data-testid="book-card"] >> first');
    await page.waitForURL(/\/books\/\d+/);
    await page.click('button:has-text("Start Reading")');
    await page.waitForURL(/\/reading/);

    // Pause session
    await page.click('button:has-text("Pause")');

    // Verify pause state
    await expect(page.locator('text=Paused')).toBeVisible();

    // Resume session
    await page.click('button:has-text("Resume")');

    // Verify resume
    await expect(page.locator('text=Paused')).not.toBeVisible();
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
      // Set viewport
      await page.setViewportSize({ width, height });

      // Login
      await page.goto('/');
      await page.click('text=Log in');
      await page.fill('input[placeholder="Email"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button:has-text("Log in")');
      await page.waitForURL('/dashboard');

      // Navigate to books
      await page.click('text=Books');
      await page.waitForURL('/books');

      // Verify layout
      await expect(page.locator('[data-testid="book-card"]').first()).toBeVisible();

      // On mobile, check for hamburger menu
      if (width < 768) {
        await expect(page.locator('button[aria-label="Menu"]')).toBeVisible();
      }
    });
  });
});
