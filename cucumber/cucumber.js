import dotenv from 'dotenv';

/* Load the root .env here too: this file is read before support/world.js runs. */
dotenv.config({ path: '../.env', quiet: true });

/**
 * Cucumber.js config. Run from this folder: `npm test`.
 * https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md
 */
/**
 * TAGS works like in playwright.config.js: TAGS=@smoke,@login runs scenarios with any of them.
 * Empty or "all" (any case) runs every scenario. Invalid values (no @, "or", "and") fail the run.
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

export default {
  paths: ['features/**/*.feature'],
  tags: tags.length === 0 || tags.some(isAll) ? '' : tags.join(' or '),
  import: ['support/**/*.js', 'steps/**/*.js'],
  format: ['progress', 'html:reports/cucumber-report.html'],
  /* Retry on CI only, like playwright.config.js */
  retry: process.env.CI ? 2 : 0,
  parallel: Number(process.env.PARALLEL_NODES ?? 1),
};
