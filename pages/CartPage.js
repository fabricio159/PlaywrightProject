export class CartPage {
  constructor(page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.items = page.locator('[data-test="inventory-item"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
  }

  async goto() {
    await this.page.goto('/cart.html');
  }
}
