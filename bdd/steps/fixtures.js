import { test as base, createBdd } from 'playwright-bdd';
import * as allure from 'allure-js-commons';
import { pageFixtures, allureFixtures, startLoggedOut, LOGGED_OUT } from '../../pages/index.js';

/**
 * Scenarios start logged in through storageState (see tests/auth.setup.js).
 * Tag a feature or scenario with @logged-out to start with an empty browser instead.
 * Page objects (loginPage, productsPage, ...) are fixtures shared with tests/fixtures.js.
 * Allure: shared labels come from allureFixtures; the Feature name becomes the Allure feature
 * and the Scenario name the story, so the Behaviors tab mirrors the .feature files.
 */
export const test = base.extend({
  storageState: async ({ $tags, storageState }, use) => {
    await use(startLoggedOut($tags) ? LOGGED_OUT : storageState);
  },
  ...pageFixtures,
  ...allureFixtures,
  bddAllureLabels: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, testInfo) => {
      // titlePath is [file, Feature, (Rule / Scenario Outline...), Scenario]
      const [, feature] = testInfo.titlePath;
      if (feature) await allure.feature(feature);
      await allure.story(testInfo.title);
      await use();
    },
    { auto: true },
  ],
});

export const { Given, When, Then } = createBdd(test);
