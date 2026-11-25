/**
 * Allure settings for the mutation report: one result per mutant, written by mutation/run.mjs.
 * Kept apart from the main report (allurerc.mjs) so expected test failures under a mutant
 * never land in the normal API history.
 *   npm run test:api:mutation && npm run mutation:allure:generate && npm run mutation:allure:open
 */
export default {
  name: 'PlaywrightProject mutation tests',
  resultsDir: './mutation-results/allure-results',
  output: './mutation-allure-report',
  /* Trend of killed/survived mutants across runs */
  historyPath: './mutation-allure-history.jsonl',
  historyLimit: 50,
};
