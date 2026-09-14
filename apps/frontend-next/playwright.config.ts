import { defineConfig, devices } from '@playwright/test';

// E2E用ポート設定（環境変数で上書き可能）
const E2E_PORT = process.env.E2E_PORT || '3002';
const MOCK_PORT = process.env.MOCK_PORT || '8095';
const BASE_URL = `http://localhost:${E2E_PORT}`;
const MOCK_URL = `http://localhost:${MOCK_PORT}`;

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
    [
      'monocart-coverage-reports',
      {
        name: 'SmartRetail Pro E2E Coverage',
        outputDir: './coverage',
        reports: ['v8', 'console-summary'],
        thresholds: {
          statements: 50,
          branches: 40,
          functions: 40,
          lines: 50,
        },
      },
    ],
  ],
  use: {
    baseURL: BASE_URL,
    locale: 'ja-JP',
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
      command: `MOCK_PORT=${MOCK_PORT} pnpm mock:server`,
      url: `${MOCK_URL}/api/v1/retail/dashboard/stats`,
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
    },
    // Next.js production server
    {
      command: `DISABLE_RATE_LIMIT=true BACKEND_URL=${MOCK_URL}/api/v1 next start -p ${E2E_PORT}`,
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 60 * 1000,
    },
  ],
});
