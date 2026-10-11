# Working on the rig

One rule: **a change lands through a PR that CI has passed.** Everything else
here serves that.

## Before you push

    node tools/check-stale.mjs packages/tokens/src/tokens.json packages/tokens/dist
    node tools/check-rawcolour.mjs packages fixtures consumers
    bash tools/gate-tests.sh
    npm run build:ui
    npm run check:build
    npm run check:install
    npm run check:app
    npm run check:a11y
    npm run check:visual

`npm run check` runs all of them, in that order. The build comes before the
app consumer because the consumer imports the built `packages/ui/dist/`.
`check:build` loads that build under plain Node and inspects `dist/styles.css`
(see `packages/ui/scripts/check-build.mjs`). `check:install` packs both packages
and installs the tarballs into an empty directory outside the repo with
`strict-peer-deps`, then renders a Button, resolves both CSS files and compiles a
TypeScript import, and checks that React 18 is refused (`tools/check-install.mjs`;
it needs the network and takes minutes on Windows). The accessibility gate needs
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
was accepted, to within 20 pixels (edge anti-aliasing noise, measured at 7) and with exact colours, on the pinned renderer. A deliberate visual change
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
small (viewport 800x600, about 7 KB each on average on win32, 1.2 MB for 180) to bound the cost.

**Determinism.** Fixed viewport and device scale factor, animations disabled,
caret hidden, UTC and fixed locale, the play function finished (Storybook's
`storyRendered` event) and `document.fonts.ready` awaited before each shot,
self-hosted IBM Plex loaded in the workbench only, full-page captures. If a
screenshot is flaky, find out why (a diff-image artifact is uploaded when the
gate fails). Known limit: hover is baselined only by the `*-hovered` stories, so
an element that wrongly stays hovered in another story is not caught. Do not widen the 20-pixel tolerance, retry, or regenerate: a
looser limit hides small real changes such as a corner radius.

## How the design system stays in sync

The BITFire design system lives in three places: this repo, a Claude Design
artifact (https://claude.ai/artifact/FvCg7Vws1achAViYQAZDmn) and the
`bitfire-design` skill. They stay in step by giving each kind of thing one owner
and publishing the rest from it.

| Kind of thing | Owner | Everywhere else |
| --- | --- | --- |
| Token values (colours, type, spacing...) | **the repo** (`packages/tokens/src/tokens.json`) | the artifact's token view and the skill's token table are published from it |
| Build rules that constrain how things are made (`DESIGN-RULES.md`) | **the repo** | the skill is generated from them |
| Brand book and voice (README, colour method, voice) | **the artifact** | the repo and the skill point at it, never copy it |
| Logos and brand files | **the artifact** | copied into `assets/brand/` with their SHA-256 |

**To change a token** (you do not need to run anything): tell Claude what to
change. Claude edits `tokens.json` in a pull request, the checks run, you review
and merge, then Claude republishes the artifact from the repo and hands you the
refreshed token table for the skill. You never edit the artifact's token view or
the skill's table directly.

**To see whether they have drifted:** save the artifact's `project/tokens.json` and
run `node tools/design-system.mjs check <that file>`, which says "ok" or names each
token that differs. Drift is detected on a schedule by Cowork, not by a step in
every session.

**What the tool does** (`tools/design-system.mjs`): `export <dir>` writes the
artifact's `tokens.json` (byte-identical to the repo's) and a `token-table.md`
listing every colour token for the skill; `check <file>` compares a saved copy of
the artifact's file with the repo's. The gate-failure suite shows that a changed
copy is reported as drift.

**Known limits.** CI cannot read the artifact (it sits behind claude.ai), so drift
is not found on every push. The skill is a read-only cache of an account skill on
claude.ai: nothing here writes to it. A generator in this repo emits the skill body
to a file, and a Cowork session turns that into a proposal Ben approves.

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
