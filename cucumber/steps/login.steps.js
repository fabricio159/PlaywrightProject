import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the login page', async function () {
  await this.page.goto('/');
});

When('I log in as {string} with password {string}', async function (username, password) {
  await logIn(this.page, username, password);
});

When('I log in with the credentials from .env', async function () {
  await logIn(
    this.page,
    process.env.SAUCE_USERNAME ?? 'standard_user',
    process.env.SAUCE_PASSWORD ?? 'secret_sauce',
  );
});

Then('the page title should be {string}', async function (title) {
  await expect(this.page).toHaveTitle(title);
});

Then('I should see the Products page', async function () {
  await expect(this.page).toHaveURL('/inventory.html');
  await expect(this.page.locator('[data-test="title"]')).toHaveText('Products');
});

async function logIn(page, username, password) {
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}
