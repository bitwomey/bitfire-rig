// Renders the bitfire-design skill body from repo sources only:
//   design/bitfire-design/SKILL.template.md   authored prose with {{placeholders}}
//   packages/tokens/src/tokens.json           every value
//   DESIGN-RULES.md                           the build rules
//   packages/ui/src/index.ts                  the built components
// A placeholder that is unknown, or a token that no longer exists, throws: the
// skill must never carry a value the repo does not have.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const at = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const read = (p) => readFileSync(at(p));
const lf = (s) => s.replace(/\r\n/g, '\n');

export const TEMPLATE = 'design/bitfire-design/SKILL.template.md';
export const OUTPUT = 'design/bitfire-design/SKILL.md';

const CORE = ['canvas', 'surface', 'surface-raised', 'border-hairline', 'border', 'ink', 'ink-muted', 'ink-subtle',
  'signal', 'focus', 'brand-ember', 'status-ok', 'status-warn', 'status-danger'];

export function renderSkill() {
  const srcBytes = read('packages/tokens/src/tokens.json');
  const T = JSON.parse(srcBytes.toString('utf8'));
  const groups = ['color', 'spacing', 'radius', 'shadow', 'opacity', 'stroke', 'zIndex'];
  const all = new Map();
  for (const g of groups) for (const t of T[g].tokens) all.set(t.name, t);
  const tok = (n) => { const t = all.get(n); if (!t) throw new Error(`token "${n}" is not in tokens.json`); return t; };
  const val = (t, theme) => (typeof t.value === 'string' ? t.value : t.value[theme]);
  const named = (re) => T.color.tokens.filter((t) => re.test(t.name));

  const block = {
    'core-tokens': () => [
      '| Token | Dark | Light | Use |', '| --- | --- | --- | --- |',
      ...CORE.map((n) => {
        const t = tok(n);
        const use = t.usage.split(/(?<=\.)\s/)[0].replace(/\.$/, '').replaceAll('|', '/');
        return `| \`${n}\` | ${val(t, 'dark')} | ${val(t, 'light')} | ${use} |`;
      }),
    ].join('\n'),

    ramps: () => {
      const line = (label, ts, theme) => `${label} ${theme.padEnd(5)} ${ts.map((t) => val(t, theme)).join(' ')}`;
      const viz = named(/^viz-\d$/), sev = named(/^sev-\d$/);
      const div = ['div-lo-2', 'div-lo-1', 'div-lo-0', 'div-mid', 'div-hi-0', 'div-hi-1', 'div-hi-2'].map(tok);
      return ['```',
        `viz-1..${viz.length}`.padEnd(10) + ' (categorical)',
        line('  ', viz, 'dark'), line('  ', viz, 'light'),
        'sev-0..' + (sev.length - 1) + ' (sequential)',
        line('  ', sev, 'dark') + '   (dark theme: bright = worse)',
        line('  ', sev, 'light') + '   (light theme: dark = worse)',
        'div-lo-2..div-hi-2 (diverging, low to high)',
        line('  ', div, 'dark'), line('  ', div, 'light'), '```'].join('\n');
    },

    fdr: () => {
      const f = named(/^fdr-/);
      const note = f.find((t) => t.provenanceNote);
      const lines = [`Fire danger fills are theme-independent: ${f.map((t) => `${t.name.replace('fdr-', '').replace('-', ' ')} ${t.value}`).join(', ')}. Text on them is \`ink-on-warm\` (${val(tok('ink-on-warm'), 'dark')}), except catastrophic which takes \`ink-on-deep\` (${val(tok('ink-on-deep'), 'dark')}).`];
      if (note) lines.push('', `Provenance of these five values: ${note.provenance}. ${note.provenanceNote} That is a review by inspection, not a check against the AFAC AFDRS Style Guidelines text, so say so if they are going into anything public-facing.`);
      return lines.join('\n');
    },

    spacing: () => {
      const sp = T.spacing.tokens.map((t) => `${t.name.replace('space-', '')}=${t.value}`).join(', ');
      const rd = T.radius.tokens.map((t) => `${t.name.replace('radius-', '')} ${t.value} (${t.usage.split(/(?<=\.)\s/)[0].replace(/\.$/, '').toLowerCase()})`).join('; ');
      return `Spacing is a 4px grid (steps ${sp}). Radius: ${rd}. Use the tokens for both.`;
    },

    families: () => `IBM Plex: ${Object.entries(T.type.families).map(([k, v]) => `${k} (${v.split(',')[0].replaceAll('"', '')})`).join(', ')}. Google-hosted; the system ships no font files.`,

    'type-scale': () => ['Type scale (size / weight), from `tokens.json`:', '',
      ...T.type.groups.map((g) => `- ${g.name}: ${g.styles.map((s) => `\`${s.name}\` ${s.fontSize}/${s.fontWeight}`).join(', ')}`)].join('\n'),

    components: () => {
      const names = [...read('packages/ui/src/index.ts').toString('utf8').matchAll(/export\s*\{([^}]*)\}/g)]
        .flatMap((m) => m[1].split(',').map((x) => x.trim()).filter((x) => x && !x.startsWith('type ')));
      if (!names.length) throw new Error('no exports found in packages/ui/src/index.ts');
      return names.map((n) => `\`${n}\``).join(', ');
    },

    rules: () => {
      const s = lf(read('DESIGN-RULES.md').toString('utf8'));
      const i = s.indexOf('\n## ');
      if (i < 0) throw new Error('DESIGN-RULES.md has no sections');
      return '## Design rules (from DESIGN-RULES.md in the rig)\n\n' + s.slice(i + 1).replace(/^## /gm, '### ').trimEnd();
    },

    'generated-note': () => `<!-- GENERATED by tools/design-system.mjs skill from ${TEMPLATE}, packages/tokens/src/tokens.json (sha256 ${createHash('sha256').update(srcBytes).digest('hex').slice(0, 12)}), DESIGN-RULES.md and packages/ui/src/index.ts. Do not edit by hand: edit those sources and regenerate. -->`,
  };

  const out = lf(read(TEMPLATE).toString('utf8')).replace(/\{\{([a-z-]+)(?::([a-z0-9.-]+))?\}\}/g, (m, name, arg) => {
    if (name === 'v') return val(tok(arg), 'dark');
    if (!block[name]) throw new Error(`unknown placeholder ${m} in ${TEMPLATE}`);
    return block[name]();
  });
  if (/\{\{/.test(out)) throw new Error('an unfilled placeholder is left in the skill body');
  return out;
}
