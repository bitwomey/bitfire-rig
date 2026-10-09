#!/usr/bin/env node
// (a) every real story passes axe in both themes; (b) the deliberately broken
// proof story FAILS, and fails on an axe rule, not on some other breakage.
// An exit code alone proves nothing: a crash also exits non-zero.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const run = (env) => {
  const r = spawnSync('npx vitest run --project=storybook', {
    cwd, shell: true, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', ...env },
  });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};

console.log('1/2 real stories, both themes: must pass');
const real = run({});
console.log(real.out.split('\n').filter((l) => /Test Files|Tests /.test(l)).join('\n'));
if (real.code !== 0) {
  console.error(real.out);
  console.error('FAIL: the real stories do not pass the accessibility gate');
  process.exit(1);
}

console.log('2/2 proof story: must FAIL on an axe rule');
const proof = run({ A11Y_PROOF: '1' });
const rules = [...new Set([...proof.out.matchAll(/\(([a-z][a-z-]+)\)"/g)].map((m) => m[1]))];
const wanted = ['button-name', 'label'];
if (proof.code === 0) {
  console.error('FAIL: the proof story passed, so the gate does not fail on a violation');
  process.exit(1);
}
const missing = wanted.filter((r) => !rules.includes(r));
if (missing.length) {
  console.error(proof.out);
  console.error(`FAIL: the proof failed, but not on the expected axe rules (saw: ${rules.join(', ') || 'none'}; missing: ${missing.join(', ')})`);
  process.exit(1);
}
console.log(`ok: the proof story failed on axe rules ${rules.join(', ')}, as intended`);
