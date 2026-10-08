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
| Anything about components | **Not started** |
| Private registry auth, CI access | **Not proven** |

## Quick start

    node tools/generate.mjs packages/tokens/src/tokens.json packages/tokens/dist
    bash tools/gate-tests.sh
    node tools/release.mjs packages/tokens <registry> --dry-run

See CONTRIBUTING.md for the rules, and the issues for what is outstanding.
