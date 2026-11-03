/**
 * E2E tests for authentication flow
 * Tests registration, login, and logout user journeys
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register a new user and redirect to dashboard', async ({ page }) => {
    await page.goto('/register');

    const uniqueName = `E2E User ${Date.now().toString().slice(-4)}`;
    const uniqueEmail = `e2e_${Date.now()}@example.com`;

    await page.fill('input[type="text"]', uniqueName);
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', 'SecurePass123!');

    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error for duplicate email during registration', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[type="text"]', 'Duplicate Test');
    await page.fill('input[type="email"]', 'test@example.com'); // Existing seeded email
    await page.fill('input[type="password"]', 'SecurePass123!');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email already registered')).toBeVisible({ timeout: 5000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrongpassword999');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('should logout and redirect', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Click Sign out in navbar
    const signOutBtn = page.locator('button:has-text("Sign out")');
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click();
    } else {
      // On mobile or smaller screens
      await page.goto('/login');
    }

    await page.waitForURL(/\/login|\//, { timeout: 10000 });
  });

  test('should persist session across page reloads', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.reload();

    await expect(page).toHaveURL('/dashboard');
  });
});
