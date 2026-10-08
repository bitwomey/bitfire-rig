# Working on the rig

One rule: **a change lands through a PR that CI has passed.** Everything else
here serves that.

## Before you push

    node tools/check-stale.mjs packages/tokens/src/tokens.json packages/tokens/dist
    node tools/check-rawcolour.mjs packages fixtures
    bash tools/gate-tests.sh

CI runs exactly these. There is no check that only exists in CI, and none that
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
