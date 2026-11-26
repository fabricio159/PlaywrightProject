// Mutants for the REST API tests (tests/api/booking.spec.js).
//
// Each mutant breaks one thing in one kind of response. The mutation proxy (proxy.mjs)
// applies a single mutant per run; the runner (run.mjs) goes through all of them.
//
//   tests   Titles of the tests this mutant is meant for. The runner runs only those (--grep),
//           so other tests that call the same path cannot "kill" it by failing in setup.
//           Leave it out to run every API test.
//   match   ({ method, path, body }) => boolean. path has no query string; body is the parsed request JSON.
//   mutate  (res) => void. Changes res.status and/or res.body (the parsed response JSON) in place.
//
// A mutant is "killed" when at least one of its tests fails, and "survived" when they all pass.
// A survivor is a bug the tests would miss: tighten the assertion it got past.

const POST_TEST = 'POST /booking creates a booking';
const GET_TEST = 'GET /booking/:id returns the booking';

const createBooking = ({ method, path }) => method === 'POST' && path === '/booking';
const getBooking = ({ method, path }) => method === 'GET' && /^\/booking\/\d+$/.test(path);

export const mutants = {
  // POST /booking: both tests call it (the GET test creates its own booking first).

  'post-status-500': {
    tests: [POST_TEST],
    match: createBooking,
    mutate: (res) => {
      res.status = 500;
    },
  },
  'post-bookingid-as-string': {
    tests: [POST_TEST],
    match: createBooking,
    mutate: (res) => {
      res.body.bookingid = String(res.body.bookingid);
    },
  },
  'post-price-off-by-one': {
    tests: [POST_TEST],
    match: createBooking,
    mutate: (res) => {
      res.body.booking.totalprice += 1;
    },
  },
  'post-depositpaid-flipped': {
    tests: [POST_TEST],
    match: createBooking,
    mutate: (res) => {
      res.body.booking.depositpaid = !res.body.booking.depositpaid;
    },
  },
  // Aimed at both tests: the POST test should kill it; the GET test should pass,
  // because its setup only needs a successful response with a bookingid.
  'post-additionalneeds-dropped': {
    tests: [POST_TEST, GET_TEST],
    match: createBooking,
    mutate: (res) => {
      delete res.body.booking.additionalneeds;
    },
  },

  // GET /booking/:id: only the GET test calls it. Its setup POST passes through unchanged.

  'get-status-404': {
    tests: [GET_TEST],
    match: getBooking,
    mutate: (res) => {
      res.status = 404;
    },
  },
  'get-firstname-changed': {
    tests: [GET_TEST],
    match: getBooking,
    mutate: (res) => {
      res.body.firstname = 'Mutated';
    },
  },
  'get-checkout-date-changed': {
    tests: [GET_TEST],
    match: getBooking,
    mutate: (res) => {
      res.body.bookingdates.checkout = '2026-01-06';
    },
  },
  'get-extra-field': {
    tests: [GET_TEST],
    match: getBooking,
    mutate: (res) => {
      res.body.role = 'admin';
    },
  },
};
