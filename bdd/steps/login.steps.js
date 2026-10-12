import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures.js';

Given('I am on the login page', async ({ page }) => {
  await page.goto('/');
});

When('I log in as {string} with password {string}', async ({ page }, username, password) => {
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
});

Then('I should see the Products page', async ({ page }) => {
  await expect(page).toHaveURL('/inventory.html');
  await expect(page.locator('[data-test="title"]')).toHaveText('Products');
});
