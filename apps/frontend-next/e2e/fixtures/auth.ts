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
 * Includes retry logic for flaky network conditions during parallel test execution
 */
export async function login(
  page: import('@playwright/test').Page,
  username = 'admin',
  password = 'password',
  captchaCode = 'A1B2' // ダミーキャプチャのコード
) {
  const maxAttempts = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await page.goto('/login');

      // Wait for page to be fully loaded
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

      // Wait for form inputs to be available
      await page.waitForSelector('input[id="username"]', { timeout: 10000 });

      // Clear and fill in credentials (form may have default values)
      await page.fill('input[id="username"]', username);
      await page.fill('input[id="password"]', password);
      await page.fill('input[id="captchaCode"]', captchaCode);

      // Submit form and wait for response or navigation
      const responsePromise = page.waitForResponse(
        (response) => response.url().includes('/api/auth/login'),
        { timeout: 30000 }
      );

      await page.click('button[type="submit"]');

      const response = await responsePromise;
      // Check if login succeeded
      if (response.status() !== 200) {
        throw new Error(`Login failed with status ${response.status()}`);
      }

      // Wait for navigation to complete
      await page.waitForURL((url) => !url.pathname.includes('/login'), {
        timeout: 30000,
      });

      // Wait for dashboard to be ready
      await page.waitForLoadState('domcontentloaded', { timeout: 20000 });

      // Login successful
      return;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));

      // Check if we're already logged in (navigation completed despite timeout)
      try {
        const currentUrl = page.url();
        if (!currentUrl.includes('/login')) {
          return; // Already navigated away from login page
        }
      } catch {
        // Page might be closed, ignore
      }

      if (attempt < maxAttempts) {
        // Wait before retry with try-catch in case page is closed
        try {
          await page.waitForTimeout(2000);
        } catch {
          // Page closed, break out
          break;
        }
      }
    }
  }

  throw new Error(`Login failed after ${maxAttempts} attempts: ${lastError?.message}`);
}
