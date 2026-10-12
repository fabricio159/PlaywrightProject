import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

/* Configure projects for major browsers */
const allProjects = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },

  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },

  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },

  /* Test against mobile viewports. */
  // {
  //   name: 'Mobile Chrome',
  //   use: { ...devices['Pixel 5'] },
  // },
  // {
  //   name: 'Mobile Safari',
  //   use: { ...devices['iPhone 12'] },
  // },

  /* Test against branded browsers. */
  // {
  //   name: 'Microsoft Edge',
  //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
  // },
  // {
  //   name: 'Google Chrome',
  //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
  // },
];

/**
 * Pick browsers with BROWSER in .env, e.g. BROWSER=chromium or BROWSER=chromium,firefox.
 * Empty or "all" runs every project.
 */
const browsers = (process.env.BROWSER ?? '')
  .split(',')
  .map((b) => b.trim().toLowerCase())
  .filter(Boolean);
const selectedProjects =
  browsers.length === 0 || browsers.includes('all')
    ? allProjects
    : allProjects.filter((p) => browsers.includes(p.name.toLowerCase()));

/**
 * Log in once (tests/auth.setup.js) and start every test with that session.
 * Tests that need a logged-out browser override storageState (see tests/example.spec.js).
 * https://playwright.dev/docs/auth
 */
const authFile = path.resolve(__dirname, 'playwright/.auth/user.json');
const projects = [
  { name: 'setup', testDir: './tests', testMatch: /auth\.setup\.js/ },
  ...selectedProjects.map((p) => ({
    ...p,
    use: { ...p.use, storageState: authFile },
    dependencies: ['setup'],
  })),
];
const unknown = browsers.filter(
  (b) => b !== 'all' && !allProjects.some((p) => p.name.toLowerCase() === b),
);
if (unknown.length) {
  throw new Error(
    `Unknown BROWSER value(s): ${unknown.join(', ')}. Use: all, ${allProjects.map((p) => p.name).join(', ')}`,
  );
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL ?? 'https://playwright.dev',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Browsers selected with the BROWSER env var (see allProjects above) */
  projects,

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

