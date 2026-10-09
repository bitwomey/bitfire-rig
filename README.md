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
| Every gate rejects what it should | Proven — 8/8 gate-failure tests |
| Documents and UI share one source | Proven — the specimen renders from the token package |
| Fire danger values | Reviewed and confirmed by a qualified FBAN |
| The workbench builds and runs every Button story | Proven locally — `storybook build` succeeds and lists the 12 stories; the interactive `storybook dev` server was not run |
| Accessibility violations fail locally, in both themes | Proven locally — a deliberately broken story fails on axe rules `button-name` and `label`; a dark-only and a light-only contrast failure each failed the run |
| CI fails on an accessibility violation | Proven — in the CI run for PR #22 the proof story failed on axe rules `button-name` and `label` and the gate reported it as intended. A CI run turned red by a real component violation has not been seen, because no component has one |
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

`npm run check:a11y` does two things. It runs every real story and requires a
pass. Then it runs `packages/ui/proof/`, a story with a nameless button and an
unlabelled input that is kept out of the workbench (set `A11Y_PROOF=1` to
select it), and requires it to fail with the axe rules `button-name` and
`label` in the output. Playwright needs its browser once:
`npx playwright install chromium`.

## Public repo

CI runs on GitHub-hosted runners, which are free and unmetered on public
repositories. Do not point these workflows at a self-hosted runner while this
repo is public: a fork can open a pull request that runs arbitrary code on it.

## Quick start

    node tools/generate.mjs packages/tokens/src/tokens.json packages/tokens/dist
    bash tools/gate-tests.sh
    node tools/release.mjs packages/tokens <registry> --dry-run

See CONTRIBUTING.md for the rules, and the issues for what is outstanding.
