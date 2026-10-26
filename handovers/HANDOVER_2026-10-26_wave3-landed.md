# Handover — 2026-10-26: Wave 3 landed on main (#84, PR #86)

## TL;DR

| Item | Status |
|---|---|
| #84 LegendRamp, Panel, Toolbar on `main` | ✅ Merged PR #86 (approved head 9c51fbd) |
| Panel/Toolbar class-name rendering bug | ✅ Fixed in the same PR |
| #10 hatching (HazardFill) | ✅ Merged PR #87 (not this session's work) |
| #9 map sources, #8 Cesium adapter | 📋 Deferred |
| #4 rollback on real registry, #3 publish to BITFire org | 📋 Deferred |

Open issues on GitHub are exactly #3, #4, #8, #9. No open PRs. `main` was `879a68f` when this was written.

## Single most useful next action

Nothing is blocked on this repo's own work. The next real piece is one of the deferred four, and each
needs a decision from Ben first (see the resume prompt). Do not start any of them unprompted.

## What shipped

PR #86 put `LegendRamp`, `Panel`, `Toolbar` and `ToolbarSpacer` on `main`. The three had been stacked
PRs (#77–#79) that each merged into a parent branch. A cold review of the first head found that
`Panel` and `Toolbar` used classes (`border-hairline`, `shadow-panel`) that generate no CSS, so their
dividers and shadows never rendered. The fix and 14 regenerated Linux baselines are in the merge.
Details: `memory/decision_logs/2026-10-26_issue84_tailwind-class-names-that-generate-no-cs_827bf5.md`.

## Critical gotchas

- **An unknown Tailwind class fails silently**, and a baseline records whatever rendered. After adding
  a token utility, grep `packages/ui/dist/styles.css` for the generated selector.
- **`npm run check` printed one `check:a11y` failure** (gate self-test "contrast-light failed in the
  dark theme") that did not reproduce on rerun. Cause not found. If it recurs, keep the full output.
- **A long `npm run check` on Windows exceeds the tool's 600 s limit**; run it in the background with
  its exit code written to a file. Reading `$?` after `| tail` reports `tail`'s exit code, not npm's.
- The Visual baselines workflow reproduces byte-different Button and Pagination images each run. Not
  measured; do not commit them.
- Coordinator replies (`coordinator_send.py reply`) are refused when a session has no role record.

## Not verified at merge

- No cold review covered the final head (48c446e); Ben approved 9c51fbd directly.
- Only 2 of the 14 regenerated baselines were viewed by the author.
- Unfixed review notes: no `play` assertions in the Panel, Toolbar or LegendRamp stories; `LegendRamp`
  accepts a raw `color` and keys swatches by `label`; Panel title is always `h3`; no coverage tooling
  for STD-0006.

## Ticket candidates (surfacing only, nothing filed)

1. Add a gate check that every Tailwind class in `packages/ui/src` generates a selector in the built CSS.
2. Give Panel, Toolbar and LegendRamp stories `play` assertions.
3. Remove or justify `LegendRamp`'s raw `color` prop (conflicts with "never hard-code a colour").
4. Measure the Button/Pagination baseline byte differences, or stop the workflow producing them.
5. README row "The committed visual baselines are right" is stale (Linux baselines now exist).

## Read these first

- `handovers/HANDOVER_2026-10-20_wave4-complete.md`
- `memory/decision_logs/2026-10-26_issue84_tailwind-class-names-that-generate-no-cs_827bf5.md`
- `memory/journal/2026-10-26_issue84_land-wave-3-and-the-panel-toolbar-class_dcb265.md`
- `CLAUDE.md`, `README.md` ("what is proven" table), `DESIGN-RULES.md`

## What NOT to do

- Do not start #3, #4, #8 or #9 without Ben's decision; #3 and #4 wait on the repo moving to the BITFire org.
- Do not commit the Button/Pagination baseline differences.
- Do not edit `design/bitfire-design/SKILL.md` or `packages/tokens/dist/` by hand; run `npm run generate`.
- Do not fix a second problem inside a PR; file it.

## Where things live

| Path | Role |
|---|---|
| `packages/ui/src/` | Components and stories |
| `packages/ui/visual/__screenshots__/` | Linux visual baselines (made by the Visual baselines workflow) |
| `packages/ui/scripts/check-build.mjs` | `EXPECTED` export list |
| `design/bitfire-design/SKILL.md` | Generated skill |
| `memory/decision_logs/`, `memory/journal/` | Why-trail, new file per session |

## Predecessor work

#60 FireDangerBadge, #61 Provenance, #62 StatusBadge and the rest of the ten fire-domain components
(waves 1–3), #59 fire-dashboard starter, #11 CVD measurement, #38 ownership umbrella, #10 hatching.

## Resume prompt

```
I'm continuing work on bitfire-rig (Ben Twomey's public build rig for the BITFire design system; track: build, phase: component library complete, registry and map work deferred). Last session landed LegendRamp, Panel and Toolbar on main through PR #86 (merged; main was 879a68f). A cold review found that Panel and Toolbar used Tailwind classes that generate no CSS; the fix and 14 regenerated Linux baselines are in the merge. Proof: gates green on CI for 48c446e; I ran npm run check locally (exit 0 on the second run; the first failed once in check:a11y, cause not found).

State: all ten fire-domain components, the fire-dashboard starter, CVD measurement and hatching are on main. Open GitHub issues are #3 (publish packages once the repo is in the BITFire org), #4 (prove rollback on the real registry), #8 (Cesium adapter) and #9 (map asset sources). No open PRs.

Mission: none is assigned. Ask Ben which of the four he wants, or whether to take one of the ticket candidates in handovers/HANDOVER_2026-10-26_wave3-landed.md.

Open questions to resolve BEFORE acting: Is the repo moving to the BITFire org (gates #3 and #4)? Which map data sources are acceptable (#9)? A question left unanswered is a stop, not consent.

Required reading, in order: handovers/HANDOVER_2026-10-26_wave3-landed.md, CLAUDE.md, README.md (the "what is proven" table), DESIGN-RULES.md, memory/decision_logs/2026-10-26_issue84_tailwind-class-names-that-generate-no-cs_827bf5.md.

Key context: run npm run check from Git Bash with export PATH="$PATH:/c/Program Files/nodejs"; it can exceed 10 minutes on Windows, so run it in the background and read the real exit code from a file. The visual gate is Linux-only (skipped on Windows); regenerate baselines with the Visual baselines workflow and have Ben review the images. PRs open as bit-author (never Ben's account); the bot cannot close issues. Load the bitfire-design skill before UI work.

Scope guardrails: branch from main, one issue per branch, draft PR saying Closes #<issue>, ready only after gates is green, then request review from bitwomey. Never hard-code a colour, size or radius. Mark anything unverified as unverified. Do not commit unrelated baseline differences.

Start with /bit:session-start.
```
