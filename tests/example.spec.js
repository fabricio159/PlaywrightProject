import { test, expect } from '@playwright/test';

// These tests exercise the login form, so start logged out.
test.use({ storageState: { cookies: [], origins: [] } });

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('Swag Labs');
});

test('login as standard_user', async ({ page }) => {
  await page.goto('/');

  // Fill in the credentials from .env and submit the login form.
  await page.getByPlaceholder('Username').fill(process.env.SAUCE_USERNAME ?? 'standard_user');
  await page.getByPlaceholder('Password').fill(process.env.SAUCE_PASSWORD ?? 'secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  // Expects to land on the inventory page with the Products title.
  await expect(page).toHaveURL('/inventory.html');
  await expect(page.locator('[data-test="title"]')).toHaveText('Products');
});
