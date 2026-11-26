# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Test-automation project for Swag Labs (saucedemo.com) plus API tests. The same UI scenarios are written three ways: Playwright Test (`tests/`), playwright-bdd (`bdd/`) and Cucumber (`cucumber/`). README.md has the full details; this file covers what you need to work here.

## Commands

```bash
npm install && npx playwright install --with-deps   # first time; also cp .env.example .env

npm test                                 # Playwright Test: browser projects + api project
npm run test:chromium                    # one browser
npx playwright test tests/ui/cart.spec.js --project=chromium   # single file
npx playwright test -g "added product shows in the cart"       # single test by title
npm run test:api                         # API tests only (no browser, no login)
npm run test:bdd                         # bddgen + run playwright-bdd features
cd cucumber && npm install && npm test   # Cucumber suite (separate package)

npm run test:api:mutation                # mutation tests (all mutants); add `-- <name>` for one
MUTANT=<name> npm run test:api           # one mutant with the normal reporters

npm run lint / lint:fix                  # ESLint (flat config, playwright plugin on tests/**)
npm run format / format:check            # Prettier (singleQuote, printWidth 100)

npm run report                           # Playwright HTML report
npm run test:allure                      # clean allure-results, run, generate report
npm run allure:generate && npm run allure:open
```

Env vars (from `.env`, read by all three runners): `BASE_URL`, `API_URL`, `SAUCE_USERNAME`/`SAUCE_PASSWORD`, `BROWSER` (`all` or comma list), `TAGS` (`all` or `@a,@b`, any-match), `JIRA_URL`, `SKIP_API=true` to drop the api project.

## Architecture

### Shared page objects (`pages/`)
- `pages/` is used by all three approaches. It has its own `package.json` with `"type": "module"` so plain Node (Cucumber) can import it as ESM while the root stays `"type": "commonjs"`.
- Page objects are plain classes taking `page`; methods wrap actions in `allure.step()` so steps show in Allure for every runner.
- `pages/index.js` exports `pageFixtures` (one fixture per page object), `allureFixtures` (auto fixture: epic + owner), `startLoggedOut`/`LOGGED_OUT`. Both `tests/fixtures.js` and `bdd/steps/fixtures.js` spread these into `base.extend(...)`. A new page object needs adding to `pageFixtures`, and to `cucumber/support/world.js` for Cucumber.
- Cucumber has no fixtures: its World (`cucumber/support/world.js`) builds the page objects, and steps use `this.page` / the World's pages.

### Login session (storageState)
- Playwright Test and playwright-bdd: the `setup` project (`tests/auth.setup.js`) logs in once and writes `playwright/.auth/user.json` (git-ignored); browser projects depend on it and use it as `storageState`.
- Opt out with the `@logged-out` tag. The fixtures override `storageState` with `LOGGED_OUT` (Playwright Test reads `testInfo.tags`, BDD reads `$tags`). Cucumber does the same in `cucumber/support/hooks.js` (`BeforeAll` logs in, `Before` creates a fresh context per scenario).

### Config layering
- `playwright.config.js` builds projects dynamically: `setup`, the browsers selected by `BROWSER` (with `grep` from `TAGS`, ignoring `tests/api/`), and `api` (its own `testDir`/`baseURL`, no setup dependency). Invalid `BROWSER`/`TAGS`/`API_URL` values throw at config load.
- `playwright.bdd.config.js` spreads the base config, swaps `testDir` for the bddgen output and removes the `api` project. `.features-gen/` is generated: edit `.feature` files and steps, never the generated specs.
- Spec files must import `test`/`expect` from `tests/fixtures.js` (UI) to get page fixtures and Allure defaults; BDD steps import `Given/When/Then` from `bdd/steps/fixtures.js`. API specs import `@playwright/test` directly and set Allure labels in `test.beforeEach`.

### Mutation testing (`mutation/`)
- With `MUTANT` set, the `api` project's `baseURL` points at a local proxy (`mutation/proxy.mjs`, port `MUTATION_PORT`, default 4010) that alters matching responses; Playwright starts it via `webServer` unless `MUTATION_EXTERNAL_PROXY=true` (the runner starts its own).
- `mutation/mutants.mjs` is the only file to edit to add a mutant (`tests` = exact test titles, `match`, `mutate`). Renaming an API test title breaks mutants that reference it.
- `mutation/run.mjs` runs only `tests/api/booking.spec.js` by default (`MUTATION_SPECS` to change) and exits 1 if any mutant survives. Specs that set their own `baseURL` (`tests/api/posts.spec.js`) bypass the proxy.
- Mutation Allure output is separate (`mutation/allurerc.mjs`, `mutation-allure-report/`); in it red/failed means killed (good), yellow means survived. Run it with `npm run test:api:mutation ; npm run mutation:allure:generate` (`;`, not `&&`, because the runner exits 1 on survivors).

### Allure
- Allure 3 CLI (npm `allure`, no Java). Results: `allure-results/` (Playwright + BDD share it and pile up across runs; clean with `npm run allure:clean`), `cucumber/reports/allure-results/`, `mutation-results/allure-results/`. `allure-history.jsonl` keeps trends; don't delete it.
- Per-test labels go in annotations whose `type` is `allure.label.<name>` (or `issue`/`tms`, which link to `JIRA_URL/browse/<id>`). Other types like plain `feature` show as steps, not labels. In BDD, Feature/Scenario names become feature/story (`bdd/steps/fixtures.js`). In Cucumber, `@issue:X` and `@severity:Y` tags map via `cucumber/cucumber.js`.

### CI
`.github/workflows/playwright.yml` has four jobs: `playwright` (`SKIP_API=true` + BDD, combined Allure report), `api`, `mutation` (fails on survivors) and `cucumber`. Each caches its own Allure history per branch. CI has no `.env`; values come from workflow inputs, then repo vars/secrets, then defaults.


### Coding rules
- Methods and locators that **every** page has (e.g. `page`, `goto()`) go in `BasePage`, which pages extend (inheritance). Keep it to that; don't add helpers only some pages use.
- UI sections that appear on **some** pages (header, menu, etc.) go in a component class under `pages/components/`, and pages that have them create it, e.g. `this.header = new Header(page)` (composition).
- All shared locators will be shared through Playwright's fixtures
- Only update the specified way we are working into. Playwright Native, Playwright BDD and Cucumber. If not specified, ask for specification.
- 