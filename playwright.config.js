import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
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
 * Pick tests with TAGS in .env, e.g. TAGS=@smoke or TAGS=@smoke,@login (runs tests with any of them).
 * Empty or "all" (any case) runs every test. Applies to the BDD config too, since Gherkin tags become Playwright tags.
 * Same rules as cucumber/cucumber.js. Only set on the browser projects, so the setup project still logs in.
 */
const tags = (process.env.TAGS ?? '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean);
const isAll = (t) => t.toLowerCase() === 'all';
const badTags = tags.filter((t) => !isAll(t) && !/^@[\w-]+$/.test(t));
if (badTags.length) {
  throw new Error(`Invalid TAGS value(s): ${badTags.join(', ')}. Tags look like @smoke`);
}
/* Match whole tags only: @smoke must not match @smoke-extra */
const grep =
  tags.length === 0 || tags.some(isAll) ? undefined : new RegExp(`(${tags.join('|')})(?![\\w-])`);

/**
 * Log in once (tests/auth.setup.js) and start every test with that session.
 * Tests that need a logged-out browser override storageState (see tests/example.spec.js).
 * https://playwright.dev/docs/auth
 */
const authFile = path.resolve(__dirname, 'playwright/.auth/user.json');

/**
 * API tests (tests/api) use the built-in `request` fixture: no browser, no login.
 * Included whatever BROWSER says; SKIP_API=true leaves them out (CI runs them in their own job).
 * Run them alone with `npm run test:api`.
 */
const skipApi = process.env.SKIP_API === 'true';
const apiURL = process.env.API_URL ?? 'https://restful-booker.herokuapp.com';
if (!/^https?:\/\//.test(apiURL)) {
  throw new Error(`Invalid API_URL value: ${apiURL}. It must start with http:// or https://`);
}
const apiProject = {
  name: 'api',
  testDir: './tests/api',
  use: {
    baseURL: apiURL,
    extraHTTPHeaders: { Accept: 'application/json' },
  },
  grep,
};

const projects = [
  { name: 'setup', testDir: './tests', testMatch: /auth\.setup\.js/ },
  ...selectedProjects.map((p) => ({
    ...p,
    use: { ...p.use, storageState: authFile },
    dependencies: ['setup'],
    testIgnore: /tests[\\/]api[\\/]/,
    grep,
  })),
  ...(skipApi ? [] : [apiProject]),
];
const unknown = browsers.filter(
  (b) => b !== 'all' && !allProjects.some((p) => p.name.toLowerCase() === b),
);
if (unknown.length) {
  throw new Error(
    `Unknown BROWSER value(s): ${unknown.join(', ')}. Use: all, ${allProjects.map((p) => p.name).join(', ')}`,
  );
}

const baseURL = process.env.BASE_URL ?? 'https://playwright.dev';
/* Jira site for Allure issue links, e.g. JIRA_URL=https://your-site.atlassian.net */
const jiraURL = (process.env.JIRA_URL ?? 'https://your-site.atlassian.net').replace(/\/+$/, '');

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
  /* Reporters: list in the terminal, HTML to browse, JSON for tools, Allure. See https://playwright.dev/docs/test-reporters
   * JSON goes after HTML: the HTML reporter clears playwright-report/ when it writes.
   * Allure writes raw results to allure-results/ (outside playwright-report/ for the same reason);
   * build the report with `npm run allure:generate`. https://allurereport.org/docs/playwright/ */
  reporter: [
    ['list'],
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        /* Include Playwright's own steps (clicks, fills, expects) in the step tree */
        detail: true,
        suiteTitle: true,
        /* allure.issue('SCRUM-24') or { type: 'issue', description: 'SCRUM-24' } becomes a Jira link */
        links: {
          issue: { nameTemplate: '%s', urlTemplate: `${jiraURL}/browse/%s` },
          tms: { nameTemplate: '%s', urlTemplate: `${jiraURL}/browse/%s` },
        },
        /* Shown in the report's Environment widget */
        environmentInfo: {
          BASE_URL: baseURL,
          API_URL: apiURL,
          BROWSER: process.env.BROWSER || 'all',
          TAGS: process.env.TAGS || 'all',
          NODE: process.version,
          OS: `${os.platform()} ${os.release()}`,
        },
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Kept for failed tests only; the HTML and Allure reports attach them */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Browsers selected with the BROWSER env var (see allProjects above) */
  projects,
});
