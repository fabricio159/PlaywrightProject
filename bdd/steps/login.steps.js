import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures.js';

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.goto();
});

When('I log in as {string} with password {string}', async ({ loginPage }, username, password) => {
  await loginPage.login(username, password);
});

Then('I should see the Products page', async ({ page, productsPage }) => {
  await expect(page).toHaveURL('/inventory.html');
  await expect(productsPage.title).toHaveText('Products');
});
