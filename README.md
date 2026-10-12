# PlaywrightProject

UI tests for [Swag Labs (saucedemo.com)](https://www.saucedemo.com/), written three ways:

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
  | `SAUCE_USERNAME` / `SAUCE_PASSWORD` | Login credentials | `standard_user` / `secret_sauce` |
  | `BROWSER` | `all`, `chromium`, `firefox`, `webkit` (comma-separated) | `all` |

## 1. Playwright Test

Specs live in `tests/` and use `playwright.config.js`. The `setup` project (`tests/auth.setup.js`) runs first; browser projects depend on it.

```bash
npm test                 # all browsers selected by BROWSER
npm run test:headed      # with a visible browser
npm run test:ui          # Playwright UI mode
npm run test:chromium    # chromium only
npm run report           # open the last HTML report
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

## CI

`.github/workflows/playwright.yml` runs approach 1 (`npx playwright test`) on pushes and pull requests to `main`/`master`. The BDD and Cucumber suites are not run in CI yet.
