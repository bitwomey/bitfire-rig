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
  beside a rating chip. Decided 2026-10-10.
- **Nothing below 14px drops below font-weight 400, with one recorded
  exception:** `caption` (12px, weight 300). Thin strokes bloom on dark
  grounds, so the exception is a known cost, not a precedent. Raising `caption`
  to 400 changes pixels, so it is its own change with visual baselines.
- **The type scale is light, not uniformly extra-light:** display-xl and
  display-lg 200, display-md 300, body 300, readouts 200 to 400. The tokens
  are the truth; do not quote "display 200" as a blanket rule.
- **`viz-6` is orange, and that is accepted.** Warm colour otherwise means
  severity, but the sixth categorical slot is orange and stays. Ben, 2026-10-11:
  "If orange looks good, go with it." It is the last categorical slot, so a chart
  with four or fewer series (the cap) never reaches it.
- **Chart type is whatever suits the question.** There is no dual-axis rule.
- **Fire danger values are reviewed, not verified against the AFAC document.**
  Ben confirmed them by inspection on 2026-10-08; the `fdr-*` tokens carry that
  provenance. Say "reviewed by inspection" in anything public-facing, never
  "verified against the AFAC style guide".
- **The four-slot categorical palette passes CVD separation; no per-type tokens
  are added.** Measured with `validate_palette.js` (OKLab ΔE ×100) on
  2026-10-20 against `viz-1`…`viz-4` (the four-series cap):
  dark mode all-pairs worst ΔE: deutan 9.8, tritan 8.0, normal 15.3 — all pass
  (tritan is at the 6–8 floor: secondary encoding required in dark theme).
  Light mode all-pairs worst ΔE: protan 6.8, tritan 17.0, normal 15.5 — all pass
  (protan is at the 6–8 floor: secondary encoding required in light theme).
  `viz-1` (#4ca6ea) and `viz-3` (#b6ab00) contrast 2.2:1 and 2.0:1 against the
  light surface — direct labels or a table view are required in light theme.
  Slots 5 and 6 are beyond the cap; their all-pairs failures are expected and
  already covered by the four-series cap rule. Separate deutan / protan / tritan
  alternate token sets are not needed.

## Process rules

- **Render it and look at it.** Screenshot a chart or page before calling it
  done. Label collisions, backwards ramps and layout defects do not show up in
  the code.
- **Validate a new chart palette** with the `dataviz` skill's runnable
  validator rather than reasoning about it.
- **Icons:** Phosphor, regular weight by default, fill for the active state.
- **Emphasis charts** dim everything but the focus with `opacity-context-dim`
  applied to `ink-subtle`.

## Chart rules

- **Categorical colour:** `viz-1` onward, in order, never cycled, at most four in
  one chart. A fifth series folds into "Other", becomes facets, or changes form.
- **Separation gate:** adjacent-pairs separation is the gate for bars, lines and
  stacks. Scatter, bubble and choropleth forms cap at three series. No palette
  separates all six slots from each other, so do not promise it. The four-slot
  cap is the CVD gate mechanism — see the ruling above for measured scores.
- **Sharing a region with a rating:** where `viz-*` and `fdr-*` genuinely share a
  region (a classed map layer under a fire danger legend), use `sev-*` or a
  single-hue ramp for the other layer, never the categorical set.
- **New colours:** do not add one without running the validator.

## Fire danger rules

- `fdr-*` is for fire danger ratings only, never for anything else.
- A map fill with no adjacent word gets hatching per band as the non-colour
  channel: `HazardFill` / `hazardFillStyle` in `@bitfire/ui`. Extreme against
  Moderate is hard to tell apart under protanopia, so the word on every chip and
  hatching on every map fill carry the meaning. The patterns differ in
  structure, not only density: No Rating plain, Moderate one sparse diagonal
  arm, High one dense arm, Extreme two sparse arms (crosshatch), Catastrophic
  two dense arms. Pitches are the `hatch-pitch-*` tokens, strokes `stroke-hair`,
  ink `ink-on-warm` (`ink-on-deep` on Catastrophic). The pattern is chosen by
  band, never by colour, so it never re-tints the ramp. Judged by eye in the
  `HazardFill` stories, over a stand-in basemap and under an approximate
  deuteranopia matrix; not measured, and not yet tried on the Cesium ion
  basemap in the Plume UI.
- A status dot has a second channel in its fill: filled means resources are
  actively suppressing, hollow means they are on scene and sizing up. Where that
  cannot be derived from public feeds, use the filled dot rather than inferring.

## Document and slide rules

- Documents and decks always use the light theme values, whatever the on-screen
  default. Hazard fills are theme-independent and print as they are.
- A4 portrait pages: margins 22 mm outer, 26 mm top, 20 mm foot, a measure of 68
  to 76 characters; print body is 10.5 pt on 15 pt leading in Plex Serif.
- Slides are 16:9, authored at 1920 x 1080, with a 72 px safe margin and nothing
  meaningful within 48 px of an edge. Body is 18 pt minimum and never below 14 pt.
- Projected slides: `ink-subtle` is not used, `ink-muted` is the floor, and every
  text pair clears 7:1 rather than 4.5:1. Dark slides suit a darkened room; use
  light when the lighting cannot be controlled.

## Brand colour is not decoration

Ben, 2026-10-10: the brand is important and is not sprinkled around. If a use of
`brand-ember` looks like decoration, it goes. The documents consumer uses it only
on the cover title block (the eyebrow and the short rule), which is a brand use.
