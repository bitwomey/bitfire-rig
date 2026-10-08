#!/usr/bin/env node
// BITFire token generator. Deterministic: no timestamps, sorted output,
// stamped with a hash of the source and this generator's version.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';

const GENERATOR_VERSION = '1.0.1';
const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const ALIAS_RE = /^\{[a-z0-9.-]+\}$/;
const COLOR_RE = /^(#[0-9a-fA-F]{3,8}|(rgba?|oklch|hsla?)\([0-9a-zA-Z%.,\/\s-]*\)|\{[a-z0-9.-]+\}|transparent|currentColor)$/;
// Shadow layers: lengths, colours, commas. No braces, quotes or semicolons, so a value cannot break out of its declaration.
const SHADOW_RE = /^(none|\{[a-z0-9.-]+\}|[0-9a-zA-Z%.,\s#()\/-]+)$/;
const FAMILY_RE = /^[A-Za-z0-9\s,"'-]+$/;
const OPACITY_RE = /^(0|1|0?\.\d+|1\.0+)$/;
const ZINDEX_RE = /^-?\d+$/;
const LEN_RE  = /^(-?[\d.]+(px|rem|em|%|ch|vh|vw)|0|-?[\d.]+)$/;

const src = process.argv[2];
const outDir = process.argv[3];
if (!src || !outDir) { console.error('usage: generate.mjs <tokens.json> <outDir>'); process.exit(2); }

const raw = readFileSync(src);
const sourceHash = createHash('sha256').update(raw).digest('hex').slice(0, 12);
const T = JSON.parse(raw.toString());

const errors = [];
const seen = new Map();
function checkName(name, where) {
  if (!NAME_RE.test(name)) errors.push(`${where}: invalid token name "${name}"`);
  if (seen.has(name)) errors.push(`${where}: duplicate token name "${name}" (also in ${seen.get(name)})`);
  else seen.set(name, where);
}
function checkLen(name, v, where) {
  const s = String(v);
  if (/pt$/.test(s)) errors.push(`${where}: "${name}" uses pt ("${s}") — pt is silently dropped downstream; use px`);
  else if (!LEN_RE.test(s)) errors.push(`${where}: "${name}" has unparseable length "${s}"`);
}
function esc(n) { return n.replace(/\./g, '\\.'); }
// Resolve alias syntax {token-name} → var(--token-name). Whole-value only:
// an alias embedded in a longer string is left as written.
function resolveAlias(v) {
  return typeof v === 'string' ? v.replace(/^\{([a-z0-9.-]+)\}$/, 'var(--$1)') : v;
}

// ---- colour ----
const themes = T.color.themes.map(t => t.id);
const base = [], approximate = [];
const perTheme = Object.fromEntries(themes.map(t => [t, []]));
for (const tok of T.color.tokens) {
  checkName(tok.name, 'color');
  if (tok.provenance === 'approximate') approximate.push(tok.name);  // none at present
  if (typeof tok.value === 'string') {
    const v = resolveAlias(tok.value);
    if (!COLOR_RE.test(tok.value)) errors.push(`color: "${tok.name}" bad value "${tok.value}"`);
    base.push([tok.name, v]);
  } else {
    for (const th of themes) {
      const raw = tok.value[th];
      if (raw === undefined) { errors.push(`color: "${tok.name}" missing theme "${th}"`); continue; }
      if (!COLOR_RE.test(raw)) errors.push(`color: "${tok.name}" bad ${th} value "${raw}"`);
      perTheme[th].push([tok.name, resolveAlias(raw)]);
    }
  }
}

// ---- scales ----
// Returns true when the value is valid; pushes an error otherwise.
function checkScale(group, name, v) {
  const before = errors.length;
  if (group === 'spacing' || group === 'radius' || group === 'stroke') checkLen(name, v, group);
  else if (group === 'opacity' && !OPACITY_RE.test(String(v))) errors.push(`${group}: "${name}" bad value "${v}"`);
  else if (group === 'zIndex' && !ZINDEX_RE.test(String(v))) errors.push(`${group}: "${name}" bad value "${v}"`);
  else if (group === 'shadow' && !(typeof v === 'string' && SHADOW_RE.test(v))) errors.push(`${group}: "${name}" bad value "${v}"`);
  return errors.length === before;
}
const scales = [];
for (const group of ['spacing', 'radius', 'shadow', 'opacity', 'stroke', 'zIndex']) {
  for (const tok of (T[group]?.tokens ?? [])) {
    checkName(tok.name, group);
    // Shadow tokens carry per-theme values; route them into the theme blocks
    // rather than scales so they emit correctly in :root / [data-theme="light"].
    if (typeof tok.value === 'object' && tok.value !== null) {
      if (themes.every(th => tok.value[th] !== undefined)) {
        for (const th of themes) {
          const pv = tok.value[th];
          checkScale(group, tok.name, pv);
          perTheme[th].push([tok.name, resolveAlias(pv)]);
        }
      } else {
        const missing = themes.filter(th => tok.value[th] === undefined);
        errors.push(`${group}: "${tok.name}" per-theme value missing theme(s): ${missing.join(', ')}`);
      }
    } else {
      checkScale(group, tok.name, tok.value);
      scales.push([tok.name, String(tok.value)]);
    }
  }
}

// ---- type ----
const families = Object.entries(T.type.families);
for (const [n, f] of families) {
  if (!NAME_RE.test(n)) errors.push(`type: invalid family name "${n}"`);
  if (typeof f !== 'string' || !FAMILY_RE.test(f)) errors.push(`type: family "${n}" bad value ${JSON.stringify(f)}`);
}
const familyNames = new Set(families.map(([n]) => n));
const styles = [];
for (const g of T.type.groups) {
  // family is declared on the GROUP, not the style. Defaulting it silently
  // put every Document style in sans when the system specifies serif.
  if (!g.family) { errors.push(`type: group "${g.name}" declares no family`); continue; }
  if (!familyNames.has(g.family)) {
    errors.push(`type: group "${g.name}" uses unknown family "${g.family}"`); continue;
  }
  for (const s of g.styles) {
  if (!NAME_RE.test(s.name)) errors.push(`type: invalid style name "${s.name}"`);
  for (const k of ['fontSize', 'lineHeight', 'letterSpacing']) {
    if (s[k] !== undefined) checkLen(`${s.name}.${k}`, s[k], 'type');
  }
  styles.push({ group: g.name, family: g.family, ...s });
  }
}

if (themes.length < 2) errors.push('color.themes must declare at least two themes (dark primary, light)');
for (const th of themes) if (!NAME_RE.test(th)) errors.push(`color: invalid theme id "${th}"`);
if (errors.length) {
  console.error(`REJECTED — ${errors.length} problem(s):`);
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}

const stamp = `/* GENERATED FILE — do not edit.\n   Edit packages/tokens/src/tokens.json and re-run the generator.\n   source ${sourceHash} · generator ${GENERATOR_VERSION} */`;
const DARK = themes[0], LIGHT = themes[1];
const L = [];
L.push(stamp, '', ':root {', `  /* colour · ${DARK} (primary) */`);
for (const [n, v] of perTheme[DARK]) L.push(`  --${esc(n)}: ${v};`);
L.push('', '  /* colour · theme-independent */');
// Kept deliberately: any token marked provenance "approximate" says so in the
// generated CSS, so a caveat cannot be lost between the source and the artifact.
if (approximate.length) {
  L.push(`  /* APPROXIMATE, not authoritative: ${approximate.join(', ')}.`,
         '     Verify before using on a surface that presents them as official. */');
}
for (const [n, v] of base) L.push(`  --${esc(n)}: ${v};`);
L.push('', '  /* scale */');
for (const [n, v] of scales) L.push(`  --${esc(n)}: ${v};`);
L.push('', '  /* type families */');
for (const [n, v] of families) L.push(`  --font-${esc(n)}: ${v};`);
L.push('}', '', `[data-theme="${LIGHT}"] {`);
for (const [n, v] of perTheme[LIGHT]) L.push(`  --${esc(n)}: ${v};`);
L.push('}', '');
for (const s of styles) {
  const d = [`font-family: var(--font-${s.family})`];
  if (s.fontSize) d.push(`font-size: ${s.fontSize}`);
  if (s.lineHeight) d.push(`line-height: ${s.lineHeight}`);
  if (s.fontWeight) d.push(`font-weight: ${s.fontWeight}`);
  if (s.letterSpacing) d.push(`letter-spacing: ${s.letterSpacing}`);
  if (s.textTransform) d.push(`text-transform: ${s.textTransform}`);
  L.push(`.${esc(s.name)} { ${d.join('; ')}; }`);
}
const css = L.join('\n') + '\n';

const allNames = [...perTheme[DARK].map(x => x[0]), ...base.map(x => x[0]), ...scales.map(x => x[0])].sort();
const js = `${stamp}\nexport const sourceHash = ${JSON.stringify(sourceHash)};\n`
  + `export const generatorVersion = ${JSON.stringify(GENERATOR_VERSION)};\n`
  + `export const themes = ${JSON.stringify(themes)};\n`
  + `export const tokenNames = ${JSON.stringify(allNames, null, 2)};\n`
  + `export const v = (n) => \`var(--\${String(n).replace(/\\./g, '\\\\\\\\.')})\`;\n`;
const dts = `${stamp}\nexport declare const sourceHash: string;\n`
  + `export declare const generatorVersion: string;\n`
  + `export declare const themes: readonly ${JSON.stringify(themes).replace(/"/g, '"')} ;\n`
  + `export type TokenName = ${allNames.map(n => JSON.stringify(n)).join(' | ')};\n`
  + `export declare const tokenNames: readonly TokenName[];\n`
  + `export declare const v: (n: TokenName) => string;\n`;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'tokens.css'), css);
writeFileSync(join(outDir, 'index.js'), js);
writeFileSync(join(outDir, 'index.d.ts'), dts);
console.error(`ok — ${seen.size} tokens, ${styles.length} type styles, source ${sourceHash}`);
if (approximate.length) {
  console.error(`note — ${approximate.length} token(s) marked approximate, not authoritative: ${approximate.join(', ')}`);
}
