import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { logIn } from '../support/world.js';

// this.loginPage / this.productsPage are lazy getters on the World (support/world.js).
Given('I am on the login page', async function () {
  await this.loginPage.goto();
});

When('I log in as {string} with password {string}', async function (username, password) {
  await this.loginPage.login(username, password);
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
  await expect(this.productsPage.title).toHaveText('Products');
});
