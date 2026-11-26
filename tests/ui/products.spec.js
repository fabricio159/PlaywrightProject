import { test, expect } from '../fixtures.js';

// Starts logged in through storageState, no login form.
// Annotations on the describe apply to every test inside it.
test.describe(
  'Products page',
  { tag: '@products', annotation: { type: 'allure.label.feature', description: 'Products page' } },
  () => {
    test.beforeEach(async ({ productsPage }) => {
      await productsPage.goto();
      // Without a valid session Saucedemo redirects to the login page, so the title never shows.
      await expect(
        productsPage.title,
        'Session expired or missing: storageState is stale',
      ).toHaveText('Products');
    });

    test(
      'lists items',
      { annotation: { type: 'allure.label.severity', description: 'critical' } },
      async ({ productsPage }) => {
        await expect(productsPage.items).toHaveCount(6);
      },
    );

    test(
      'can be sorted by price low to high',
      {
        annotation: [
          { type: 'allure.label.story', description: 'Sort products' },
          { type: 'allure.label.severity', description: 'normal' },
        ],
      },
      async ({ productsPage }) => {
        await productsPage.sortBy('Price (low to high)');

        const prices = await productsPage.itemPrices();
        expect(prices).toEqual([...prices].sort((a, b) => a - b));
      },
    );
  },
);
