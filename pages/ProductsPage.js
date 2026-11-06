import { parsePrice } from './parsePrice.js';

export class ProductsPage {
  constructor(page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.items = page.locator('[data-test="inventory-item"]');
    this.prices = page.locator('[data-test="inventory-item-price"]');
    this.sortSelect = page.locator('[data-test="product-sort-container"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  // Option label as shown in the dropdown, e.g. "Price (low to high)".
  async sortBy(label) {
    await this.sortSelect.selectOption({ label });
  }

  async itemPrices() {
    return (await this.prices.allTextContents()).map(parsePrice);
  }

  // Each product is a card; filter to the one with this name, then click its own button.
  async addToCart(productName) {
    await this.items
      .filter({ hasText: productName })
      .getByRole('button', { name: 'Add to cart' })
      .click();
  }

  async openCart() {
    await this.cartLink.click();
  }
}
