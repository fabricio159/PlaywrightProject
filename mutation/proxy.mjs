// Mutation proxy: forwards every request to the real API (API_URL) and applies one mutant
// (MUTANT, from mutants.mjs) to the matching responses. Everything else passes through unchanged.
//
// Started by Playwright's webServer when MUTANT is set (see playwright.config.js),
// or by run.mjs, which starts one proxy per mutant.
//
// GET /__mutation reports { mutant, hits, errors } so the runner can tell
// "the tests passed" apart from "the mutant never matched a request".

import http from 'node:http';
import { mutants } from './mutants.mjs';

const name = process.env.MUTANT;
const upstream = (process.env.API_URL ?? 'https://restful-booker.herokuapp.com').replace(
  /\/+$/,
  '',
);
const port = Number(process.env.MUTATION_PORT ?? 4010);

const mutant = mutants[name];
if (!mutant) {
  console.error(`Unknown MUTANT "${name}". Options: ${Object.keys(mutants).join(', ')}`);
  process.exit(1);
}

const stats = { mutant: name, hits: 0, errors: [] };

// Hop-by-hop and encoding headers are not forwarded: fetch decompresses the body itself.
const skipHeaders = new Set(['host', 'connection', 'content-length', 'accept-encoding']);

const parseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

http
  .createServer(async (req, res) => {
    if (req.url === '/__mutation') {
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(stats));
      return;
    }

    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const rawBody = Buffer.concat(chunks);

      const headers = Object.fromEntries(
        Object.entries(req.headers).filter(([key]) => !skipHeaders.has(key)),
      );
      const upstreamRes = await fetch(upstream + req.url, {
        method: req.method,
        headers,
        body: rawBody.length ? rawBody : undefined,
      });

      const text = await upstreamRes.text();
      const response = { status: upstreamRes.status, body: parseJSON(text) };
      const request = {
        method: req.method,
        path: req.url.split('?')[0],
        body: parseJSON(rawBody.toString()),
      };

      let out = text;
      if (response.body !== undefined && mutant.match(request)) {
        try {
          mutant.mutate(response);
          stats.hits += 1;
          out = JSON.stringify(response.body);
        } catch (err) {
          // The response did not have the shape the mutant expected. Report it instead of
          // passing it through, or a broken mutant would look like a survivor.
          stats.errors.push(`${request.method} ${request.path}: ${err.message}`);
          response.status = 502;
          out = JSON.stringify({ mutationError: err.message });
        }
      }

      const contentType = upstreamRes.headers.get('content-type') ?? 'application/json';
      res.writeHead(response.status, { 'content-type': contentType }).end(out);
    } catch (err) {
      stats.errors.push(`${req.method} ${req.url}: ${err.message}`);
      res
        .writeHead(502, { 'content-type': 'application/json' })
        .end(JSON.stringify({ proxyError: err.message }));
    }
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`Mutation proxy: ${name} on http://127.0.0.1:${port} -> ${upstream}`);
  });
