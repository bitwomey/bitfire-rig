---
name: visual-gate-linux-only-tolerance
description: "Visual regression gate is pinned to Linux (declared exception to no-check-only-in-CI), takes hover from a real mouse only in hovered stories, and allows 20 differing pixels with exact colours"
type: decision
---

**Linux-only.** Baselines are rendered by the Playwright Chromium on the ubuntu runner (`-linux.png`, 180 files, 1.6 MB in git; STD-0013 binaries-in-git trade-off accepted because they are the source of truth). On Windows `npm run check:visual` prints SKIPPED and exits 0. Declared in CLAUDE.md and CONTRIBUTING. The baselines workflow is `workflow_dispatch`, uploads an artifact and commits nothing; a baseline changes only in a PR where the PNGs are in the diff and a human has looked at them.

**Hover.** The first two Linux comparison runs failed 6 then 5 of 180 (hovered Button about 3,985 pixels, combobox input about 14,400, one Switch 7 pixels). A simulated hover from a play function was sometimes cleared before the screenshot. Rule: hover is baselined only by `*-hovered` stories with a real mouse; incidental hover is stripped from all others (known limit: a wrongly stuck hover in another story is not caught). The cause (Chromium's fake mouse move after layout) is a diagnosis, not proven; what is shown is that the rule made runs stable (173 of 180 PNGs byte-identical across two Linux regenerations; 8 consecutive green CI runs).

**Tolerance: 20 pixels, exact colours.** Noise measured: 7 pixels (edge anti-aliasing). A first limit of 50 let a 6 to 9 px corner radius change (about 40 pixels) through: the proof failed 7 of 24, against 16 of 24 at 20. Do not widen it. Orphan baselines fail a test.

**Unproven.** Stability on a different `ubuntu-latest` image or Chromium build; a failed run uploads a `visual-diffs` artifact so drift is visible.
