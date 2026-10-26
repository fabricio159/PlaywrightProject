import dotenv from 'dotenv';

/* Load the root .env here too: this file is read before support/world.js runs. */
dotenv.config({ path: '../.env', quiet: true });

/**
 * Cucumber.js config. Run from this folder: `npm test`.
 * https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md
 */
/**
 * TAGS works like in playwright.config.js: TAGS=@smoke,@login runs scenarios with any of them.
 * Empty or "all" runs every scenario.
 */
const tags = (process.env.TAGS ?? '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean);

export default {
  paths: ['features/**/*.feature'],
  tags: tags.length === 0 || tags.includes('all') ? '' : tags.join(' or '),
  import: ['support/**/*.js', 'steps/**/*.js'],
  format: ['progress', 'html:reports/cucumber-report.html'],
  /* Retry on CI only, like playwright.config.js */
  retry: process.env.CI ? 2 : 0,
  parallel: Number(process.env.PARALLEL_NODES ?? 1),
};
