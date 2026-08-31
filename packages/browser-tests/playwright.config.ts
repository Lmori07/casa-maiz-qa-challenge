import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { loadEnv } from '@casa-maiz/shared';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const env = loadEnv();

/**
 * Browser suite — real Chromium via Playwright. Isolated from
 * packages/api-tests: its own testDir, its own report/output directories,
 * its own npm scripts. Only the logic in @casa-maiz/shared is common.
 *
 * Single-project (chromium only) is a deliberate scope decision, not an
 * oversight — see docs/TRADE-OFFS.md: this runs against a live, shared,
 * third-party-hosted site, and cross-browser coverage isn't the point of
 * this challenge.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'reports/browser-results.json' }],
  ],
  use: {
    baseURL: env.CONSUMER_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
