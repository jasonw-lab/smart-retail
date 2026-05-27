import { test as base, expect } from '@playwright/test';

/**
 * Authentication fixture for E2E tests
 * Provides authenticated page context using mock login
 */
export const test = base.extend<{ authenticatedPage: typeof base }>({
  authenticatedPage: async ({ page }, use) => {
    await login(page);
    await use(base);
  },
});

export { expect };

/**
 * Helper function to perform login in a test
 */
export async function login(page: import('@playwright/test').Page, username = 'admin', password = 'password') {
  await page.goto('/login');

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Fill in credentials
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);

  // Submit form and wait for API response
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/auth/login') && response.status() === 200
    ),
    page.click('button[type="submit"]'),
  ]);

  // Wait for navigation to complete
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 15000,
  });
}
