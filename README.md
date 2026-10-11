# BITFire build rig

The shared foundation behind BITFire's applications, documents and decks:
design tokens, components, and the checks that keep them honest.

## Layout

    packages/tokens      @bitfire/tokens — generated CSS variables + typed exports
    packages/ui          @bitfire/ui     — authored React components (src/ is source;
                                           dist/ is a build output, not in git)
    assets/brand         the BITFire logo set (SVG and PNG), copied from the design system
    tools/               generator, gates, release gate
    consumers/app        a fixture application consuming both packages
    consumers/docs       the document pipeline (markdown + bib -> PDF)
    fixtures/            disposable files the gate-failure tests break on purpose

## The governing rule

**Edit an authoritative source, regenerate its derived outputs.** Design
*values* have one source and are never hand-edited downstream. Components,
templates, generators and test specifications are authored source in their own
right.

## What is proven, and what is not

| Claim | Status |
| --- | --- |
| Generation is deterministic | Proven — two runs byte-identical |
| A fix reaches a consumer on upgrade | Proven — value and source hash both propagate |
| A consumer is not silently changed | Proven — stays put until it upgrades |
| Rollback works | Proven on a local registry only |
| Versions are immutable | Proven — republish returns 409 |
| Peer conflicts are caught | Proven — but only with `strict-peer-deps=true`; npm warns and installs otherwise |
| Every gate rejects what it should | Proven — the gate-failure suite passes (`npm run check` and the release gate print the live count) |
| Documents and UI share one source | Proven — the specimen renders from the token package |
| The Tailwind 4 mapping is generated, not copied | Proven — `@bitfire/tokens/tailwind.css` is generated from `tokens.json`, covered by the stale check, and a new colour token reaches it with no other edit (gate tests). Swapping the fixture's hand-written mapping for it left the built CSS byte-identical (same file hash), measured once when it was swapped; no gate guards that. A dotted key such as `p-0.5` compiles to `var(--space-0\.5)` |
| Fire danger values | Reviewed and confirmed by a qualified FBAN |
| The workbench builds and runs every Button story | Proven locally — `storybook build` succeeds and lists the 12 stories; the interactive `storybook dev` server was not run |
| Accessibility violations fail the gate, per theme | Proven — committed proof stories fail on axe rules `button-name` and `label`, and on `color-contrast` under the light theme only (a token pair that fails in light and passes in dark), both in the page and inside a portalled dialog. Removing the global `a11y` setting makes the gate fail. A dark-only failure has not been demonstrated, because no token pair fails only in dark |
| CI fails on an accessibility violation | Proven — in the CI run for PR #22 the proof story failed on axe rules `button-name` and `label` and the gate reported it as intended; the later CI run on the same PR also showed the light-only `color-contrast` proof failing in light (that run predates the per-theme harness, which replaced the light container with a per-theme run). A CI run turned red by a real component violation has not been seen, because no component has one |
| `@bitfire/ui` builds and exports its components | Proven locally — `npm run build:ui` emits `dist/index.js` (ESM), `dist/*.d.ts` (tsc) and `dist/styles.css`; `check:build` loads the build under plain Node, confirms all 27 exports, server-renders a Button, and was shown to fail for a missing export, a throwing Button, a missing token utility, a preflight reset in the CSS, and tokens.css leaking into the CSS. CI runs the same npm scripts. The release gate now builds the package and runs `check:build` before it checks that the declared files exist |
| The compiled CSS works without Tailwind or preflight in the consumer | Proven for Button, TextField, Checkbox, Modal (plus a spot check of the other components) — a Tailwind-free Vite page was screenshotted in Edge, dark and light. That showed preflight had been hiding real defects, now fixed in the component classes. One browser, one page; a different reset in a consumer's own CSS has not been tried |
| Components beyond that: behaviour and accessibility | Axe-checked per theme in the workbench (the accessibility gate above). Not exercised inside a real consumer application |
| The visual regression machinery works | Proven locally on **Windows only**, against throwaway win32 baselines: 180 screenshots (90 stories x 2 themes) were generated, a second run matched them all, and a run with a global border-radius injected failed 17 of the 24 Button screenshots, every failure a `toHaveScreenshot` pixel mismatch, none a crash. Probed once on win32: animations disabled made 4 Spinner shots identical where allowing them gave 4 different ones; a shot taken before the story finished differed from one after; a full-page shot contains the portalled dialog that the story root excludes; with the fonts loaded the button rendered IBM Plex Sans, with them blocked Segoe UI. Caret hiding and `document.fonts.ready` were **not** shown to matter in any probe (kept as cheap safeguards). On win32 the real check is SKIPPED by design |
| The committed visual baselines are right | **Not proven.** Linux baselines have not been produced yet (run the `visual-baselines` workflow). A baseline only proves a story has not changed since someone looked at it; it does not prove it was ever correct |
| The visual gate is stable across CI runs and runner images | **Not proven.** Needs repeated Linux runs of the same commit |
| A clean install from the packed tarballs works | Proven on Windows and in CI (issue #42): `npm run check:install` packs both packages, installs the tarballs into an empty directory outside the repo with `strict-peer-deps`, server-renders a Button, resolves `styles.css`, `tokens.css` and `tailwind.css`, compiles a TypeScript import, and was shown to fail when the `ui` package also shipped `src/`. React 18 is refused. No registry involved, so this says nothing about publishing. The same four steps passed in CI on ubuntu-latest in about 8 seconds (PR #43). Only React 18 was tried as an incompatible peer |
| Private registry auth, CI access | **Not proven** |

## The workbench

Storybook 10 lives in `packages/ui/.storybook`. Run it with
`npm run storybook --workspace @bitfire/ui`.

Components are React Aria Components styled with Tailwind 4 utilities mapped to
the tokens. Every component has stories here.

## The package

`npm run build:ui` builds `packages/ui/dist/` (not committed):

- `index.js` — ESM from Vite library mode (`vite.lib.config.ts`). `react`,
  `react-dom`, `react/jsx-runtime`, `react-aria-components` and
  `@bitfire/tokens` are external, so they are peer dependencies.
- `index.d.ts` and friends — declarations from tsc (`tsconfig.build.json`).
- `styles.css` — the Tailwind utilities the components use and the theme
  mapping, compiled from `src/styles.entry.css`. It does **not** include
  Tailwind's preflight reset (it would restyle the consumer's page) and does
  **not** include the token variables. Components therefore must not rely on
  preflight; give an element its own `box-border`, margins and borders.

A consumer needs no Tailwind. It imports both stylesheets, the tokens first:

    import '@bitfire/tokens/tokens.css';   // the variables, themes via data-theme
    import '@bitfire/ui/styles.css';       // the compiled utilities
    import { Button } from '@bitfire/ui';

`tokens.css` is the consumer's to import because the variables are the
consumer's to theme, and the Tailwind mapping reads them at runtime. Without
it the components render with no colour or type. The public entry point is
`packages/ui/src/index.ts`; `statusBadgeStyle` and friends live in
`src/statusBadge.ts`.

How the themes work. The toolbar (`@storybook/addon-themes`) sets
`data-theme` on the document, dark by default or `light`. Under Vitest the
mode is `test`, and `VITE_A11Y_THEME` (`dark` or `light`) sets the theme for
the whole run, on the document. Setting it on the document, not on a container
around the story, is what makes content React Aria portals into `<body>`
(popovers, listboxes, dialogs) take the theme under test. `check:a11y` runs
the stories once per theme.

How accessibility fails. `parameters.a11y.test` is `'error'` globally in
`preview.tsx`, and `@storybook/addon-vitest` runs every story as a test in
headless Chromium (Playwright), so a violation fails the test.

`npm run check:a11y` runs every real story under each theme and requires a
pass. Then it runs three proof stories from `packages/ui/proof/`, kept out of
the workbench (select one with `A11Y_PROOF=<file stem>`). `a11y-violation` has
a nameless button and an unlabelled input and must fail on the axe rules
`button-name` and `label`. `contrast-light` and `portal-contrast-light` use a
token pair that is below 4.5:1 in the light theme only, in the page and inside
a portalled dialog; each must fail on `color-contrast` under light and pass
under dark. The proofs set no accessibility setting of their own, so they fail
only while the global one is on. Playwright needs its browser once:
`npx playwright install chromium`.

## Visual regression

`npm run check:visual` builds the static Storybook, screenshots every story in
both themes with Playwright's `toHaveScreenshot` (`packages/ui/visual/`) and
compares each with the committed baseline in
`packages/ui/visual/__screenshots__/`. It then re-runs a subset with a
deliberate change injected (`VISUAL_PROOF=1`, a global border radius) and
requires that run to fail by screenshot comparison.

What is pinned: viewport 800x600, device scale factor 1, Playwright's
`animations: 'disabled'`, the caret hidden, UTC and a fixed locale, the story's
play function finished (Storybook's `storyRendered` event) and
`document.fonts.ready` awaited before the shot, full-page captures (so portalled
dialogs and popovers are in the frame), and self-hosted IBM Plex loaded only in
`.storybook/preview.tsx` (`@fontsource/*` devDependencies, latin subset, the
weights `tokens.json` uses). `@bitfire/ui` itself still ships no font files.
`prefers-reduced-motion` is deliberately not emulated: the Spinner and Skeleton
stories assert their animation is running, which reduced motion switches off.

**Declared exception to "no check only in CI".** The baselines are drawn by
the Linux Chromium on the GitHub `ubuntu-latest` runner, and file names carry
the platform (`name--dark-linux.png`). Only the Linux ones are committed; the
win32 and darwin patterns are gitignored. On any other OS `check:visual` prints
that it was SKIPPED, why, and how to run it for real, and exits 0. The gate
therefore really runs only in CI. Nothing weaker than that is acceptable here:
a comparison on another OS would be meaningless or would tempt people to
regenerate baselines locally. `VISUAL_ALLOW_NON_LINUX=1` runs the machinery
locally against throwaway local baselines; it proves nothing about the
committed ones.

`npm run visual:update` regenerates the baselines (Linux only). CI never runs
it, and never passes an update flag: a missing or different screenshot is a
failure. The `visual-baselines` workflow (manual) runs the update on
`ubuntu-latest` and uploads the folder as an artifact; see "Visual baselines"
in CONTRIBUTING.md for the policy on accepting a new baseline.

## Public repo

CI runs on GitHub-hosted runners, which are free and unmetered on public
repositories. Do not point these workflows at a self-hosted runner while this
repo is public: a fork can open a pull request that runs arbitrary code on it.

## Quick start

    node tools/generate.mjs packages/tokens/src/tokens.json packages/tokens/dist
    bash tools/gate-tests.sh
    node tools/release.mjs packages/tokens <registry> --dry-run

See CONTRIBUTING.md for the rules, and the issues for what is outstanding.
