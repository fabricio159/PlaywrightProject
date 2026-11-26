import * as allure from 'allure-js-commons';

export class Header {
    constructor(page) {
        this.page = page;
        this.cartLink = page.locator('[data-test="shopping-cart-link"]');
        this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    }

    async openCart () {
        await allure.step('User Opens the Cart', () => this.cartLink.click());
    }
}