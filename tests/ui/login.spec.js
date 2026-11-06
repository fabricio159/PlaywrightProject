import { test, expect } from '../fixtures.js';

const USERNAME = process.env.SAUCE_USERNAME ?? 'standard_user';
const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

// @logged-out: these tests fill the login form, so they start with an empty browser.
test.describe('Login page', { tag: ['@login', '@logged-out'] }, () => {
  test('standard_user can log in and lands on Products', async ({
    page,
    loginPage,
    productsPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(USERNAME, PASSWORD);

    await expect(page).toHaveURL('/inventory.html');
    await expect(productsPage.title).toHaveText('Products');
  });

  // Each case submits the form and stays on the login page with an error.
  const invalidLogins = [
    {
      name: 'locked_out_user is blocked',
      username: 'locked_out_user',
      password: PASSWORD,
      error: 'Epic sadface: Sorry, this user has been locked out.',
    },
    {
      name: 'wrong password is rejected',
      username: USERNAME,
      password: 'wrong_password',
      error: 'Epic sadface: Username and password do not match any user in this service',
    },
    {
      name: 'empty username is required',
      username: '',
      password: PASSWORD,
      error: 'Epic sadface: Username is required',
    },
    {
      name: 'empty password is required',
      username: USERNAME,
      password: '',
      error: 'Epic sadface: Password is required',
    },
  ];

  for (const { name, username, password, error } of invalidLogins) {
    test(name, async ({ page, loginPage }) => {
      await loginPage.goto();
      await loginPage.login(username, password);

      await expect(loginPage.error).toHaveText(error);
      await expect(page).toHaveURL('/');
    });
  }

  test('error message can be dismissed', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('locked_out_user', PASSWORD);
    await expect(loginPage.error).toBeVisible();

    await loginPage.dismissErrorButton.click();

    await expect(loginPage.error).toBeHidden();
  });

  test('protected page redirects to login when logged out', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await expect(page).toHaveURL('/');
    await expect(loginPage.error).toHaveText(
      "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    );
  });
});
