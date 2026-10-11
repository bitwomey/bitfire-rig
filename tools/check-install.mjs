#!/usr/bin/env node
// Clean-install proof (Phase 3a). Everything else in this repo is proven inside
// the npm workspace, where packages are linked, so a wrong `files`, `exports`
// or peer range would not show. This packs both packages, installs the two
// tarballs into an empty directory OUTSIDE the repo, and uses them the way a
// consumer would. No registry is involved. Run after `npm run build:ui`.
//   1. the tarballs contain only what they declare (no src, stories, tests)
//   2. a clean install with strict-peer-deps succeeds, as real copies not links
//   3. the installed package server-renders a Button, both CSS entry points
//      resolve, and a TypeScript file importing them compiles
//   4. an incompatible install (React 18) is REFUSED
import { execSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const work = mkdtempSync(join(tmpdir(), 'bitfire-install-'));
const fwd = (p) => p.replaceAll('\\', '/');
const steps = [];
let failed = false;

function step(name, fn) {
  if (failed) { steps.push([name, 'skipped', '']); return; }
  try { steps.push([name, 'pass', fn() ?? '']); }
  catch (e) { steps.push([name, 'FAIL', String(e.message).trim()]); failed = true; }
}
// execSync (a shell) because npm is npm.cmd on Windows. Every argument is a
// fixed string or a path made here; no outside input reaches a shell.
const sh = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8', stdio: 'pipe' });
const writeJson = (p, o) => writeFileSync(p, JSON.stringify(o, null, 2) + '\n');

const tarballs = join(work, 'tarballs');
mkdirSync(tarballs);
const packed = {};

try {
  step('both packages pack, and contain only what they declare', () => {
    for (const [name, must] of [
      ['tokens', ['dist/index.js', 'dist/index.d.ts', 'dist/tokens.css', 'dist/tailwind.css']],
      ['ui', ['dist/index.js', 'dist/index.d.ts', 'dist/styles.css']],
    ]) {
      const dir = join(root, 'packages', name);
      const [info] = JSON.parse(sh(`npm pack --json --pack-destination "${tarballs}"`, dir));
      const paths = info.files.map((f) => f.path);
      const stray = paths.filter((p) => !(p.startsWith('dist/') || /^(package\.json|README|LICENSE)/i.test(p)));
      if (stray.length) throw new Error(`${info.name} tarball has files outside dist/: ${stray.join(', ')}`);
      const missing = must.filter((p) => !paths.includes(p));
      if (missing.length) throw new Error(`${info.name} tarball is missing ${missing.join(', ')} (run the build first)`);
      packed[name] = join(tarballs, info.filename);
    }
    return `${Object.keys(packed).length} tarballs`;
  });

  const consumer = join(work, 'consumer');
  step('a clean install of the two tarballs succeeds under strict-peer-deps', () => {
    mkdirSync(consumer);
    const ui = JSON.parse(readFileSync(join(root, 'packages/ui/package.json'), 'utf8'));
    writeJson(join(consumer, 'package.json'), {
      name: 'clean-consumer', private: true, type: 'module',
      dependencies: {
        '@bitfire/tokens': `file:${fwd(packed.tokens)}`,
        '@bitfire/ui': `file:${fwd(packed.ui)}`,
        react: ui.peerDependencies.react,
        'react-dom': ui.peerDependencies['react-dom'],
        'react-aria-components': ui.peerDependencies['react-aria-components'],
      },
      devDependencies: {
        typescript: ui.devDependencies.typescript,
        '@types/react': ui.devDependencies['@types/react'],
      },
    });
    writeFileSync(join(consumer, '.npmrc'), 'strict-peer-deps=true\n');
    sh('npm install --no-audit --no-fund', consumer);
    for (const n of ['@bitfire/tokens', '@bitfire/ui']) {
      const p = join(consumer, 'node_modules', n);
      if (!existsSync(p)) throw new Error(`${n} is not installed`);
      if (lstatSync(p).isSymbolicLink()) throw new Error(`${n} is a link, not an installed copy`);
    }
    return 'installed as copies, not links';
  });

  step('the installed package renders, resolves its CSS and type-checks', () => {
    writeFileSync(join(consumer, 'use.mjs'), [
      "import { createElement } from 'react';",
      "import { renderToString } from 'react-dom/server';",
      "import { existsSync } from 'node:fs';",
      "import { fileURLToPath } from 'node:url';",
      "import { Button } from '@bitfire/ui';",
      "import { themes } from '@bitfire/tokens';",
      "const html = renderToString(createElement(Button, { variant: 'primary' }, 'Go'));",
      "if (!/<button[^>]*>.*Go<\\/button>/.test(html)) throw new Error('Button did not render: ' + html);",
      "if (themes.join() !== 'dark,light') throw new Error('unexpected themes: ' + themes);",
      "for (const s of ['@bitfire/ui/styles.css', '@bitfire/tokens/tokens.css', '@bitfire/tokens/tailwind.css']) {",
      "  const p = fileURLToPath(import.meta.resolve(s));",
      "  if (!existsSync(p)) throw new Error(s + ' resolves to a missing file');",
      '}',
      "console.log('rendered, 3 css entry points resolve');",
    ].join('\n') + '\n');
    const out = sh('node use.mjs', consumer).trim();
    writeFileSync(join(consumer, 'use.ts'),
      "import { Button } from '@bitfire/ui';\nimport { themes, type TokenName } from '@bitfire/tokens';\n" +
      "export const t: TokenName = 'canvas';\nexport const th: readonly string[] = themes;\nexport const B = Button;\n");
    writeJson(join(consumer, 'tsconfig.json'), {
      compilerOptions: { strict: true, noEmit: true, skipLibCheck: false, module: 'esnext',
        moduleResolution: 'bundler', target: 'es2022', jsx: 'react-jsx' },
      files: ['use.ts'],
    });
    sh('npx --no-install tsc -p tsconfig.json', consumer);
    return `${out}; use.ts compiles`;
  });

  step('an incompatible install (React 18) is refused', () => {
    const ui = JSON.parse(readFileSync(join(root, 'packages/ui/package.json'), 'utf8'));
    const bad = join(work, 'bad');
    mkdirSync(bad);
    writeJson(join(bad, 'package.json'), {
      name: 'bad-consumer', private: true,
      dependencies: {
        '@bitfire/tokens': `file:${fwd(packed.tokens)}`,
        '@bitfire/ui': `file:${fwd(packed.ui)}`,
        react: '^18.0.0', 'react-dom': '^18.0.0', 'react-aria-components': ui.peerDependencies['react-aria-components'],
      },
    });
    writeFileSync(join(bad, '.npmrc'), 'strict-peer-deps=true\n');
    try { sh('npm install --no-audit --no-fund', bad); }
    catch (e) {
      const text = `${e.stdout ?? ''}${e.stderr ?? ''}`;
      if (!/ERESOLVE/.test(text)) throw new Error(`install failed, but not on a peer conflict: ${text.split('\n')[0]}`);
      return 'refused on the peer conflict';
    }
    throw new Error('npm accepted React 18 against a React 19 peer range');
  });
} finally {
  rmSync(work, { recursive: true, force: true });
  // rmSync with force hides some failures, so look.
  if (existsSync(work)) console.error(`warning: could not remove ${work}`);
}

const w = Math.max(...steps.map((s) => s[0].length));
for (const [name, status, note] of steps) {
  console.log(`  ${status === 'pass' ? 'ok  ' : status === 'FAIL' ? 'FAIL' : '--  '} ${name.padEnd(w)}  ${note}`);
}
if (failed) { console.error('\nCLEAN INSTALL FAILED'); process.exit(1); }
console.log('\nclean install proven from tarballs (no registry)');
