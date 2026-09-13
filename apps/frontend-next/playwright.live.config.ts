import { defineConfig, devices } from '@playwright/test';

const LIVE_PORT = process.env.PORT || '3001';
const BASE_URL = process.env.BASE_URL || `http://localhost:${LIVE_PORT}`;

export default defineConfig({
  testDir: './e2e/specs',
  testMatch: /.*live-smoke\.spec\.ts/,
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    locale: 'ja-JP',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
