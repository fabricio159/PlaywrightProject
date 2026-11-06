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
  // Longer waits for performance_glitch_user: its login and page load take about 5 seconds.
  await expect(this.page).toHaveURL('/inventory.html', { timeout: 15_000 });
  await expect(this.productsPage.title).toHaveText('Products', { timeout: 15_000 });
});

Then('I should see the username and password fields', async function () {
  await expect(this.loginPage.username).toBeVisible();
  await expect(this.loginPage.username).toBeEditable();
  await expect(this.loginPage.password).toBeVisible();
  await expect(this.loginPage.password).toHaveAttribute('type', 'password');
});

Then('I should see the Login button', async function () {
  await expect(this.loginPage.loginButton).toBeVisible();
  await expect(this.loginPage.loginButton).toBeEnabled();
});

Then('I should see the login error {string}', async function (message) {
  await expect(this.loginPage.error).toBeVisible();
  await expect(this.loginPage.error).toHaveText(message);
});

Then('I should stay on the login page', async function () {
  await expect(this.page).not.toHaveURL(/inventory\.html/);
});

When('I dismiss the login error', async function () {
  await this.loginPage.dismissError();
});

Then('I should not see a login error', async function () {
  await expect(this.loginPage.error).toBeHidden();
});

// Unlike "I open the Products page", this step expects no session (feature is tagged @logged-out).
When('I go to the Products page without logging in', async function () {
  await this.productsPage.goto();
});

Then('I should be redirected to the login page', async function () {
  await expect(this.page).toHaveURL('/');
  await expect(this.loginPage.loginButton).toBeVisible();
});
