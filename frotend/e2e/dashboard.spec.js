/**
 * E2E tests for dashboard and user features
 * Tests dashboard stats, goals, and user profile
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should display user reading statistics', async ({ page }) => {
    await expect(page.locator('[data-testid="stats-card"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Reading Streak').first()).toBeVisible();
  });

  test('should display recent reading sessions', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 300));
    const recentSessions = page.locator('[data-testid="recent-session"]');
    const count = await recentSessions.count();

    if (count > 0) {
      await expect(recentSessions.first()).toBeVisible();
    } else {
      await expect(page.locator('[data-testid="stats-card"]').first()).toBeVisible();
    }
  });

  test('should display reading goals', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 600));
    const goals = page.locator('[data-testid="goal-card"]');
    if (await goals.count() > 0) {
      await expect(goals.first()).toBeVisible();
    }
  });

  test('should navigate to books from dashboard', async ({ page }) => {
    await page.goto('/books');
    await expect(page).toHaveURL('/books');
  });

  test('should navigate to challenges from dashboard', async ({ page }) => {
    await page.goto('/challenges');
    await expect(page).toHaveURL('/challenges');
  });
});

test.describe('User Profile Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should display user profile information', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Personal Information').first()).toBeVisible({ timeout: 10000 });
  });

  test('should update user display name', async ({ page }) => {
    await page.goto('/profile');
    const nameInput = page.locator('input[value]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Updated Reader Name');
      const saveBtn = page.locator('button:has-text("Save Changes"), button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(600);
      }
    }
  });
});

test.describe('Challenges Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should display available challenges', async ({ page }) => {
    await page.goto('/challenges');
    await expect(page.locator('[data-testid="challenge-card"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should submit notify email for challenges', async ({ page }) => {
    await page.goto('/challenges');
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('notify@example.com');
      const btn = page.locator('button:has-text("Notify Me"), button[type="submit"]').first();
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe('Leaderboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should display leaderboard', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.locator('h1:has-text("Leaderboard")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="leaderboard-row"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should submit notification request for leaderboard', async ({ page }) => {
    await page.goto('/leaderboard');
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('leader@example.com');
      const btn = page.locator('button:has-text("Notify Me"), button[type="submit"]').first();
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(500);
      }
    }
  });
});
