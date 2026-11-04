import { test, expect } from '../fixtures.js';

// Starts logged in through storageState, no login form.
test.describe('Products page', { tag: '@products' }, () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.goto();
    // Without a valid session Saucedemo redirects to the login page, so the title never shows.
    await expect(
      productsPage.title,
      'Session expired or missing: storageState is stale',
    ).toHaveText('Products');
  });

  test('lists items', async ({ productsPage }) => {
    await expect(productsPage.items).toHaveCount(6);
  });

  test('can be sorted by price low to high', async ({ productsPage }) => {
    await productsPage.sortBy('Price (low to high)');

    const prices = await productsPage.itemPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});
