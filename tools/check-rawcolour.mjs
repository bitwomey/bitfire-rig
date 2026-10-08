#!/usr/bin/env node
// Rejects raw colour anywhere outside the generated token file, including the
// paths Stylelint cannot see: TSX, template strings, Tailwind arbitrary values.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

// Let git decide what is a build artefact. Without this the gate walks
// generated output (an inlined stylesheet, an installed dependency) and
// reports colours nobody wrote.
let ignored = new Set();
try {
  const out = execFileSync('git', ['ls-files', '--others', '--ignored', '--exclude-standard', '--directory'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  ignored = new Set(out.split('\n').filter(Boolean).map(x => x.replace(/\/$/, '')));
} catch { /* not a git repo: fall back to the path patterns below */ }
const gitIgnores = (p) => ignored.has(relative(process.cwd(), p).replace(/\\/g, '/'));
const roots = process.argv.slice(2);
const ALLOW = /currentColor|transparent|inherit|none/;
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const FN  = /\b(rgba?|hsla?|oklch|oklab|lab|lch)\s*\(/g;
const EXT = new Set(['.css', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.html', '.svg']);
const GENERATED = new Set(['tokens.css', 'index.js', 'index.d.ts']);
let hits = 0;
function walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) {
    if (/node_modules|\.git|dist|\.verdaccio/.test(p) || gitIgnores(p)) return;
    for (const f of readdirSync(p)) walk(join(p, f));
    return;
  }
  if (!EXT.has(extname(p)) || GENERATED.has(basename(p)) || gitIgnores(p)) return;
  const txt = readFileSync(p, 'utf8');
  txt.split('\n').forEach((line, i) => {
    if (ALLOW.test(line)) return;
    for (const re of [HEX, FN]) {
      re.lastIndex = 0; let m;
      while ((m = re.exec(line))) { console.error(`RAW COLOUR ${p}:${i + 1}  ${m[0]}`); hits++; }
    }
  });
}
for (const r of roots) walk(r);
if (hits) { console.error(`REJECTED — ${hits} raw colour value(s) outside the generated token file.`); process.exit(1); }
console.error('raw-colour check ok');
