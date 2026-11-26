import * as allure from 'allure-js-commons';

export class BasePage {
    constructor(page) {
        this.page = page;
        this.title = page.locator('[data-test="title"]');

    }
    async goto(path) {
        await allure.step(`Open the ${path} page`, () => this.page.goto(path));

    }
}