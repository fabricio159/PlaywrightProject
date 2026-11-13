/**
 * Allure 3 report settings for the Cucumber suite, used by `npm run allure:generate` / `allure:open`.
 * Same idea as ../allurerc.mjs. https://allurereport.org/docs/v3/configure/
 */
export default {
  name: 'PlaywrightProject (Cucumber)',
  resultsDir: './reports/allure-results',
  output: './reports/allure-report',
  /* Summary of every generated report, for trends and flaky tests. reports/ is git-ignored. */
  historyPath: './reports/allure-history.jsonl',
  historyLimit: 50,
};
