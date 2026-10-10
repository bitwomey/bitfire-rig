#!/usr/bin/env node
// Visual regression gate. Builds the static Storybook, then:
//   (a) screenshots of every story in both themes must match the committed
//       baselines;
//   (b) with a deliberate visual change injected (VISUAL_PROOF=1, a global
//       border-radius) the same run must FAIL, and fail by screenshot
//       comparison on at least one named story, not by a crash. An exit code
//       alone proves nothing.
// `--update` regenerates baselines (npm run visual:update). Nothing else ever
// writes a baseline, and CI never passes --update.
//
// Declared exception to "no check only in CI": baselines are rendered by the
// Linux Chromium that CI uses, so on any other OS this check is SKIPPED (exit 0).
// VISUAL_ALLOW_NON_LINUX=1 runs it for real against local, gitignored,
// platform-suffixed baselines; those prove the machinery, not the committed set.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const update = process.argv.includes('--update');
let tmp;
const fail = (msg, out) => {
  if (out) console.error(out);
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  console.error(`FAIL: ${msg}`);
  process.exit(1);
};

if (process.platform !== 'linux' && process.env.VISUAL_ALLOW_NON_LINUX !== '1') {
  console.log([
    '',
    '################################################################',
    `# check:visual SKIPPED on ${process.platform}: this is NOT a pass.`,
    '# The renderer is pinned to Linux: baselines are drawn by the Playwright',
    '# Chromium on the GitHub ubuntu-latest runner, and other OSes render text',
    '# and edges differently, so a comparison here would be meaningless.',
    '# To run it for real: push your branch; the CI "Visual regression gate"',
    '# step runs it. To change baselines: run the "visual-baselines" workflow',
    '# on your branch (see CONTRIBUTING.md, "Visual baselines").',
    '# (VISUAL_ALLOW_NON_LINUX=1 runs the machinery locally against',
    '# gitignored local baselines. It proves nothing about the committed ones.)',
    '################################################################',
    '',
  ].join('\n'));
  process.exit(0);
}

const sh = (cmd, env = {}) => {
  const r = spawnSync(cmd, { cwd, shell: true, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0', ...env } });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};

console.log('0/2 building the static Storybook');
const built = sh('npx storybook build --quiet');
if (built.code !== 0) fail('storybook build failed', built.out);

tmp = mkdtempSync(join(tmpdir(), 'bitfire-visual-'));
const play = (env, args = '') => {
  const json = join(tmp, `r-${Math.random().toString(36).slice(2)}.json`);
  const r = sh('npx playwright test -c visual/playwright.config.ts ' + args, { ...env, VISUAL_JSON: json });
  let report = null;
  try { report = JSON.parse(readFileSync(json, 'utf8')); } catch { /* crash before a report */ }
  return { ...r, report };
};
const tests = (report) => {
  const all = [];
  const walk = (s) => { for (const sp of s.specs ?? []) for (const t of sp.tests) all.push({ title: sp.title, results: t.results }); (s.suites ?? []).forEach(walk); };
  (report?.suites ?? []).forEach(walk);
  return all;
};

try {
  if (update) {
    // Start from nothing for this platform so the folder is exactly the current story set (no stale PNGs).
    const dir = join(cwd, 'visual', '__screenshots__');
    try { for (const f of readdirSync(dir)) if (f.endsWith(`-${process.platform}.png`)) rmSync(join(dir, f)); } catch { /* no folder yet */ }
    console.log('updating baselines (VISUAL_UPDATE=1)');
    const u = play({ VISUAL_UPDATE: '1' });
    console.log(u.out.split('\n').filter((l) => /passed|failed|updated|written/i.test(l)).join('\n'));
    if (u.code !== 0) fail('baseline update run failed', u.out);
    rmSync(tmp, { recursive: true, force: true });
    process.exit(0);
  }

  console.log('1/2 every story, both themes, against the baselines: must pass');
  const real = play({});
  const n = tests(real.report).filter((t) => !t.title.startsWith('baselines:')).length; // story screenshots only
  console.log(`${n} screenshots compared`);
  if (real.code !== 0 || !n) {
    const hint = /snapshot.*(doesn't|does not) exist|A snapshot/i.test(real.out)
      ? '\nBaselines are missing for this platform. Produce them with the visual-baselines workflow (CONTRIBUTING.md).' : '';
    fail(`the stories do not match their baselines${hint}`, real.out);
  }

  console.log('2/2 deliberate visual change (global border-radius): must FAIL by screenshot comparison');
  // A subset is enough to prove detection and keeps the run short; the first run covers every story.
  const proof = play({ VISUAL_PROOF: '1' }, '--grep "button--"');
  const failed = tests(proof.report).filter((t) => t.results.some((r) => r.status === 'failed' || r.status === 'timedOut'));
  if (proof.code === 0 || !failed.length) fail('the deliberate change was NOT caught: the gate does not fail on a visual change', proof.out);
  // Playwright reports a mismatch as "expect(page).toHaveScreenshot(...) failed ... N pixels ... are different".
  const isComparison = (r) => /toHaveScreenshot\([^)]*\) failed[\s\S]*?\d+ pixels/.test(r.errors.map((e) => e.message).join('\n').replace(/\u001b\[[0-9;]*m/g, ''));
  const notCompare = failed.filter((t) => !t.results.some(isComparison));
  if (notCompare.length) {
    fail(`the proof run failed, but not only by screenshot comparison (${notCompare.length} other failures, e.g. ${notCompare[0].title})`, proof.out);
  }
  console.log(`ok: ${failed.length} of ${tests(proof.report).length} proof screenshots failed by comparison, e.g. ${failed.slice(0, 3).map((t) => t.title).join(', ')}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
