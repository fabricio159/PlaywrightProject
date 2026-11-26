import * as allure from 'allure-js-commons';
import { Header } from './Header';


export class LazyLoadPage {
    constructor(page) {
        this.page = page;
        this.title = page.locator('[data-test="title"]');
        this.items = page.locator('[class="dynamic_catalog_card"]');
        this.header = new Header(page);
    }

    async goto() {
        await allure.step('Open Lazy Load page', () => this.page.goto('/dynamic-catalog-lazy-load.html'));
    }
}