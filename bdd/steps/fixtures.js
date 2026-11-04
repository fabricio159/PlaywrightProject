import { test as base, createBdd } from 'playwright-bdd';
import { pageFixtures, startLoggedOut, LOGGED_OUT } from '../../pages/index.js';

/**
 * Scenarios start logged in through storageState (see tests/auth.setup.js).
 * Tag a feature or scenario with @logged-out to start with an empty browser instead.
 * Page objects (loginPage, productsPage, ...) are fixtures shared with tests/fixtures.js.
 */
export const test = base.extend({
  storageState: async ({ $tags, storageState }, use) => {
    await use(startLoggedOut($tags) ? LOGGED_OUT : storageState);
  },
  ...pageFixtures,
});

export const { Given, When, Then } = createBdd(test);
