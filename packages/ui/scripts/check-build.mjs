#!/usr/bin/env node
// Smoke test for the built package (run after `npm run build`). A check that
// reads the code and says "looks right" proves nothing, so this loads the
// artefacts the way a consumer would.
//   (a) dist/index.js exports every expected name, each a function or object
//   (b) the build loads under plain Node ESM and server-renders a Button
//   (c) dist/styles.css has token-mapped utilities, no preflight reset, and
//       no token declarations (consumers import tokens.css themselves)
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const problems = [];
const bad = (m) => problems.push(m);

// Hard-coded on purpose: derived from index.ts it could never disagree with it.
const EXPECTED = [
  'Button', 'TextField', 'TextArea', 'Checkbox', 'RadioGroup', 'Switch', 'Select', 'ComboBox',
  'Modal', 'DialogTrigger', 'Tabs', 'TabList', 'Tab', 'TabPanel', 'Link', 'Breadcrumbs', 'Nav',
  'Pagination', 'EmptyState', 'Spinner', 'Skeleton', 'SkeletonText', 'SkeletonTable', 'SkeletonRegion',
  'statusBadgeStyle', 'assertRequiredTokens', 'requiredTokens',
];

let lib;
try {
  lib = await import(pathToFileURL(`${dist}index.js`).href);
} catch (e) {
  console.error(`FAIL: dist/index.js does not load under Node ESM: ${e.message}`);
  process.exit(1);
}

// (a)
for (const name of EXPECTED) {
  const t = typeof lib[name];
  if (!(t === 'function' || t === 'object' || (name === 'requiredTokens' && t === 'number'))) {
    bad(`export "${name}" is ${t === 'undefined' ? 'missing' : `a ${t}`}`);
  }
}
const extra = Object.keys(lib).filter((k) => !EXPECTED.includes(k));
if (extra.length) bad(`unexpected exports (update EXPECTED if intended): ${extra.join(', ')}`);

// (b)
try {
  const html = renderToString(createElement(lib.Button, { variant: 'primary' }, 'Go'));
  if (!/<button[^>]*>.*Go<\/button>/.test(html)) bad(`server-rendered Button is not a <button> containing "Go": ${html}`);
} catch (e) {
  bad(`server-rendering Button threw: ${e.message}`);
}

// (c)
let css = '';
try {
  css = readFileSync(`${dist}styles.css`, 'utf8');
} catch (e) {
  bad(`dist/styles.css is unreadable: ${e.message}`);
}
if (css) {
  for (const cls of ['.bg-signal', '.text-ink', '.border-border', '.bg-surface-raised']) {
    if (!css.includes(cls)) bad(`styles.css lacks token-mapped utility ${cls}`);
  }
  const preflight = [
    ['::file-selector-button', /::file-selector-button/],
    ['-webkit-text-size-adjust', /-webkit-text-size-adjust/],
    ['a populated @layer base block', /@layer base\s*\{/],
  ];
  for (const [what, re] of preflight) if (re.test(css)) bad(`styles.css contains preflight (${what})`);
  if (/--canvas\s*:/.test(css)) bad('styles.css declares --canvas: (tokens.css leaked in)');
}

if (problems.length) {
  console.error(`FAIL: ${problems.length} problem(s) in the built package`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`ok: ${EXPECTED.length} exports present; Button server-renders under Node ESM; styles.css has token utilities, no preflight, no tokens.css`);
