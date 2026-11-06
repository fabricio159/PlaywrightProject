import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// this.productsPage is a lazy getter on the World (support/world.js), fresh per scenario.
Given('I open the Products page', async function () {
  await this.productsPage.goto();
  // Without a valid session Saucedemo redirects to the login page, so the title never shows.
  await expect(
    this.productsPage.title,
    'Session expired or missing: storageState is stale',
  ).toHaveText('Products');
});

Given('I open the Products lightweight page', async function () {
  await this.page.route('**/*', (route) =>
    route.request().resourceType() === 'image' ? route.abort() : route.continue(),
  );
  await this.page.goto('/inventory.html');
  // Without a valid session Saucedemo redirects to the login page, so the title never shows.
  await expect(
    this.page.locator('[data-test="title"]'),
    'Session expired or missing: storageState is stale',
  ).toHaveText('Products');
});

Then('I should see {int} products', async function (count) {
  await expect(this.productsPage.items).toHaveCount(count);
});

When('I sort the products by {string}', async function (label) {
  await this.productsPage.sortBy(label);
});

Then('the product prices should be in ascending order', async function () {
  const prices = await this.productsPage.itemPrices();
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});
