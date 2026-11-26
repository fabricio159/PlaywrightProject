/**
 * Allure 3 report settings, used by `allure generate`, `allure open` and `allure run`.
 * https://allurereport.org/docs/v3/configure/
 */
export default {
  name: 'PlaywrightProject',
  resultsDir: './allure-results',
  output: './allure-report',
  /* Keeps a summary of every generated report, so the report shows trends and flaky/retried tests */
  historyPath: './allure-history.jsonl',
  /* Keep the last 50 runs, so the file (and the CI cache) stays small */
  historyLimit: 50,
};
