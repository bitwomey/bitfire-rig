#!/usr/bin/env node
// Release gate. Refuses to publish unless every precondition holds.
// Ordering matters: cheap structural checks first, destructive gate tests last
// before the irreversible step.
import { execFileSync, execSync } from 'node:child_process';
import { readFileSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgDir = resolve(process.argv[2] ?? '.');
const registry = process.argv[3] ?? 'http://localhost:4873/';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dry = process.argv.includes('--dry-run');

const steps = [];
let failed = false;
function step(name, fn) {
  if (failed) { steps.push([name, 'skipped', '']); return; }
  try { const note = fn() ?? ''; steps.push([name, 'pass', note]); }
  catch (e) { steps.push([name, 'FAIL', String(e.message).split('\n')[0]]); failed = true; }
}
const sh = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: 'utf8', stdio: 'pipe', ...opts });

const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));

step('package manifest is well formed', () => {
  for (const k of ['name', 'version', 'exports', 'files']) {
    if (!pkg[k]) throw new Error(`package.json is missing "${k}"`);
  }
  if (!/^\d+\.\d+\.\d+/.test(pkg.version)) throw new Error(`bad version "${pkg.version}"`);
  if (!pkg.exports['./package.json']) throw new Error('exports must expose ./package.json');
  return `${pkg.name}@${pkg.version}`;
});

step('generated output is not stale', () => {
  const src = join(pkgDir, 'src/tokens.json');
  try { readFileSync(src); } catch { return 'no generated output in this package'; }
  sh('node', [join(root, 'tools/check-stale.mjs'), src, join(pkgDir, 'dist')]);
  return 'dist matches a fresh generation';
});

step('no raw colour outside generated files', () => {
  sh('node', [join(root, 'tools/check-rawcolour.mjs'), join(root, 'packages'), join(root, 'fixtures'), join(root, 'consumers')]);
  return 'clean';
});

step('every declared file is present', () => {
  const missing = [];
  for (const f of pkg.files ?? []) {
    try { readdirSync(join(pkgDir, f)); } catch { missing.push(f); }
  }
  if (missing.length) throw new Error(`declared in files[] but absent: ${missing.join(', ')}`);
  return (pkg.files ?? []).join(', ');
});

step('version is not already published', () => {
  let meta = null;
  try { meta = JSON.parse(sh('npm', ['view', pkg.name, '--json', '--registry', registry])); }
  catch { return 'first publish of this package'; }
  const published = Array.isArray(meta.versions) ? meta.versions : Object.keys(meta.versions ?? {});
  if (published.includes(pkg.version)) {
    throw new Error(`${pkg.name}@${pkg.version} is already published — bump the version`);
  }
  const cmp = (a, b) => { const A = a.split('.').map(Number), B = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) if (A[i] !== B[i]) return A[i] - B[i]; return 0; };
  const latest = published.sort(cmp).at(-1);
  if (latest && cmp(pkg.version, latest) <= 0) {
    throw new Error(`version ${pkg.version} is not greater than published ${latest}`);
  }
  return `${latest ?? 'none'} -> ${pkg.version}`;
});

step('the gates still reject what they should', () => {
  sh('bash', [join(root, 'tools/gate-tests.sh')], { cwd: root });
  return '8 gate-failure tests pass';
});

const w = Math.max(...steps.map(s => s[0].length));
for (const [name, status, note] of steps) {
  console.log(`  ${status === 'pass' ? 'ok  ' : status === 'FAIL' ? 'FAIL' : '--  '} ${name.padEnd(w)}  ${note}`);
}
if (failed) { console.error('\nRELEASE REFUSED'); process.exit(1); }
if (dry) { console.log('\nall preconditions hold (dry run — nothing published)'); process.exit(0); }
console.log('\npublishing...');
execSync(`npm publish --registry ${registry}`, { cwd: pkgDir, stdio: 'inherit' });
