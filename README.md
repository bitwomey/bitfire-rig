# BITFire build rig

The shared foundation behind BITFire's applications, documents and decks:
design tokens, components, and the checks that keep them honest.

## Layout

    packages/tokens      @bitfire/tokens — generated CSS variables + typed exports
    packages/ui          @bitfire/ui     — authored React components
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
| Every gate rejects what it should | Proven — the gate-failure suite passes (28 tests at the time of writing; `npm run check` prints the live count) |
| Documents and UI share one source | Proven — the specimen renders from the token package |
| The Tailwind 4 mapping is generated, not copied | Proven — `@bitfire/tokens/tailwind.css` is generated from `tokens.json`, covered by the stale check, and a new colour token reaches it with no other edit (gate tests). Swapping the fixture's hand-written mapping for it left the built CSS byte-identical (same file hash). A dotted key such as `p-0.5` compiles to `var(--space-0\.5)` |
| Fire danger values | Reviewed and confirmed by a qualified FBAN |
| The workbench builds and runs every Button story | Proven locally — `storybook build` succeeds and lists the 12 stories; the interactive `storybook dev` server was not run |
| Accessibility violations fail the gate, per theme | Proven — committed proof stories fail on axe rules `button-name` and `label`, and on `color-contrast` in the light container only (a token pair that fails in light and passes in dark). Removing the global `a11y` setting makes the gate fail. A dark-only failure has not been demonstrated, because no token pair fails only in dark |
| CI fails on an accessibility violation | Proven — in the CI run for PR #22 the proof story failed on axe rules `button-name` and `label` and the gate reported it as intended; the later CI run on the same PR also showed the light-only `color-contrast` proof failing in the light container only. A CI run turned red by a real component violation has not been seen, because no component has one |
| Anything about components beyond one Button | **Not started** — Button exists only to prove the workbench and is not exported |
| Private registry auth, CI access | **Not proven** |

## The workbench

Storybook 10 lives in `packages/ui/.storybook`. Run it with
`npm run storybook --workspace @bitfire/ui`.

It holds one component, `Button` (React Aria Components, Tailwind 4 mapped to
the tokens), to prove the workbench. The Button is deliberately not exported
and not built; the build and export design belong to issue #5.

How the themes work. The toolbar (`@storybook/addon-themes`) sets
`data-theme` on the document, dark by default or `light`. Under Vitest the
mode is `test`, and then a decorator renders each story twice, once inside a
`data-theme="dark"` container and once inside `data-theme="light"`, so a
single axe run checks both. Adding `?globals=bothThemes:true` to a story URL
should show the same side-by-side view in the workbench (not tried).

How accessibility fails. `parameters.a11y.test` is `'error'` globally in
`preview.tsx`, and `@storybook/addon-vitest` runs every story as a test in
headless Chromium (Playwright), so a violation fails the test.

`npm run check:a11y` does three things. It runs every real story and requires a
pass. Then it runs two proof stories from `packages/ui/proof/`, kept out of the
workbench (select one with `A11Y_PROOF=<file stem>`). `a11y-violation` has a
nameless button and an unlabelled input and must fail on the axe rules
`button-name` and `label`. `contrast-light` uses a token pair that is below
4.5:1 in the light theme only, and must fail on `color-contrast` with every
failing node inside the light container. The proofs set no accessibility
setting of their own, so they fail only while the global one is on. Playwright
needs its browser once: `npx playwright install chromium`.

## Public repo

CI runs on GitHub-hosted runners, which are free and unmetered on public
repositories. Do not point these workflows at a self-hosted runner while this
repo is public: a fork can open a pull request that runs arbitrary code on it.

## Quick start

    node tools/generate.mjs packages/tokens/src/tokens.json packages/tokens/dist
    bash tools/gate-tests.sh
    node tools/release.mjs packages/tokens <registry> --dry-run

See CONTRIBUTING.md for the rules, and the issues for what is outstanding.
