---
name: session-3-foundation-complete
description: "Session 3 (2026-10-09 to 10-10): primitive trial, Storybook and per-theme a11y gate, all components, build and export of @bitfire/ui 0.4.0, Linux visual regression gate; foundation issues #1 to #7 complete"
type: journal
---

**Landed (PRs merged, #14 to #36).**
- Generator and tokens: #14 (#1 Tailwind mapping fixture, generator validation), #19 (#17 `.gitattributes`), #20 (#18 third theme and `url()`), #24 (#23 `@bitfire/tokens/tailwind.css` generated, no more copied mapping), #16 (Elements 360 and AEM references removed).
- Trial and workbench: #21 (#2 React Aria chosen), #22 (#6 Storybook with a11y gate and proofs), #26 (#25 per-theme gate, portalled content checked in light).
- Components (#5): #27 forms, #28 modal/tabs/navigation, #29 pagination/empty/spinner/skeleton, #33 build and export of `@bitfire/ui` 0.4.0 (compiled `dist/index.js` and `styles.css`, no preflight, `check:build` smoke test, release gate now builds).
- Quality: #32 (#31 flaky Link Hovered story), #34 (#7 Linux visual regression gate, 180 baselines), #36 (#30 Button spinner stops under reduced motion).

**Key files.** `tools/generate.mjs`, `packages/tokens/dist/tailwind.css`, `packages/ui/src/*`, `packages/ui/.storybook/preview.tsx`, `packages/ui/scripts/check-a11y.mjs`, `check-build.mjs`, `check-visual.mjs`, `packages/ui/visual/*`, `packages/ui/proof/*`, `research/primitive-trial/DECISION.md`, `.github/workflows/{ci,visual-baselines}.yml`.

**Validation.** Every PR had a cold `bit:pr-review` and `npm run check` (Git Bash with Node on PATH), plus CI `gates`. The Linux visual gate: 8 consecutive green CI runs at 20 pixels on one runner image. Not shown: a screen reader, other browsers, a different runner image, a dark-only contrast failure, the hover diagnosis.

**Process lessons.** A builder's passing tests did not catch a Button focus ring that never painted (found by rendering it). A story's simulated hover is unreliable on a CI runner. Assertions must be shown failing on the old code. See `handovers/HANDOVER_2026-10-10_foundation-complete.md`.

**Links.** Decision logs `2026-10-10_issue2_*`, `issue25_*`, `issue7_*`, `issue3_*` in `memory/decision_logs/`.
