#!/usr/bin/env node
// Regenerate into a temp dir and compare. Rejects hand-edited generated files
// and generated output that no longer matches its source.
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const [src, dist] = process.argv.slice(2);
const tmp = mkdtempSync(join(tmpdir(), 'bf-'));
try { execFileSync('node', [new URL('./generate.mjs', import.meta.url).pathname, src, tmp], { stdio: 'pipe' }); }
catch (e) { console.error('STALE-CHECK: generator rejected the source'); process.exit(1); }
let bad = 0;
for (const f of readdirSync(tmp)) {
  const a = readFileSync(join(tmp, f), 'utf8');
  let b = null;
  try { b = readFileSync(join(dist, f), 'utf8'); } catch { console.error(`STALE: ${f} missing from dist`); bad++; continue; }
  if (a !== b) { console.error(`STALE: ${f} differs from a fresh generation`); bad++; }
}
if (bad) { console.error(`REJECTED — ${bad} stale or edited generated file(s). Re-run the generator.`); process.exit(1); }
console.error('stale-check ok');
