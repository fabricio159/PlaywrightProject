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
};
