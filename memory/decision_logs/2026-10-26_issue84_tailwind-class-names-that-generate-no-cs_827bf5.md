---
name: tailwind-class-names-that-generate-no-css
description: Why Panel and Toolbar's border-hairline and shadow-panel rendered nothing, how it got past local checks, and the rule for naming token utilities in packages/ui
type: decision
---

# Tailwind class names that generate no CSS (issue #84, PR #86, 2026-10-26)

## What happened
`Panel` and `Toolbar` used `border-hairline` and `shadow-panel`. Neither matches a utility Tailwind
generates from the BITFire tokens, so the Panel header and footer dividers, the Panel shadow, the
overlay Toolbar shadow and the docked Toolbar border did not render. Nothing failed: Tailwind drops an
unknown class silently, the a11y gate cannot see a missing hairline, and the committed Linux
baselines had captured the broken render, so the visual gate passed.

A cold review of the first head found it (review 5646134467). I confirmed it by searching the built
`packages/ui/dist/styles.css` for the selectors: none existed.

## The fix and the rule
- Border colours from the `--color-*` theme map are named by the token: `border-border-hairline`
  (the token is `border-hairline`, so the utility is `border-` plus it).
- Shadows have no theme-map entry, so use `shadow-[var(--shadow-panel)]`, the form `Modal` already
  uses with `--shadow-lg`.
- After adding a token utility, grep the built `styles.css` for the generated selector before
  trusting the render. `check-build.mjs` checks a few utilities exist; it does not check every
  class a component uses.

## Why baselines did not catch it
A baseline records what rendered, not what was intended. Regenerating baselines after the fix
changed 10 Panel and 4 Toolbar images; that diff is the evidence the old ones were wrong. Treat a
first-ever baseline for a new component as unreviewed until someone has looked for the features
the component is supposed to have.

## Unresolved
- The first `npm run check` after the fix failed once in `check:a11y` on the proof-story self-test
  ("contrast-light failed in the dark theme"). The a11y script alone, then the whole check,
  passed on rerun. Cause not found; suspected load-related flake because that run had also timed out
  the tool's 600 s limit. If it recurs, capture the full a11y output before rerunning.
- The Visual baselines workflow produces byte-different Button and Pagination images on every run.
  They pass the gate's tolerance; the difference was never measured.

Related: [[bitfire-ui-primitive-react-aria]]
