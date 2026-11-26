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
    await productsPage.goto('/inventory.html');
    await productsPage.addToCart('Sauce Labs Backpack');
    await expect(productsPage.header.cartLink).toHaveText('1');

    await productsPage.header.openCart();

    await expect(page).toHaveURL('/cart.html');
    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.itemNames).toHaveText(['Sauce Labs Backpack']);
  },
);

test(
  'Remvoed Product is reflected in the cart',
  {
    tag: '@cart',
    annotation: [
      { type: 'allure.label.feature', description: 'Cart' },
      { type: 'allure.label.story', description: 'Add a product to the cart' },
      { type: 'allure.label.severity', description: 'critical' },
    ],
  },
  async ({page, cartPage, productsPage}) => {
    await productsPage.goto('/inventory.html');
    await productsPage.addToCart('Sauce Labs Bike Light');
    await expect(productsPage.header.cartBadge).toHaveText('1');

    await productsPage.removeFromCart('Sauce Labs Bike Light');

    await productsPage.header.openCart();

    await expect(page).toHaveURL('/cart.html');
    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.itemNames).toHaveCount(0);
  }
)
