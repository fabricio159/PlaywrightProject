import { Before } from '@cucumber/cucumber';
import * as allure from 'allure-js-commons';
/* Registers the Allure runtime, so allure.* calls (here and in the shared page objects) reach the report */
import 'allure-cucumberjs';

/*
 * Labels shared by every scenario, like pages/allure.js does for Playwright.
 * allure-cucumberjs already sets feature (Feature name) and tags from Gherkin.
 */
Before({ name: 'Allure labels' }, async function () {
  await allure.epic('SauceDemo');
  await allure.owner('Fabricio Sanjines');
});
