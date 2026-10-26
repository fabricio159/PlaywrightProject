import { test, expect } from '@playwright/test';

// JSONPlaceholder: https://jsonplaceholder.typicode.com
// This file targets a different API than API_URL, so it overrides baseURL.
// No browser is opened and no login is needed.
test.use({ baseURL: 'https://jsonplaceholder.typicode.com' });

test('GET /posts/1 returns the post', { tag: ['@api', '@smoke'] }, async ({ request }) => {
  const res = await request.get('/posts/1');

  expect(res.status()).toBe(200);
  const post = await res.json();
  expect(post).toMatchObject({ id: 1, userId: 1 });
  expect(typeof post.title).toBe('string');
});

test('GET /posts?userId=1 filters by user', { tag: '@api' }, async ({ request }) => {
  const res = await request.get('/posts', { params: { userId: 1 } });

  expect(res.ok()).toBeTruthy();
  const posts = await res.json();
  expect(posts.length).toBeGreaterThan(0);
  for (const post of posts) {
    expect(post.userId).toBe(1);
  }
});

test('POST /posts creates a post', { tag: '@api' }, async ({ request }) => {
  const newPost = { title: 'Hello', body: 'Created by Playwright', userId: 1 };
  const res = await request.post('/posts', { data: newPost });

  expect(res.status()).toBe(201);
  const created = await res.json();
  expect(created).toMatchObject(newPost);
  expect(created.id).toBeDefined();
});

test('GET /posts/9999 returns 404', { tag: '@api' }, async ({ request }) => {
  const res = await request.get('/posts/9999');

  expect(res.status()).toBe(404);
});
