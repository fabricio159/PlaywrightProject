import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures.js';

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.goto();
});

When('I log in as {string} with password {string}', async ({ loginPage }, username, password) => {
  await loginPage.login(username, password);
});

Then('I should see the Products page', async ({ page, productsPage }) => {
  // Longer waits for performance_glitch_user: its login and page load take about 5 seconds.
  await expect(page).toHaveURL('/inventory.html', { timeout: 15_000 });
  await expect(productsPage.title).toHaveText('Products', { timeout: 15_000 });
});

Then('the page title should be {string}', async ({ page }, title) => {
  await expect(page).toHaveTitle(title);
});

Then('I should see the username and password fields', async ({ loginPage }) => {
  await expect(loginPage.username).toBeVisible();
  await expect(loginPage.username).toBeEditable();
  await expect(loginPage.password).toBeVisible();
  await expect(loginPage.password).toHaveAttribute('type', 'password');
});

Then('I should see the Login button', async ({ loginPage }) => {
  await expect(loginPage.loginButton).toBeVisible();
  await expect(loginPage.loginButton).toBeEnabled();
});

Then('I should see the login error {string}', async ({ loginPage }, message) => {
  await expect(loginPage.error).toBeVisible();
  await expect(loginPage.error).toHaveText(message);
});

Then('I should stay on the login page', async ({ page }) => {
  await expect(page).not.toHaveURL(/inventory\.html/);
});

When('I dismiss the login error', async ({ loginPage }) => {
  await loginPage.dismissError();
});

Then('I should not see a login error', async ({ loginPage }) => {
  await expect(loginPage.error).toBeHidden();
});

// Unlike "I open the Products page", this step drops the session first.
// Saucedemo keeps it in a cookie, so clearing cookies logs the browser out.
When('I go to the Products page without logging in', async ({ page, productsPage }) => {
  await page.context().clearCookies();
  await productsPage.goto();
});

Then('I should be redirected to the login page', async ({ page, loginPage }) => {
  await expect(page).toHaveURL('/');
  await expect(loginPage.loginButton).toBeVisible();
});
