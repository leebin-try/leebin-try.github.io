import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ?? (!process.env.CI && existsSync(localChrome) ? localChrome : undefined);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  globalTimeout: 600_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4329',
    launchOptions: executablePath ? { executablePath } : {},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', testDir: './tests/e2e', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', testDir: './tests/e2e', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
    { name: 'design', testDir: './tests/design', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run preview:test',
    url: 'http://127.0.0.1:4329/sitemap-0.xml',
    reuseExistingServer: false,
    timeout: 120_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 1000 },
  },
});
