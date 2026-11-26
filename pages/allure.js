import * as allure from 'allure-js-commons';

/**
 * Allure metadata every UI test shares (Playwright specs and playwright-bdd scenarios).
 * Per-test details (feature, story, severity, issue) go in each test's annotations.
 * https://allurereport.org/docs/playwright-reference/
 */
export const allureFixtures = {
  allureDefaults: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await allure.epic('SauceDemo');
      await allure.owner('Fabricio Sanjines');
      await use();
    },
    { auto: true },
  ],
};
