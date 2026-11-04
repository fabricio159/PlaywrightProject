import { test, expect } from '@playwright/test';

// Request mocking on Saucedemo: the login page sends an analytics request we can intercept.
// Routes must be registered before page.goto, or the requests have already gone out.

// Start logged out: the analytics request only fires on a fresh, logged-out load of '/'.
test.use({ storageState: { cookies: [], origins: [] } });

test('analytics gets a fake response (route.fulfill)', { tag: '@MockedTest' }, async ({ page }) => {
  await page.route('**/events.backtrace.io/**', (route) =>
    route.fulfill({ status: 200, json: { mocked: true } }),
  );

  // Check what the page sent: method and that it has a body.
  const analytics = page.waitForRequest('**/events.backtrace.io/**');
  await page.goto('/');
  const request = await analytics;

  expect(request.method()).toBe('POST');
  expect(request.postData()).toBeTruthy();
  expect((await request.response()).status()).toBe(200);
});
