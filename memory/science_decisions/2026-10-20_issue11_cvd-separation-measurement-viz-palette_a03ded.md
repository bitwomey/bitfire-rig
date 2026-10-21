---
name: cvd-separation-measurement-viz-palette
description: "Measured OKLab CVD separation for viz-1..4; four-slot cap confirmed as the CVD gate; no per-type alternate tokens needed"
metadata:
  type: project
  issue: 11
  date: 2026-10-20
---

## Finding

The four-slot categorical palette (`viz-1`…`viz-4`) passes all-pairs CVD separation when series
are capped at four, as the existing chart rules already require. No separate deutan/protan/tritan
alternate token sets are needed.

## Method

`validate_palette.js` (OKLab ΔE ×100) run against all four slots in dark and light themes,
using all-pairs mode (not just adjacent-pairs, which is the gate for bars/lines/stacks).

## Results (all-pairs worst ΔE, dark theme)

| Type | ΔE (worst pair) | Status |
|---|---|---|
| Deutan | 9.8 | PASS |
| Tritan | 8.0 | FLOOR |
| Normal | 15.3 | PASS |

Tritan is at the 6–8 floor in dark: secondary encoding required (shape/label) in dark theme.

## Results (all-pairs worst ΔE, light theme)

| Type | ΔE (worst pair) | Status |
|---|---|---|
| Protan | 6.8 | FLOOR |
| Tritan | 17.0 | PASS |
| Normal | 15.5 | PASS |

Protan is at the 6–8 floor in light: secondary encoding required in light theme.

## Contrast warnings (light theme)

- `viz-1` (#4ca6ea) — 2.2:1 against light surface: direct labels or table view required
- `viz-3` (#b6ab00) — 2.0:1 against light surface: direct labels or table view required

## Slots 5 and 6

All-pairs failures for slots 5–6 are expected. They are beyond the four-slot cap and the failures
are already covered by the cap rule — not a new finding.

## Decision

The adjacent-pairs gate (the gate for bars/lines/stacks) is met. The four-slot cap is the CVD gate
mechanism. The design rules were updated to record these measurements and make the cap's role
explicit. No new tokens, no per-type alternates, no palette changes.

**Why:** Adding per-type alternate tokens would triple the token surface, require implementation
in every consuming application, and not actually solve anything — the floor cases require secondary
encoding (labels/shape) regardless of which variant you pick.

**How to apply:** When anyone asks whether the palette is CVD-safe: yes, for four or fewer series,
with secondary encoding in the specific floor cases noted above. The measurements are in DESIGN-RULES.md.
