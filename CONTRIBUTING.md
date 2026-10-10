# Working on the rig

One rule: **a change lands through a PR that CI has passed.** Everything else
here serves that.

## Before you push

    node tools/check-stale.mjs packages/tokens/src/tokens.json packages/tokens/dist
    node tools/check-rawcolour.mjs packages fixtures consumers
    bash tools/gate-tests.sh
    npm run build:ui
    npm run check:build
    npm run check:app
    npm run check:a11y
    npm run check:visual

`npm run check` runs all of them, in that order. The build comes before the
app consumer because the consumer imports the built `packages/ui/dist/`.
`check:build` loads that build under plain Node and inspects `dist/styles.css`
(see `packages/ui/scripts/check-build.mjs`). The accessibility gate needs
Chromium once: `npx playwright install chromium`. CI runs exactly these. There
is no check that only exists in CI, and none that only exists locally, with
**one declared exception**: `check:visual` really runs only on Linux. Its
baselines are drawn by the Chromium on the CI runner, and other operating
systems render text and edges differently, so on Windows and macOS it prints
that it was SKIPPED and exits 0. A green `npm run check` on those systems says
nothing about the screenshots; CI does. See "Visual baselines" below.

## Visual baselines

The visual gate (`npm run check:visual`, `packages/ui/visual/`) screenshots
every story in both themes and compares each with a committed PNG in
`packages/ui/visual/__screenshots__/` (files named `<story>--<theme>-linux.png`).

**What it proves.** A story still renders exactly as it did when its baseline
was accepted, to the pixel, on the pinned renderer. A deliberate visual change
is caught (the check proves that on every run). **What it does not prove.**
That a baseline was ever right. A wrong screen, once accepted, is guarded as
faithfully as a correct one. Accepting every changed screenshot turns the gate
into a rubber stamp that stays green, which is worse than no gate.

**Policy.**

- A baseline changes only in a pull request where the changed PNGs are in the
  diff and a human has looked at each one and agrees the new picture is the
  intended one.
- Never regenerate everything to make a red check green. A red check is a
  question: did this change what the user sees? Answer it, per image.
- CI never writes a baseline and never passes an update flag. A missing or
  different screenshot fails the gate.
- Baselines are Linux only. Do not commit `-win32` or `-darwin` PNGs (they are
  gitignored).
- Ben approves baseline changes. Do not mark a PR with changed PNGs ready
  without saying which stories changed and why.

**Steps to accept a new baseline.**

1. Make the change on a branch and push it. The CI visual step fails and names
   the stories that differ.
2. In GitHub, Actions, run the **Visual baselines** workflow on that branch. It
   builds Storybook, renders every story on `ubuntu-latest`, and uploads an
   artifact named `visual-baselines`. It commits nothing.
3. Download the artifact and replace the contents of
   `packages/ui/visual/__screenshots__/` with it (delete the old `-linux.png`
   files first, so removed stories leave no stale file).
4. Commit the PNGs and open or update the PR. Review the image diffs in the PR,
   one by one. Any PNG you did not mean to change is a regression, not a
   baseline.
5. Ben reviews and approves. Merge only when the CI visual step is green.

**Why PNGs live in git.** They are binary files, which the engineering
standards (STD-0013, a candidate) discourage. They stay because the baselines
are the authoritative source of truth for this gate: they cannot be generated
from anything else, and a reviewer needs to see them in the diff. They are kept
small (viewport 800x600, about 9 KB each on average) to bound the cost.

**Determinism.** Fixed viewport and device scale factor, animations disabled,
caret hidden, UTC and fixed locale, the play function finished (Storybook's
`storyRendered` event) and `document.fonts.ready` awaited before each shot,
self-hosted IBM Plex loaded in the workbench only, full-page captures. If a
screenshot is flaky, find out why. Do not widen the pixel tolerance, retry, or
regenerate.

## Releasing

    node tools/release.mjs packages/tokens <registry>

Refuses on: a malformed manifest, stale generated output, raw colour in source,
a file declared in `files[]` that is absent, a version already published or not
greater than the latest, or a gate that no longer rejects what it should.
Takes about 70 seconds, most of it the gate-failure suite. That suite is the
reason to run it, so it is not skippable.

## Versioning

Semver, with one addition: **visual change is breaking change**. A spacing or
colour shift can break a client's signed-off layout without altering a
TypeScript signature, so judge the bump on rendered output, not on types.

`strict-peer-deps=true` belongs in every consumer's `.npmrc`. Without it npm
prints a warning and installs an incompatible pair anyway, exit 0.

## Issues

An issue is durable context for a future session, not ceremony. Three lines:
what, why it matters, and the check that settles it. Anything an agent would
otherwise have to rediscover belongs in one.

## Why nothing is published yet

Consumers resolve `@bitfire/tokens` and `@bitfire/ui` through npm workspaces,
so no registry is involved during development. `npm install` at the repo root
links everything.

Publishing waits for the move to the BITFire organisation. GitHub Packages
scopes a package to the account hosting it, and the `@bitfire` scope wants
that org. Publishing from a personal repo would mean either the wrong scope
now or a rename later, and a rename breaks every consumer.

The distribution model itself is already proven — clean install, upgrade,
rollback, immutable versions and peer-conflict detection were all demonstrated
against a real registry. See the Phase 3 notes in README.md.
