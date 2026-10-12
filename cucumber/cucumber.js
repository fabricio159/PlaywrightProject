import dotenv from 'dotenv';

/* Load the root .env here too: this file is read before support/world.js runs. */
dotenv.config({ path: '../.env', quiet: true });

/**
 * Cucumber.js config. Run from this folder: `npm test`.
 * https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md
 */
export default {
  paths: ['features/**/*.feature'],
  import: ['support/**/*.js', 'steps/**/*.js'],
  format: ['progress', 'html:reports/cucumber-report.html'],
  /* Retry on CI only, like playwright.config.js */
  retry: process.env.CI ? 2 : 0,
  parallel: Number(process.env.PARALLEL_NODES ?? 1),
};
