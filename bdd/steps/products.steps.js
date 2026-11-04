import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures.js';

Given('I open the Products page', async ({ productsPage }) => {
  await productsPage.goto();
  // Without a valid session Saucedemo redirects to the login page, so the title never shows.
  await expect(productsPage.title, 'Session expired or missing: storageState is stale').toHaveText(
    'Products',
  );
});

Then('I should see {int} products', async ({ productsPage }, count) => {
  await expect(productsPage.items).toHaveCount(count);
});

When('I sort the products by {string}', async ({ productsPage }, label) => {
  await productsPage.sortBy(label);
});

Then('the product prices should be in ascending order', async ({ productsPage }) => {
  const prices = await productsPage.itemPrices();
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});
