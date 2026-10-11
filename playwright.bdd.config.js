import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import baseConfig from './playwright.config.js';

/**
 * BDD tests (Gherkin .feature files) using playwright-bdd.
 * Reuses everything from playwright.config.js (baseURL, BROWSER, reporter, ...)
 * and only swaps the test directory for the generated BDD tests.
 * https://vitalets.github.io/playwright-bdd
 */
const testDir = defineBddConfig({
  features: 'bdd/features/**/*.feature',
  steps: 'bdd/steps/**/*.js',
});

export default defineConfig({
  ...baseConfig,
  testDir,
});
