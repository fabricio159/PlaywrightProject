import { test as base, createBdd } from 'playwright-bdd';

/**
 * Scenarios start logged in through storageState (see tests/auth.setup.js).
 * Tag a feature or scenario with @logged-out to start with an empty browser instead.
 */
export const test = base.extend({
  storageState: async ({ $tags, storageState }, use) => {
    await use($tags.includes('@logged-out') ? { cookies: [], origins: [] } : storageState);
  },
});

export const { Given, When, Then } = createBdd(test);
