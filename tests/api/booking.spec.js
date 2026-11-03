import { test, expect } from '@playwright/test';

// Restful-Booker (API_URL): https://restful-booker.herokuapp.com/apidoc/index.html

const newBooking = {
  firstname: 'Jim',
  lastname: 'Brown',
  totalprice: 111,
  depositpaid: true,
  bookingdates: { checkin: '2026-01-01', checkout: '2026-01-05' },
  additionalneeds: 'Breakfast',
};

test('POST /booking creates a booking', { tag: ['@api', '@booking'] }, async ({ request }) => {
  const res = await request.post('/booking', { data: newBooking });

  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.bookingid).toEqual(expect.any(Number));
  expect(body.booking).toEqual(newBooking);
});

test('GET /booking/:id returns the booking', { tag: ['@api', '@booking'] }, async ({ request }) => {
  // The demo server resets its data often, so create our own booking instead of guessing an id.
  const created = await request.post('/booking', { data: newBooking });
  expect(created.ok()).toBeTruthy();
  const { bookingid } = await created.json();

  const res = await request.get(`/booking/${bookingid}`);

  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual(newBooking);
});
