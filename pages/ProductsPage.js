import * as allure from 'allure-js-commons';
import { parsePrice } from './parsePrice.js';
import { BasePage } from './BasePage.js';
import { Header } from './Header.js';

export class ProductsPage extends BasePage {
  constructor(page) {
    super(page);
    this.items = page.locator('[data-test="inventory-item"]');
    this.prices = page.locator('[data-test="inventory-item-price"]');
    this.sortSelect = page.locator('[data-test="product-sort-container"]');
    this.header = new Header(page);
  }

  // Option label as shown in the dropdown, e.g. "Price (low to high)".
  async sortBy(label) {
    await allure.step(`Sort products by "${label}"`, () => this.sortSelect.selectOption({ label }));
  }

  async itemPrices() {
    return (await this.prices.allTextContents()).map(parsePrice);
  }

  // Each product is a card; filter to the one with this name, then click its own button.
  async addToCart(productName) {
    await allure.step(`Add "${productName}" to the cart`, () =>
      this.items
        .filter({ hasText: productName })
        .getByRole('button', { name: 'Add to cart' })
        .click(),
    );
  }

  async removeFromCart(productName) {
    await allure.step(`Remove "${productName}" from the cart`, () =>
      this.items
        .filter({ hasText: productName })
        .getByRole('button', { name: 'Remove'})
        .click(),
    )
  }

  async openCart() {
    await allure.step('Open the cart', () => this.cartLink.click());
  }
}
