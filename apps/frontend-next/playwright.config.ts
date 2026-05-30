import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1, // Single worker for stability (avoid login race conditions)
  timeout: 60000, // Increase test timeout to 60s
  expect: {
    timeout: 10000, // Increase expect timeout to 10s
  },
  reporter: [
    ['html', { outputFolder: 'e2e/playwright-report' }],
    ['json', { outputFile: 'e2e/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15000, // Increase action timeout
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
      url: 'http://localhost:8091/api/v1/retail/dashboard/stats',
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
    },
    // Next.js production server (build first if needed)
    {
      command: 'pnpm build && pnpm start:test',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000, // Build can take time
    },
  ],
});
