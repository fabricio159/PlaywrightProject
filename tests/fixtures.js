import { test as base } from '@playwright/test';
import { pageFixtures, startLoggedOut, LOGGED_OUT } from '../pages/index.js';

/**
 * Page objects as fixtures for the Playwright Test specs (same ones the BDD steps use).
 * Tests start logged in through storageState (see auth.setup.js);
 * tag a test @logged-out to start with an empty browser, like in the BDD suite.
 */
export const test = base.extend({
  storageState: async ({ storageState }, use, testInfo) => {
    await use(startLoggedOut(testInfo.tags) ? LOGGED_OUT : storageState);
  },
  ...pageFixtures,
});

export { expect } from '@playwright/test';
