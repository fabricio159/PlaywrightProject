import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I open the Products page', async function () {
  await this.page.goto('/inventory.html');
  // Without a valid session Saucedemo redirects to the login page, so the title never shows.
  await expect(this.page.locator('[data-test="title"]'), 'Session expired or missing: storageState is stale').toHaveText('Products');
});

Then('I should see {int} products', async function (count) {
  await expect(this.page.locator('[data-test="inventory-item"]')).toHaveCount(count);
});
