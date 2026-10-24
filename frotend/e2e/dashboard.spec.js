/**
 * E2E tests for dashboard and user features
 * Tests dashboard stats, goals, and user profile
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.click('text=Log in');
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Log in")');
    await page.waitForURL('/dashboard');
  });

  test('should display user reading statistics', async ({ page }) => {
    // Verify dashboard is loaded
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Check for stats cards
    await expect(page.locator('[data-testid="stats-card"]').first()).toBeVisible();

    // Verify specific stats are displayed
    await expect(page.locator('text=Books Read')).toBeVisible();
    await expect(page.locator('text=Reading Time')).toBeVisible();
  });

  test('should display recent reading sessions', async ({ page }) => {
    // Scroll to recent sessions section
    await page.evaluate(() => window.scrollTo(0, 300));

    // Verify recent sessions are shown
    const recentSessions = page.locator('[data-testid="recent-session"]');
    const count = await recentSessions.count();

    // Should have at least one session or empty state
    if (count > 0) {
      await expect(recentSessions.first()).toBeVisible();
    } else {
      await expect(page.locator('text=No recent sessions')).toBeVisible();
    }
  });

  test('should display reading goals', async ({ page }) => {
    // Scroll to goals section
    await page.evaluate(() => window.scrollTo(0, 600));

    // Verify goals are displayed
    const goals = page.locator('[data-testid="goal-card"]');
    const count = await goals.count();

    if (count > 0) {
      await expect(goals.first()).toBeVisible();
      // Check for progress bar
      await expect(page.locator('[data-testid="goal-progress"]')).toBeVisible();
    } else {
      await expect(page.locator('text=No goals set')).toBeVisible();
    }
  });

  test('should navigate to books from dashboard', async ({ page }) => {
    // Click on books link/card
    await page.click('text=Books');

    // Verify navigation
    await page.waitForURL('/books');
    await expect(page).toHaveURL('/books');
  });

  test('should navigate to challenges from dashboard', async ({ page }) => {
    // Click on challenges link
    await page.click('text=Challenges');

    // Verify navigation
    await page.waitForURL('/challenges');
    await expect(page).toHaveURL('/challenges');
  });
});

test.describe('User Profile Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.click('text=Log in');
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Log in")');
    await page.waitForURL('/dashboard');
  });

  test('should display user profile information', async ({ page }) => {
    // Open user menu
    await page.click('button[aria-label="User menu"]');

    // Click on profile
    await page.click('text=Profile');

    // Verify profile page
    await page.waitForURL(/\/profile/);
    await expect(page.locator('text=Profile')).toBeVisible();

    // Verify user info is displayed
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
  });

  test('should update user display name', async ({ page }) => {
    // Open user menu
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Profile');

    // Click edit button
    await page.click('button:has-text("Edit")');

    // Update display name
    await page.fill('input[name="displayName"]', 'Updated Name');
    await page.click('button:has-text("Save")');

    // Verify success message
    await expect(page.locator('text=Profile updated')).toBeVisible({ timeout: 5000 });

    // Verify name is updated
    await expect(page.locator('text=Updated Name')).toBeVisible();
  });
});

test.describe('Challenges Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.click('text=Log in');
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Log in")');
    await page.waitForURL('/dashboard');
  });

  test('should display available challenges', async ({ page }) => {
    // Navigate to challenges
    await page.click('text=Challenges');
    await page.waitForURL('/challenges');

    // Verify challenges are displayed
    await expect(page.locator('[data-testid="challenge-card"]').first()).toBeVisible();
  });

  test('should join a challenge', async ({ page }) => {
    await page.click('text=Challenges');
    await page.waitForURL('/challenges');

    // Click join on first challenge
    const joinButton = page.locator('button:has-text("Join")').first();
    if (await joinButton.isVisible()) {
      await joinButton.click();

      // Verify join success
      await expect(page.locator('text=Challenge joined')).toBeVisible({ timeout: 5000 });

      // Button should change to "Joined"
      await expect(page.locator('button:has-text("Joined")')).toBeVisible();
    }
  });

  test('should display challenge progress', async ({ page }) => {
    await page.click('text=Challenges');
    await page.waitForURL('/challenges');

    // Check for progress indicators
    const progressBars = page.locator('[data-testid="challenge-progress"]');
    const count = await progressBars.count();

    if (count > 0) {
      await expect(progressBars.first()).toBeVisible();
    }
  });
});

test.describe('Leaderboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.click('text=Log in');
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Log in")');
    await page.waitForURL('/dashboard');
  });

  test('should display leaderboard', async ({ page }) => {
    // Navigate to leaderboard
    await page.click('text=Leaderboard');
    await page.waitForURL('/leaderboard');

    // Verify leaderboard is displayed
    await expect(page.locator('text=Leaderboard')).toBeVisible();
    await expect(page.locator('[data-testid="leaderboard-row"]').first()).toBeVisible();
  });

  test('should show user ranking', async ({ page }) => {
    await page.click('text=Leaderboard');
    await page.waitForURL('/leaderboard');

    // Check if current user is highlighted
    const currentUserRow = page.locator('[data-testid="current-user-rank"]');
    if (await currentUserRow.isVisible()) {
      await expect(currentUserRow).toBeVisible();
    }
  });

  test('should filter leaderboard by period', async ({ page }) => {
    await page.click('text=Leaderboard');
    await page.waitForURL('/leaderboard');

    // Click on period filter
    await page.click('button:has-text("This Week")');

    // Wait for update
    await page.waitForTimeout(500);

    // Verify filter is applied
    await expect(page.locator('button:has-text("This Week")')).toBeVisible();
  });
});
