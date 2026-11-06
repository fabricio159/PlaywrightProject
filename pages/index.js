import { LoginPage } from './LoginPage.js';
import { ProductsPage } from './ProductsPage.js';
import { CartPage } from './CartPage.js';

const LOGGED_OUT = { cookies: [], origins: [] };

/**
 * Fixtures shared by the Playwright Test specs (tests/fixtures.js) and
 * the playwright-bdd steps (bdd/steps/fixtures.js). A test asks for the pages it needs by name.
 */
export const pageFixtures = {
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
};

/** Tests start logged in through storageState; tag them @logged-out to start with an empty browser. */
export const startLoggedOut = (tags) => tags.includes('@logged-out');
export { LOGGED_OUT };
