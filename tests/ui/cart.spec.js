import { test, expect } from '../fixtures.js';

// Starts logged in through storageState, with an empty cart.
// Annotations named allure.label.<name> become Allure labels (see README "Allure report").
test(
  'added product shows in the cart',
  {
    tag: '@cart',
    annotation: [
      { type: 'allure.label.feature', description: 'Cart' },
      { type: 'allure.label.story', description: 'Add a product to the cart' },
      { type: 'allure.label.severity', description: 'critical' },
    ],
  },
  async ({ page, productsPage, cartPage }) => {
    await productsPage.goto();
    await productsPage.addToCart('Sauce Labs Backpack');
    await expect(productsPage.cartBadge).toHaveText('1');

    await productsPage.openCart();

    await expect(page).toHaveURL('/cart.html');
    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.itemNames).toHaveText(['Sauce Labs Backpack']);
  },
);
