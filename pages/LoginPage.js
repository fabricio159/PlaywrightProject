import * as allure from 'allure-js-commons';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.error = page.locator('[data-test="error"]');
  }

  async goto() {
    await allure.step('Open the login page', () => this.page.goto('/'));
  }

  async login(username, password) {
    await allure.step(`Log in as ${username}`, async () => {
      await this.username.fill(username);
      await this.password.fill(password);
      await this.loginButton.click();
    });
  }
}
