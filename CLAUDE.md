# Working in this repo

You are working in BITFire's build rig. Read this before changing anything.

## The design system

This project uses the BITFire design system. Before writing any UI, chart,
document or deck code, load the `bitfire-design` skill and follow it. Never
hard-code a colour, size or radius — use the tokens.

**If you depart from that skill for any reason, say so in the response, in
plain words, at the point you depart.** A silent departure is the failure
mode that matters most here. "I'll remember next time" is not a mechanism;
the gates below are.

## The governing rule

**Edit an authoritative source, regenerate its derived outputs.**

Design *values* live in `packages/tokens/src/tokens.json` and nowhere else.
Everything in `packages/tokens/dist/` is generated — never hand-edit it. If a
generated file is wrong, the generator is wrong.

The BITFire design system also exists as a Claude Design artifact
(https://claude.ai/artifact/FvCg7Vws1achAViYQAZDmn) and as the `bitfire-design`
skill. Ownership is split by kind of thing, and never duplicated by hand:

- **The repo owns token values.** The artifact's `project/tokens.json` is
  published *from* `tokens.json` (`node tools/design-system.mjs export <dir>`) and
  the skill's token table is generated from it. Never edit either by hand.
- **The repo owns the build rules** (`DESIGN-RULES.md`), which the skill is generated from.
- **The artifact owns the brand book and voice** (README, colour method, voice,
  logos). The repo and the skill point at it and do not copy it.
- If the artifact and the repo disagree about a token, the repo is right: run
  `node tools/design-system.mjs check <saved artifact tokens.json>` and republish.
  "How the design system stays in sync" in CONTRIBUTING.md has the steps.

Components, templates, generators and test specifications are authored source
in their own right. Tokens cannot express component behaviour, accessibility
contracts or document layout logic, so do not try to push them in there.

## Before you push, always

    npm run check

That runs three gates: generated output is not stale, no raw colour outside
the generated token file, and the gate suite still rejects what it should.
CI runs exactly these. There is no check that exists only in CI and none that
exists only locally, so a local failure is a guaranteed red PR. One declared
exception: the visual regression gate (`npm run check:visual`) is pinned to the
Linux renderer, so on Windows it prints that it is SKIPPED and CI runs it for
real. See "Visual baselines" in CONTRIBUTING.md.

**Do not push on a shallow pass.** Do not report that something works because
the code looks right. Run it, read the output, and say what you observed. If
you could not verify something, mark it unverified rather than asserting it.

## How work lands

1. Branch from `main`. Never commit to `main` — it is protected and the
   push will be rejected.
2. Make the change. Keep commits small and write why, not what.
3. `npm run check`, and read the output.
4. Push and open a **draft** PR that says `Closes #<issue>`.
5. Wait for the `gates` check. Only once it is green, mark the PR ready and
   request review from @bitwomey.
6. If CI fails, fix the branch. Do not mark it ready.

`ship.ps1` does steps 4 to 6 in one command if you would rather not drive
`gh` directly.

## What is proven and what is not

`README.md` has a table of exactly this. Respect it. Several things in this
repo are deliberately marked unproven — the private registry path, anything
about components, rollback against a real registry. Do not write code or
documentation that assumes those are settled.

## Things that have already bitten

These are real failures from this repo's history, each now guarded. Do not
reintroduce them.

- **`new URL(...).pathname` on Windows** gives `/C:/...`, which node cannot
  open. Use `fileURLToPath`.
- **`rm -f` reports success when the delete fails.** Never trust it for
  cleanup; verify, or write temporary files outside the repo.
- **`zip -r` updates an archive rather than replacing it**, so stale files
  accumulate. Delete the archive first, or build it from `git archive`.
- **Descendant CSS selectors bleed between list levels.** Use strict child
  chains when a rule must apply to exactly one depth.
- **IBM Plex has no U+25CF or U+25CB.** A glyph bullet silently substitutes
  another font. Draw those markers in CSS.
- **Raw HTML indented four spaces inside markdown becomes a code block.**
- **npm warns but installs anyway on a peer-dependency conflict.**
  `strict-peer-deps=true` is why that is now a refusal.
- **A check that misreports its own failure** is worse than one that crashes.
  Surface the underlying error, do not replace it with a guess.

## Scope discipline

Do one issue per branch. If you find a second problem while working, say so
and open an issue for it rather than widening the PR. A PR that fixes the
thing it says it fixes is reviewable; one that fixes four things is not.
