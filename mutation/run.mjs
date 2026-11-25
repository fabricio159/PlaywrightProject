// Mutation runner: for each mutant in mutants.mjs, start the proxy with that mutant,
// run the mutant's target tests through it, and report which tests killed it.
//
//   npm run test:api:mutation                          every mutant
//   npm run test:api:mutation -- post-price-off-by-one  only the named mutant(s)
//
// Exits 1 if any mutant survived, never matched a request, or targets a test title that no longer exists.
//
// Also writes one Allure result per mutant to mutation-results/allure-results:
// killed = passed (green), survived = failed (red), not applied / error = broken.
// Build the report with `npm run mutation:allure:generate` (config: mutation/allurerc.mjs).

import { spawn, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mutants } from './mutants.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resultsDir = path.join(root, 'mutation-results');
const allureDir = path.join(resultsDir, 'allure-results');
const port = Number(process.env.MUTATION_PORT ?? 4010);
const proxyURL = `http://127.0.0.1:${port}`;
const specs = process.env.MUTATION_SPECS ?? 'tests/api/booking.spec.js';

const requested = process.argv.slice(2);
const unknown = requested.filter((n) => !mutants[n]);
if (unknown.length) {
  console.error(
    `Unknown mutant(s): ${unknown.join(', ')}. Options: ${Object.keys(mutants).join(', ')}`,
  );
  process.exit(1);
}
const names = requested.length ? requested : Object.keys(mutants);

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function waitForProxy(proxy) {
  for (let i = 0; i < 50; i++) {
    if (proxy.exitCode !== null) throw new Error('proxy exited before it was ready');
    try {
      const res = await fetch(`${proxyURL}/__mutation`);
      if (res.ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`proxy did not start on ${proxyURL}`);
}

// Playwright error messages carry terminal colour codes (ESC[...m)
// eslint-disable-next-line no-control-regex
const stripAnsi = (s) => s.replace(/\u001b\[[0-9;]*m/g, '');

/** Flattens the JSON report into [{ title, ok, error }]; error is the failing assertion's message. */
function collectSpecs(suite, out = []) {
  for (const spec of suite.specs ?? []) {
    const error = spec.tests?.[0]?.results?.at(-1)?.error?.message;
    out.push({ title: spec.title, ok: spec.ok, error: error && stripAnsi(error) });
  }
  for (const child of suite.suites ?? []) collectSpecs(child, out);
  return out;
}

const allureStatus = { killed: 'passed', SURVIVED: 'failed' }; // anything else is 'broken'

/** One step per test that ran: did it catch the mutant? */
function testSteps(result, start, stop) {
  return (result.ran ?? []).map((t) => {
    if (!t.ok) {
      return {
        name: `${t.title}: failed, caught the mutant`,
        status: 'passed',
        statusDetails: { message: t.error ?? '' },
        stage: 'finished',
        start,
        stop,
      };
    }
    const survived = result.status === 'SURVIVED';
    return {
      name: `${t.title}: passed, ${survived ? 'missed the mutant' : 'another test caught it'}`,
      status: survived ? 'failed' : 'skipped',
      stage: 'finished',
      start,
      stop,
    };
  });
}

/** Writes the mutant's outcome as an Allure test result, with its Playwright JSON report attached. */
function writeAllureResult(result, start, stop) {
  const mutant = mutants[result.name];
  const uuid = crypto.randomUUID();
  const attachments = [];
  const reportFile = path.join(resultsDir, `${result.name}.json`);
  if (fs.existsSync(reportFile)) {
    const source = `${uuid}-attachment.json`;
    fs.copyFileSync(reportFile, path.join(allureDir, source));
    attachments.push({ name: 'Playwright report', source, type: 'application/json' });
  }
  const targets = mutant.tests?.join(' + ') ?? 'All API tests';
  const allureResult = {
    uuid,
    historyId: crypto.createHash('md5').update(`mutation:${result.name}`).digest('hex'),
    testCaseId: crypto.createHash('md5').update(`mutation:${result.name}`).digest('hex'),
    name: result.name,
    fullName: `mutation/mutants.mjs#${result.name}`,
    status: allureStatus[result.status] ?? 'broken',
    statusDetails: { message: `${result.status}: ${result.detail}` },
    stage: 'finished',
    start,
    stop,
    description: `Targets: ${targets}\n\n\`\`\`js\nmatch: ${mutant.match.name || mutant.match.toString()}\nmutate: ${mutant.mutate.toString()}\n\`\`\``,
    labels: [
      { name: 'epic', value: 'Mutation testing' },
      { name: 'feature', value: specs },
      { name: 'story', value: targets },
      { name: 'parentSuite', value: 'Mutation testing' },
      { name: 'suite', value: targets },
      { name: 'tag', value: 'mutation' },
      { name: 'framework', value: 'playwright' },
      { name: 'language', value: 'javascript' },
    ],
    parameters: [
      { name: 'API_URL', value: process.env.API_URL ?? 'https://restful-booker.herokuapp.com' },
    ],
    steps: testSteps(result, start, stop),
    attachments,
  };
  fs.writeFileSync(
    path.join(allureDir, `${uuid}-result.json`),
    JSON.stringify(allureResult, null, 2),
  );
}

async function runMutant(name) {
  const mutant = mutants[name];
  const env = {
    ...process.env,
    MUTANT: name,
    MUTATION_PORT: String(port),
    MUTATION_EXTERNAL_PROXY: 'true', // this runner owns the proxy, so the config must not start one
    TAGS: 'all', // the mutant's own --grep picks the tests
    SKIP_API: 'false',
  };

  const proxy = spawn(process.execPath, [path.join(root, 'mutation/proxy.mjs')], {
    env,
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  try {
    await waitForProxy(proxy);

    const reportFile = path.join(resultsDir, `${name}.json`);
    const args = ['playwright', 'test', '--project=api', specs, '--reporter=json', '--retries=0'];
    if (mutant.tests?.length) {
      args.push('--grep', mutant.tests.map(escapeRegExp).join('|'));
    }
    spawnSync('npx', args, {
      cwd: root,
      env: { ...env, PLAYWRIGHT_JSON_OUTPUT_FILE: reportFile },
      stdio: 'ignore',
      shell: process.platform === 'win32',
    });

    const stats = await (await fetch(`${proxyURL}/__mutation`)).json();
    if (!fs.existsSync(reportFile))
      return { name, status: 'ERROR', detail: 'Playwright wrote no report' };
    const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
    const ran = report.suites.flatMap((s) => collectSpecs(s));

    const missing = (mutant.tests ?? []).filter((t) => !ran.some((r) => r.title === t));
    if (missing.length)
      return { name, status: 'ERROR', detail: `no test titled: ${missing.join(', ')}` };
    if (stats.errors.length) return { name, status: 'ERROR', detail: stats.errors.join('; ') };
    if (stats.hits === 0)
      return { name, status: 'NOT APPLIED', detail: 'no request matched this mutant' };

    const killers = ran.filter((r) => !r.ok).map((r) => r.title);
    const passed = ran.filter((r) => r.ok).map((r) => r.title);
    return killers.length
      ? { name, status: 'killed', detail: `by: ${killers.join(', ')}`, passed, ran }
      : { name, status: 'SURVIVED', detail: `passed: ${passed.join(', ')}`, ran };
  } finally {
    proxy.kill();
  }
}

fs.rmSync(resultsDir, { recursive: true, force: true });
fs.mkdirSync(allureDir, { recursive: true });

const results = [];
for (const name of names) {
  const start = Date.now();
  const result = await runMutant(name);
  writeAllureResult(result, start, Date.now());
  results.push(result);
  const extra = result.passed?.length ? `  (still passed: ${result.passed.join(', ')})` : '';
  console.log(`${result.status.padEnd(11)} ${name.padEnd(30)} ${result.detail}${extra}`);
}

const killed = results.filter((r) => r.status === 'killed').length;
console.log(
  `\n${killed}/${results.length} mutants killed. Reports: ${path.relative(root, resultsDir)}/`,
);
process.exit(killed === results.length ? 0 : 1);
