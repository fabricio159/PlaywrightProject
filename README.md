# PlaywrightProject

UI tests for [Swag Labs (saucedemo.com)](https://www.saucedemo.com/), written three ways, plus API tests (see [4. API tests](#4-api-tests)):

| Approach | Location | Runner |
| --- | --- | --- |
| 1. Playwright Test | `tests/` | `@playwright/test` |
| 2. BDD with playwright-bdd | `bdd/` | `playwright-bdd` + `@playwright/test` |
| 3. BDD with Cucumber | `cucumber/` | `@cucumber/cucumber` + Playwright library |

All three cover the same scenarios: the page title is "Swag Labs", `standard_user` can log in and land on the Products page, and the Products page lists 6 items.

## Login session (storageState)

Each approach logs in **once per run**, saves the session (cookies + localStorage) with `storageState`, and starts every test already logged in. Tests that check the login form opt out and start with an empty browser.

| Approach | Logs in once | Opt out of the session |
| --- | --- | --- |
| Playwright Test | `tests/auth.setup.js` (the `setup` project, saved to `playwright/.auth/user.json`) | `test.use({ storageState: { cookies: [], origins: [] } })` |
| playwright-bdd | same `setup` project (via `playwright.bdd.config.js`) | tag the feature/scenario `@logged-out` (`bdd/steps/fixtures.js`) |
| Cucumber | `BeforeAll` in `cucumber/support/hooks.js` (kept in memory) | tag the feature/scenario `@logged-out` |

If the session is missing or expired, the Products checks fail with `Session expired or missing: storageState is stale`. `playwright/.auth/` is git-ignored because it holds session cookies.

## Prerequisites

- Node.js (LTS)
- Dependencies and browsers:

  ```bash
  npm install
  npx playwright install --with-deps
  ```

- Environment file: copy `.env.example` to `.env` and adjust it if needed. All three approaches read it.

  ```bash
  cp .env.example .env
  ```

  | Variable | Purpose | Default |
  | --- | --- | --- |
  | `BASE_URL` | Site under test | `https://playwright.dev` (set to saucedemo in `.env.example`) |
  | `API_URL` | API under test for `tests/api` | `https://restful-booker.herokuapp.com` |
  | `SAUCE_USERNAME` / `SAUCE_PASSWORD` | Login credentials | `standard_user` / `secret_sauce` |
  | `BROWSER` | `all`, `chromium`, `firefox`, `webkit` (comma-separated) | `all` |
  | `TAGS` | `all`, or tags like `@smoke,@login` (comma-separated, runs tests with any of them) | `all` |
  | `JIRA_URL` | Jira site for Allure issue links | `https://your-site.atlassian.net` |

## 1. Playwright Test

Specs live in `tests/` and use `playwright.config.js`. The `setup` project (`tests/auth.setup.js`) runs first; browser projects depend on it.

```bash
npm test                 # all browsers selected by BROWSER
npm run test:headed      # with a visible browser
npm run test:ui          # Playwright UI mode
npm run test:chromium    # chromium only
npm run report           # open the last HTML report
npm run test:allure      # clean allure-results, run the tests, build allure-report/
npm run allure:open      # open the Allure report
```

## 2. BDD with playwright-bdd

Features are in `bdd/features/` and step definitions in `bdd/steps/`. Steps import `Given/When/Then` from `bdd/steps/fixtures.js`. `playwright.bdd.config.js` reuses `playwright.config.js` and swaps in the generated tests.

```bash
npm run test:bdd         # generate specs, then run them
npm run test:bdd:headed
npm run test:bdd:ui
```

Each run first calls `bddgen`, which turns the `.feature` files into specs under `.features-gen/`. That folder is generated and git-ignored, so don't edit it; change the `.feature` or step files instead. Results go to the same HTML report (`npm run report`).

## 3. BDD with Cucumber

`cucumber/` is a self-contained package with its own `package.json`.

```
cucumber/
├── cucumber.js          # Cucumber config
├── features/            # .feature files
├── steps/               # step definitions (use this.page)
└── support/
    ├── world.js         # custom World, loads ../.env
    └── hooks.js         # browser + login per run, fresh context/page per scenario
```

```bash
cd cucumber
npm install              # first time only
npm test                 # headless
npm run test:headed      # with a visible browser
```

The HTML report is written to `cucumber/reports/cucumber-report.html`. Failed scenarios get a screenshot attached.

Notes:
- `BROWSER` takes a single browser here; empty or `all` means chromium. To run another browser: `BROWSER=firefox npm test`.
- Scenarios run one at a time (no parallel workers).

## 4. API tests

Specs live in `tests/api/` and use the built-in `request` fixture to send HTTP calls to `API_URL`. They run in their own `api` project in `playwright.config.js`:

- no browser is opened, and the `setup` login does not run first
- they run once, not once per browser, and `BROWSER` does not filter them out
- `TAGS` still applies (the samples are tagged `@api`)
- browser projects ignore `tests/api/`, and BDD runs leave the `api` project out

```bash
npm run test:api         # API tests only
npm test                 # browser tests + API tests
```

Paths in requests are relative to `API_URL`, e.g. `request.get('/booking/1')`. A spec that targets a different API overrides it with `test.use({ baseURL })` (see `tests/api/posts.spec.js`). Results go to the same HTML report.

## Allure report

Every runner also writes [Allure](https://allurereport.org/) results. The CLI is Allure 3 (the `allure` npm package), so Java isn't needed.

| Approach | Reporter | Results | Report |
| --- | --- | --- | --- |
| Playwright Test + playwright-bdd | `allure-playwright` (in `playwright.config.js`) | `allure-results/` | `allure-report/` |
| Cucumber | `allure-cucumberjs/reporter` (in `cucumber/cucumber.js`) | `cucumber/reports/allure-results/` | `cucumber/reports/allure-report/` |

```bash
npm run test:allure                          # clean results, run Playwright tests, generate the report
npm run allure:clean                         # results pile up across runs: clean before a fresh run
npm run test:bdd && npm run allure:generate  # results from several runs end up in one report
npm run allure:open
cd cucumber && npm test && npm run allure:generate && npm run allure:open
```

`allurerc.mjs` (and `cucumber/allurerc.mjs`) hold the report settings. `historyPath` (`allure-history.jsonl`, git-ignored; `cucumber/reports/allure-history.jsonl` for Cucumber) keeps a summary of the last 50 generated reports, so reports show trends, flaky tests and a History tab per test. Don't delete it between runs. Failed tests get their screenshot, video and error context attached; traces are attached on retries.

### Metadata

Labels decide where tests appear (Behaviors tab: epic → feature → story) and what you can filter on.

| What | Where |
| --- | --- |
| Epic and owner for every UI test | auto fixture in `pages/allure.js` (`tests/fixtures.js` and `bdd/steps/fixtures.js` include it); `cucumber/support/allure.js` for Cucumber |
| Feature, story, severity per test | annotations named `allure.label.<name>` (see `tests/ui/*.spec.js`) |
| Feature and story for BDD | taken from the Feature and Scenario names (`bdd/steps/fixtures.js`; built into allure-cucumberjs) |
| Specs that import `@playwright/test` directly | `test.beforeEach` calling `allure.epic()` / `allure.feature()` (see `tests/api/*.spec.js`) |
| Steps | page-object methods are wrapped in `allure.step()`; Playwright's own steps are included too (`detail: true`) |
| Tags | Playwright and Gherkin tags (`@smoke`) become Allure tags automatically |

```js
test(
  'checkout',
  {
    tag: '@smoke',
    annotation: [
      { type: 'allure.label.feature', description: 'Checkout' },
      { type: 'allure.label.severity', description: 'critical' }, // blocker, critical, normal, minor, trivial
      { type: 'issue', description: 'SCRUM-24' }, // link: JIRA_URL/browse/SCRUM-24
    ],
  },
  async ({ page }) => { ... },
);
```

An annotation's `type` must be `allure.label.<name>` (or `issue`, `tms`, `description`). Any other type, like plain `feature`, shows up as a step instead of a label. Inside a test, `import * as allure from 'allure-js-commons'` works too: `await allure.severity('critical')`, `await allure.parameter('user', name)`, `await allure.attachment('body', json, 'application/json')`.

For Cucumber, the Gherkin tags `@issue:SCRUM-24` and `@severity:critical` become a Jira link and the severity label (`formatOptions` in `cucumber/cucumber.js`).

## CI

`.github/workflows/playwright.yml` runs approach 1 (`npx playwright test` with `SKIP_API=true`) and, in a separate `api` job with no browser install, the API tests (`npm run test:api`), on pushes and pull requests to `main`/`master`. The `playwright` job also runs the BDD suite, and a `cucumber` job runs the Cucumber suite.

Each job also generates an Allure report and uploads it as an artifact: `allure-report` (Playwright + BDD combined), `api-allure-report`, and the Allure report inside `cucumber-report`. Allure history is kept between CI runs with `actions/cache`. Each job restores the newest `allure-history.jsonl` before its tests run and saves it again after generating the report, so downloaded reports show trends, flaky tests and per-test history. Notes:
- Each job (`playwright`, `api`, `cucumber`) has its own history, keyed per branch. A new branch starts from another branch's history (PRs can read master's).
- Caches that aren't used for 7 days are deleted by GitHub, and the history is lost with them.
- Manual runs with a different browser or tags go into the same history.
