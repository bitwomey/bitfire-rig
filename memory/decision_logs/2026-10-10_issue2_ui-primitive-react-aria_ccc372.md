---
name: ui-primitive-react-aria
description: "Ben chose React Aria Components over shadcn/ui as the primitive layer for @bitfire/ui after a two-candidate trial; shadcn would put Tailwind default values in vendored source that tokens cannot own"
type: decision
---

**Decision (Ben, 2026-10-10):** `@bitfire/ui` is built on React Aria Components, styled with Tailwind 4 mapped to the BITFire tokens. Evidence: `research/primitive-trial/DECISION.md` (PR #21, issue #2).

**Why.** The repo's governing rule is that values live only in `tokens.json`. shadcn/ui copies Tailwind defaults (sizes, radii, opacities, z-index, `dark:` variants, a 50 percent focus ring) into the repo as component source, so a banned-pattern gate would be an ongoing cost. React Aria ships no styles. Installed packages: 58 against 129, one primitive library against two (the shadcn combobox is Base UI, not Radix). Cost: a larger bundle (about 200 kB against 160 kB gzipped) and a wrapper layer written by us.

**Limits of the evidence.** One run per candidate, each by a separate Sonnet agent; Chromium only; no screen reader; builds not like for like (Edge against headless Chromium, built date field against native input).

**Departure to remember.** The `bitfire-design` skill (outside the repo) still says to use shadcn/ui for unbuilt components. It predates the trial and needs updating separately.

**Revisit when:** the bundle size matters for a consumer, or the screen-reader behaviour is tested and differs. Modals over a Cesium canvas are untested (map work is deferred).
