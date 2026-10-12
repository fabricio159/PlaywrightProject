import { test, expect } from '@playwright/test';

// Starts logged in through storageState (see auth.setup.js), no login form.
test('products page lists items', async ({ page }) => {
  await page.goto('/inventory.html');

  // Without a valid session Saucedemo redirects to the login page, so the title never shows.
  await expect(page.locator('[data-test="title"]'), 'Session expired or missing: storageState is stale').toHaveText('Products');
  await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);
});
