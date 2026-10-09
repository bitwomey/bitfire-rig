#!/usr/bin/env node
// (a) every real story passes axe, run once under each theme so content React
// Aria portals into <body> is checked in the theme under test; (b) each
// deliberately broken proof story FAILS, and fails on the axe rule it was
// written to trip, not on some other breakage. An exit code alone proves
// nothing: a crash also exits non-zero. The proofs set no a11y parameter of
// their own, so they fail only if the global configuration in
// .storybook/preview.tsx makes violations fail.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const run = (theme, env = {}) => {
  const r = spawnSync('npx vitest run --project=storybook', {
    cwd, shell: true, encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', VITE_A11Y_THEME: theme, ...env },
  });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};
const fail = (out, msg) => {
  if (out) console.error(out);
  console.error(`FAIL: ${msg}`);
  process.exit(1);
};
const rulesIn = (out) => [...new Set([...out.matchAll(/\(([a-z][a-z-]+)\)"/g)].map((m) => m[1]))];

console.log('1/4 real stories, once per theme: must pass');
for (const theme of ['dark', 'light']) {
  const real = run(theme);
  console.log(`${theme}: ${real.out.split('\n').filter((l) => /Tests /.test(l)).join(' ').trim()}`);
  if (real.code !== 0) fail(real.out, `the real stories do not pass the accessibility gate in the ${theme} theme`);
}

console.log('2/4 nameless button and unlabelled input: must FAIL on button-name and label');
const violation = run('dark', { A11Y_PROOF: 'a11y-violation' });
if (violation.code === 0) fail('', 'the proof story passed, so the gate does not fail on a violation');
const seen = rulesIn(violation.out);
const missing = ['button-name', 'label'].filter((r) => !seen.includes(r));
if (missing.length) fail(violation.out, `the proof failed, but not on the expected rules (saw: ${seen.join(', ') || 'none'}; missing: ${missing.join(', ')})`);
console.log(`ok: failed on axe rules ${seen.join(', ')}, as intended`);

// A token pair below 4.5:1 in light and passing in dark: fails under light, passes under dark.
for (const [n, stem, where] of [[3, 'contrast-light', 'in the page'], [4, 'portal-contrast-light', 'inside a portalled dialog']]) {
  console.log(`${n}/4 contrast that fails in the light theme only, ${where}: must FAIL in light and PASS in dark`);
  const light = run('light', { A11Y_PROOF: stem });
  if (light.code === 0) fail('', `${stem} passed in the light theme, so the gate does not check light ${where}`);
  const lrules = rulesIn(light.out);
  if (!lrules.includes('color-contrast')) fail(light.out, `${stem} failed in light, but not on color-contrast (saw: ${lrules.join(', ') || 'none'})`);
  const dark = run('dark', { A11Y_PROOF: stem });
  if (dark.code !== 0) fail(dark.out, `${stem} failed in the dark theme, so it does not prove a per-theme check`);
  console.log('ok: failed on color-contrast in light, passed in dark, as intended');
}
