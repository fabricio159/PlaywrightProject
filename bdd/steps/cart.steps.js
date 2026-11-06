import { expect } from '@playwright/test';
import { When, Then } from './fixtures.js';

When('I add {string} to the cart', async ({ productsPage }, productName) => {
  await productsPage.addToCart(productName);
});

Then('the cart badge should show {int}', async ({ productsPage }, count) => {
  await expect(productsPage.cartBadge).toHaveText(String(count));
});

When('I open the cart', async ({ productsPage }) => {
  await productsPage.openCart();
});

Then('the cart should contain {string}', async ({ page, cartPage }, productName) => {
  await expect(page).toHaveURL('/cart.html');
  await expect(cartPage.title).toHaveText('Your Cart');
  await expect(cartPage.itemNames).toHaveText([productName]);
});
