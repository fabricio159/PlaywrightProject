import { BeforeAll, AfterAll, Before, After, Status } from '@cucumber/cucumber';
import { browserTypes, browserName, baseURL, logIn } from './world.js';

let browser;
let storageState;

/* Log in once and keep the session (cookies + localStorage) for every scenario. */
BeforeAll(async function () {
  browser = await browserTypes[browserName()].launch({ headless: !process.env.HEADED });

  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  await page.goto('/');
  await logIn(page, process.env.SAUCE_USERNAME ?? 'standard_user', process.env.SAUCE_PASSWORD ?? 'secret_sauce');
  await page.waitForURL('**/inventory.html');
  storageState = await context.storageState();
  await context.close();
});

AfterAll(async function () {
  await browser?.close();
});

/*
 * Fresh context + page per scenario, like Playwright's test isolation.
 * Scenarios start logged in; tag a feature or scenario with @logged-out to start with an empty browser.
 */
Before(async function ({ pickle }) {
  const loggedOut = pickle.tags.some((t) => t.name === '@logged-out');
  this.context = await browser.newContext({ baseURL, storageState: loggedOut ? undefined : storageState });
  this.page = await this.context.newPage();
  console.log(`worker ${process.env.CUCUMBER_WORKER_ID} | ${pickle.name}`);
});

After(async function ({ result }) {
  if (result?.status === Status.FAILED) {
    this.attach(await this.page.screenshot(), 'image/png');
  }
  await this.context?.close();
});
