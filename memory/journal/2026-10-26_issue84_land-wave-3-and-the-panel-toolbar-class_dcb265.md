---
name: land-wave-3-and-the-panel-toolbar-class-fix
description: 2026-10-26 journal for issue #84 — LegendRamp, Panel and Toolbar landed on main via PR #86, with a class-name rendering fix found by cold review
type: journal
---

# 2026-10-26 — #84 Land LegendRamp, Panel and Toolbar on main

**Landed:** PR #86 merged (bitwomey approved head 9c51fbd). `LegendRamp`, `Panel`, `Toolbar` and
`ToolbarSpacer` are on `main` with stories and Linux baselines; README export count 27 to 38;
`design/bitfire-design/SKILL.md` regenerated. Earlier PR #85 for the same issue was closed.

**Why it was needed:** PRs #77–#79 were stacked and each merged into its parent branch, so the three
components never reached `main` (see memory `feedback_stacked-pr-retarget`).

**Found and fixed in review:** `border-hairline` and `shadow-panel` generated no CSS, so Panel and
Toolbar dividers and shadows did not render. Fixed in 130623d; 14 Panel and Toolbar baselines
regenerated in 48c446e from Visual baselines run 40251672987. Log:
`memory/decision_logs/2026-10-26_issue84_tailwind-class-names-that-generate-no-cs_827bf5.md`.

**Key files:** `packages/ui/src/Panel.tsx`, `packages/ui/src/Toolbar.tsx`,
`packages/ui/src/LegendRamp.tsx`, `packages/ui/scripts/check-build.mjs`,
`packages/ui/visual/__screenshots__/panel--*-linux.png`, `toolbar--*-linux.png`.

**Validation:** `npm run check` exit 0 on Windows for the corrected code on a second run (first run
failed once in `check:a11y`, cause not found); `gates` green on CI for 48c446e including the Linux
visual gate; I viewed 2 of the 14 regenerated images. Internal review (warm, mundane, one round):
0 blocker, 1 fix (stale PR body, fixed), 5 notes. Cold review 5646134467 on the first head: not
blocking, one real fix. **Not done:** a cold review of the corrected head (coordinator stopped it
after the merge), the blind panel and adversary lenses.

**Open notes, unfixed:** none of Panel, Toolbar or LegendRamp stories has a `play` assertion;
`LegendRamp` accepts a raw `color` and keys by `label`; Panel title is always `h3`; no coverage
tooling for STD-0006.
