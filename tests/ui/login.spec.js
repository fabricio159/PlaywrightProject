import { test, expect } from '../fixtures.js';

// @logged-out: this test fills the login form, so it starts with an empty browser.
test(
  'standard_user can log in and lands on Products',
  { tag: ['@login', '@logged-out'] },
  async ({ page, loginPage, productsPage }) => {
    await loginPage.goto();
    await loginPage.login(
      process.env.SAUCE_USERNAME ?? 'standard_user',
      process.env.SAUCE_PASSWORD ?? 'secret_sauce',
    );

    await expect(page).toHaveURL('/inventory.html');
    await expect(productsPage.title).toHaveText('Products');
  },
);
