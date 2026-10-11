import { BeforeAll, AfterAll, Before, After, Status } from '@cucumber/cucumber';
import { browserTypes, browserName } from './world.js';

let browser;

BeforeAll(async function () {
  browser = await browserTypes[browserName()].launch({ headless: !process.env.HEADED });
});

AfterAll(async function () {
  await browser?.close();
});

/* Fresh context + page per scenario, like Playwright's test isolation. */
Before(async function () {
  this.context = await browser.newContext({ baseURL: this.baseURL });
  this.page = await this.context.newPage();
});

After(async function ({ result }) {
  if (result?.status === Status.FAILED) {
    this.attach(await this.page.screenshot(), 'image/png');
  }
  await this.context?.close();
});
