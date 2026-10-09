# Working on the rig

One rule: **a change lands through a PR that CI has passed.** Everything else
here serves that.

## Before you push

    node tools/check-stale.mjs packages/tokens/src/tokens.json packages/tokens/dist
    node tools/check-rawcolour.mjs packages fixtures consumers
    bash tools/gate-tests.sh
    npm run check:a11y

`npm run check` runs all four. The accessibility gate needs Chromium once:
`npx playwright install chromium`. CI runs exactly these. There is no check that only exists in CI, and none that
only exists locally.

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
