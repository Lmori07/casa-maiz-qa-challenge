import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { loadEnv } from '@casa-maiz/shared';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const env = loadEnv();

/**
 * API/contract suite — Playwright Test's `request` fixture only, no
 * browser is ever launched. Isolated from packages/browser-tests: its own
 * testDir, its own report/output directories, its own npm scripts. Only
 * the logic in @casa-maiz/shared is common between the two suites.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Capped rather than left unbounded: this suite runs against a live,
  // shared, third-party-hosted CMS we don't own — see docs/RISK-MODEL.md.
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'reports/api-results.json' }],
  ],
  use: {
    baseURL: env.CMS_API_BASE_URL,
    extraHTTPHeaders: { Accept: 'application/json' },
    trace: 'on-first-retry',
  },
  projects: [{ name: 'api' }],
});
