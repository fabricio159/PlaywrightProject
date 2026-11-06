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

When('I go to {string}', async ({ page }, url) => {
  await page.goto(url);
});

// Failed logins (and logged-out redirects) leave you on the login page with an error.
Then('I should see the login error {string}', async ({ page, loginPage }, message) => {
  await expect(page).toHaveURL('/');
  await expect(loginPage.error).toHaveText(message);
});

When('I dismiss the login error', async ({ loginPage }) => {
  await expect(loginPage.error).toBeVisible();
  await loginPage.dismissErrorButton.click();
});

Then('the login error should not be shown', async ({ loginPage }) => {
  await expect(loginPage.error).toBeHidden();
});
