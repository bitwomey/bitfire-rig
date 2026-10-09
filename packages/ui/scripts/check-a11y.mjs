#!/usr/bin/env node
// (a) every real story passes axe in both themes; (b) each deliberately broken
// proof story FAILS, and fails on the axe rule it was written to trip, not on
// some other breakage. An exit code alone proves nothing: a crash also exits
// non-zero. The proofs set no a11y parameter of their own, so they fail only
// if the global configuration in .storybook/preview.tsx makes violations fail.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const run = (env) => {
  const r = spawnSync('npx vitest run --project=storybook', {
    cwd, shell: true, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', ...env },
  });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};
const fail = (out, msg) => {
  if (out) console.error(out);
  console.error(`FAIL: ${msg}`);
  process.exit(1);
};
const rulesIn = (out) => [...new Set([...out.matchAll(/\(([a-z][a-z-]+)\)"/g)].map((m) => m[1]))];
// The selectors axe reports for the failing nodes, one per "Expected the HTML found at" line.
const nodesIn = (out) => [...out.matchAll(/Expected the HTML found at (.+) to have no violations/g)].map((m) => m[1]);

console.log('1/3 real stories, both themes: must pass');
const real = run({});
console.log(real.out.split('\n').filter((l) => /Test Files|Tests /.test(l)).join('\n'));
if (real.code !== 0) fail(real.out, 'the real stories do not pass the accessibility gate');

console.log('2/3 nameless button and unlabelled input: must FAIL on button-name and label');
const violation = run({ A11Y_PROOF: 'a11y-violation' });
if (violation.code === 0) fail('', 'the proof story passed, so the gate does not fail on a violation');
const seen = rulesIn(violation.out);
const missing = ['button-name', 'label'].filter((r) => !seen.includes(r));
if (missing.length) fail(violation.out, `the proof failed, but not on the expected rules (saw: ${seen.join(', ') || 'none'}; missing: ${missing.join(', ')})`);
console.log(`ok: failed on axe rules ${seen.join(', ')}, as intended`);

console.log('3/3 contrast that fails in the light theme only: must FAIL on color-contrast, in light only');
const contrast = run({ A11Y_PROOF: 'contrast-light' });
if (contrast.code === 0) fail('', 'the light-only contrast proof passed, so the gate does not check the light theme');
const crules = rulesIn(contrast.out);
const nodes = nodesIn(contrast.out);
if (!crules.includes('color-contrast')) fail(contrast.out, `the proof failed, but not on color-contrast (saw: ${crules.join(', ') || 'none'})`);
if (!nodes.length || nodes.some((n) => !n.includes('data-theme="light"'))) {
  fail(contrast.out, `the contrast failure was not confined to the light container (nodes: ${nodes.join(' | ') || 'none'})`);
}
console.log('ok: failed on color-contrast in the light container only, as intended');
