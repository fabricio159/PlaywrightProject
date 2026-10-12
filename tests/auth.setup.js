import path from 'path';
import { test as setup, expect } from '@playwright/test';

const authFile = path.resolve(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill(process.env.SAUCE_USERNAME ?? 'standard_user');
  await page.getByPlaceholder('Password').fill(process.env.SAUCE_PASSWORD ?? 'secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/inventory.html');

  await page.context().storageState({ path: authFile });
});
