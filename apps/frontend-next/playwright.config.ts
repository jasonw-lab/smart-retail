import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'e2e/playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    // Mock API server (backend mock)
    {
      command: 'pnpm mock:server',
      url: 'http://localhost:8080/api/v1/retail/dashboard/stats',
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
    },
    // Next.js production server (build first if needed)
    {
      command: 'pnpm build && pnpm start:test',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000, // Build can take time
    },
  ],
});
