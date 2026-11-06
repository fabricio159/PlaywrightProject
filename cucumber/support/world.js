import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { World, setWorldConstructor, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { ProductsPage } from '../../pages/ProductsPage.js';
import { CartPage } from '../../pages/CartPage.js';

/* Reuse the project's root .env (BASE_URL, SAUCE_USERNAME, BROWSER, ...) */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(root, '.env'), quiet: true });

setDefaultTimeout(30_000);

export const browserTypes = { chromium, firefox, webkit };

/**
 * One browser per run. BROWSER may be a single name; "all" or empty means chromium,
 * since cucumber has no equivalent of Playwright projects.
 */
export function browserName() {
  const name = (process.env.BROWSER ?? '').trim().toLowerCase();
  if (!name || name === 'all') return 'chromium';
  if (!(name in browserTypes)) {
    throw new Error(`Unsupported BROWSER for cucumber: ${name}. Use one of: ${Object.keys(browserTypes).join(', ')}`);
  }
  return name;
}

export const baseURL = process.env.BASE_URL ?? 'https://playwright.dev';

export async function logIn(page, username, password) {
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

/**
 * Per-scenario state shared by steps through `this` (context and page are set in hooks.js).
 * Page objects (shared with ../tests and ../bdd) are lazy getters: each one is created the first
 * time a step reads it, then reused for the rest of the scenario. Cucumber builds a new World per
 * scenario, so nothing leaks between scenarios.
 */
class CustomWorld extends World {
  get loginPage() {
    return (this._loginPage ??= new LoginPage(this.page));
  }

  get productsPage() {
    return (this._productsPage ??= new ProductsPage(this.page));
  }

  get cartPage() {
    return (this._cartPage ??= new CartPage(this.page));
  }
}

setWorldConstructor(CustomWorld);
