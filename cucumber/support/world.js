import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { World, setWorldConstructor, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit } from '@playwright/test';

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

/** Per-scenario state shared by steps through `this` (context and page are set in hooks.js). */
class CustomWorld extends World {
  baseURL = process.env.BASE_URL ?? 'https://playwright.dev';
}

setWorldConstructor(CustomWorld);
