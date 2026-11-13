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

/* Jira site for Allure issue links, same variable as playwright.config.js */
const jiraURL = (process.env.JIRA_URL ?? 'https://your-site.atlassian.net').replace(/\/+$/, '');

export default {
  paths: ['features/**/*.feature'],
  tags: tags.length === 0 || tags.some(isAll) ? '' : tags.join(' or '),
  import: ['support/**/*.js', 'steps/**/*.js'],
  /* Formatters: pretty in the terminal (like Playwright's list), HTML to browse, JSON for tools,
   * Allure results (build the report with `npm run allure:generate`). https://allurereport.org/docs/cucumberjs/ */
  format: [
    'pretty',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json',
    /* Needs its own output file: formatters without one share stdout, and only the last one is used (it would hide pretty) */
    'allure-cucumberjs/reporter:reports/allure-reporter.txt',
  ],
  formatOptions: {
    resultsDir: 'reports/allure-results',
    /* Gherkin tags like @issue:SCRUM-24 become Jira links */
    links: {
      issue: { pattern: [/@issue:(.*)/], urlTemplate: `${jiraURL}/browse/%s`, nameTemplate: '%s' },
    },
    /* Gherkin tags like @severity:critical become the severity label */
    labels: [{ pattern: [/@severity:(.*)/], name: 'severity' }],
  },
  /* Retry on CI only, like playwright.config.js */
  retry: process.env.CI ? 2 : 0,
  parallel: Number(process.env.PARALLEL_NODES ?? 1),
};
