# BITFire design rules

Rules that constrain how things are built and that no token can express.
Values live in `packages/tokens/src/tokens.json`; this file holds the prose.
The brand book (voice, logos, colour method) lives in the Design artifact; see
"How the design system stays in sync" in CONTRIBUTING.md. The `bitfire-design`
skill is generated from these sources, so a rule that is not here or in the
tokens is not in the skill.

## Rulings

- **`brand-ember` is for the brand, not the application.** Wordmark, cover and
  brand marks only (the token's own usage text). It is not used in application
  chrome, so not in active navigation either, and never in a data region or
  beside a rating chip. Decided 2026-10-10 (Ben accepted the stricter repo
  wording over the skill's "masthead, active nav").
- **Nothing below 14px drops below font-weight 400, with one recorded
  exception:** `caption` (12px, weight 300). Thin strokes bloom on dark
  grounds, so the exception is a known cost, not a precedent. Raising `caption`
  to 400 changes pixels, so it is its own change with visual baselines.
- **The type scale is light, not uniformly extra-light:** display-xl and
  display-lg 200, display-md 300, body 300, readouts 200 to 400. The tokens
  are the truth; do not quote "display 200" as a blanket rule.
- **Chart type is whatever suits the question.** There is no dual-axis rule.
  Dropped 2026-10-10.
- **Fire danger values are reviewed, not verified against the AFAC document.**
  Ben confirmed them by inspection on 2026-10-08; the `fdr-*` tokens carry that
  provenance. Say "reviewed by inspection" in anything public-facing, never
  "verified against the AFAC style guide".

## Process rules

- **Render it and look at it.** Screenshot a chart or page before calling it
  done. Label collisions, backwards ramps and layout defects do not show up in
  the code.
- **Validate a new chart palette** with the `dataviz` skill's runnable
  validator rather than reasoning about it.
- **Icons:** Phosphor, regular weight by default, fill for the active state.
- **Emphasis charts** dim everything but the focus with `opacity-context-dim`
  applied to `ink-subtle`.

## Brand colour is not decoration

Ben, 2026-10-10: the brand is important and is not sprinkled around. If a use of
`brand-ember` looks like decoration, it goes. The documents consumer currently
uses it on the pull-quote bar (`.pull` in `consumers/docs/style.css`), which is
decoration and is to be changed to a neutral token. The title-block eyebrow and
short rule are on the cover, so they stay.
