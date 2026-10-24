/**
 * E2E tests for authentication flow
 * Tests registration, login, and logout user journeys
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should register a new user and redirect to dashboard', async ({ page }) => {
    // Navigate to register page
    await page.click('text=Sign up');

    // Fill registration form
    await page.fill('input[placeholder="Username"]', 'e2euser');
    await page.fill('input[placeholder="Email"]', 'e2e@example.com');
    await page.fill('input[placeholder="Password"]', 'SecurePass123!');
    await page.fill('input[placeholder="Display Name"]', 'E2E User');

    // Submit form
    await page.click('button:has-text("Sign up")');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Verify user is logged in
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=E2E User')).toBeVisible();
  });

  test('should show error for duplicate email during registration', async ({ page }) => {
    await page.click('text=Sign up');

    // Try to register with existing email
    await page.fill('input[placeholder="Username"]', 'newuser');
    await page.fill('input[placeholder="Email"]', 'test@example.com'); // Assume this exists
    await page.fill('input[placeholder="Password"]', 'SecurePass123!');
    await page.fill('input[placeholder="Display Name"]', 'New User');

    await page.click('button:has-text("Sign up")');

    // Should show error message
    await expect(page.locator('text=already registered')).toBeVisible({ timeout: 5000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login
    await page.click('text=Log in');

    // Fill login form
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');

    // Submit form
    await page.click('button:has-text("Log in")');

    // Wait for navigation
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Log in');

    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'wrongpassword');

    await page.click('button:has-text("Log in")');

    // Should show error
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('should logout and redirect to home', async ({ page }) => {
    // First login
    await page.click('text=Log in');
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Log in")');
    await page.waitForURL('/dashboard');

    // Logout (assuming there's a logout button/menu)
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Logout');

    // Verify redirect to home
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });

  test('should persist session across page reloads', async ({ page }) => {
    // Login
    await page.click('text=Log in');
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Log in")');
    await page.waitForURL('/dashboard');

    // Reload page
    await page.reload();

    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});
