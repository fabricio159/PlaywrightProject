import { test, expect } from '../fixtures.js';

test(
  'login page loads with title, username and password fields, and Login button',
  { tag: ['@login', '@smoke', '@logged-out'] },
  async ({ page, loginPage }) => {
    await loginPage.goto();

    await expect(page).toHaveTitle('Swag Labs');
    await expect(loginPage.username).toBeVisible();
    await expect(loginPage.username).toBeEditable();
    await expect(loginPage.password).toBeVisible();
    await expect(loginPage.password).toHaveAttribute('type', 'password');
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();
  },
);

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

test(
  'login with a wrong password shows an error message',
  { tag: ['@login', '@logged-out'] },
  async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(process.env.SAUCE_USERNAME ?? 'standard_user', 'wrong_password');

    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toHaveText(
      'Epic sadface: Username and password do not match any user in this service',
    );
    await expect(page).not.toHaveURL(/inventory\.html/);
  },
);

test(
  'login with an unknown username shows an error message',
  { tag: ['@login', '@logged-out'] },
  async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('unknown_user', process.env.SAUCE_PASSWORD ?? 'secret_sauce');

    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toHaveText(
      'Epic sadface: Username and password do not match any user in this service',
    );
    await expect(page).not.toHaveURL(/inventory\.html/);
  },
);

test(
  "login with an empty username shows 'Username is required'",
  { tag: ['@login', '@logged-out'] },
  async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', process.env.SAUCE_PASSWORD ?? 'secret_sauce');

    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toHaveText('Epic sadface: Username is required');
    await expect(page).not.toHaveURL(/inventory\.html/);
  },
);

test(
  "login with an empty password shows 'Password is required'",
  { tag: ['@login', '@logged-out'] },
  async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(process.env.SAUCE_USERNAME ?? 'standard_user', '');

    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toHaveText('Epic sadface: Password is required');
    await expect(page).not.toHaveURL(/inventory\.html/);
  },
);

test(
  'login with locked_out_user shows a locked-out error',
  { tag: ['@login', '@logged-out'] },
  async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('locked_out_user', process.env.SAUCE_PASSWORD ?? 'secret_sauce');

    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toHaveText(
      'Epic sadface: Sorry, this user has been locked out.',
    );
    await expect(page).not.toHaveURL(/inventory\.html/);
  },
);

test('error message can be dismissed', { tag: ['@login', '@logged-out'] }, async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login('', '');
  await expect(loginPage.error).toBeVisible();

  await loginPage.dismissError();

  await expect(loginPage.error).toBeHidden();
  await expect(loginPage.loginButton).toBeVisible();
});

test(
  'accessing /inventory.html without logging in redirects to login with an error',
  { tag: ['@login', '@logged-out'] },
  async ({ page, loginPage, productsPage }) => {
    await productsPage.goto();

    await expect(page).toHaveURL('/');
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.error).toHaveText(
      "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    );
  },
);

/**
 * Saucedemo's special users can all log in; each one breaks something else on purpose.
 * The quirks are not tested here (they show up after login), only noted in the report.
 */
const specialUsers = [
  {
    username: 'problem_user',
    quirk: 'Every product shows the same image; sorting and some Add/Remove buttons do not work.',
  },
  {
    username: 'performance_glitch_user',
    quirk: 'Login and page loads are slow (about 5 seconds).',
  },
  {
    username: 'error_user',
    quirk: 'Some actions fail, e.g. adding some products to the cart or finishing checkout.',
  },
  {
    username: 'visual_user',
    quirk: 'Visual bugs: misaligned elements, wrong images and prices.',
  },
];

for (const { username, quirk } of specialUsers) {
  test(
    `special user ${username} can log in`,
    {
      tag: ['@login', '@logged-out', '@special-users'],
      annotation: { type: 'Known quirk', description: quirk },
    },
    async ({ page, loginPage, productsPage }) => {
      await loginPage.goto();
      await loginPage.login(username, process.env.SAUCE_PASSWORD ?? 'secret_sauce');

      // Longer waits for performance_glitch_user: its login and page load take about 5 seconds.
      await expect(page).toHaveURL('/inventory.html', { timeout: 15_000 });
      await expect(productsPage.title).toHaveText('Products', { timeout: 15_000 });
    },
  );
}
