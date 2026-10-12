import { expect } from '@playwright/test';
import { Given, Then } from './fixtures.js';

Given('I open the Products page', async ({ page }) => {
  await page.goto('/inventory.html');
  // Without a valid session Saucedemo redirects to the login page, so the title never shows.
  await expect(page.locator('[data-test="title"]'), 'Session expired or missing: storageState is stale').toHaveText('Products');
});

Then('I should see {int} products', async ({ page }, count) => {
  await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(count);
});
