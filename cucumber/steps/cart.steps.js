import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// this.productsPage / this.cartPage are lazy getters on the World (support/world.js).
When('I add {string} to the cart', async function (productName) {
  await this.productsPage.addToCart(productName);
});

Then('the cart badge should show {int}', async function (count) {
  await expect(this.productsPage.cartBadge).toHaveText(String(count));
});

When('I open the cart', async function () {
  await this.productsPage.openCart();
});

Then('the cart should contain {string}', async function (productName) {
  await expect(this.page).toHaveURL('/cart.html');
  await expect(this.cartPage.title).toHaveText('Your Cart');
  await expect(this.cartPage.itemNames).toHaveText([productName]);
});
