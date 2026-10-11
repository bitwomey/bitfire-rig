---
name: session-4-design-system-and-clean-install
description: Session 4 journal: the repo became the single source for the design system, Phase 3a clean install proven, skill generator merged
type: journal
---

# 2026-10-11, session 4 (#38, #42, #45)

**Landed (all merged to `main`, now `6ad5924`):** PRs #37 brand assets, #39 export and drift check plus ownership docs, #40 `DESIGN-RULES.md` and `opacity-context-dim`, #43 clean install from tarballs, #44 pull-quote bar off `brand-ember`, #46 skill generator, #48 `viz-6` ruling, #51 sha-stamped handoff copy, #54 skill gaps, #56 diagram link.

**Key files:** `tools/check-install.mjs`, `tools/design-system.mjs`, `tools/skill-body.mjs`, `design/bitfire-design/SKILL.template.md` and `SKILL.md`, `DESIGN-RULES.md`, `tools/gate-tests.sh` (40 tests).

**Validation:**
- `npm run check` exit 0 on Windows for #43 and #46 (visual gate skipped there by design); gate suite 40 of 40 after #51 and #54.
- Clean install: all four steps pass in about 8 s on ubuntu-latest (CI run for PR #43) and 4 m 16 s locally; the check was shown to fail when the ui package also shipped `src/`.
- Artifact `project/tokens.json` republished (version 16) and read back byte-identical (`design-system.mjs check` exit 0).
- Cold Sonnet reviews on #43 and #46 found no blockers; their notes were fixed.

**Not proven:** the generated skill has not been loaded as a real skill; the artifact's derived files had not recompiled at last read; registry publish, upgrade and rollback against a real registry; the full `npm run check` was not run on the doc-only PRs (CI did).

**Mistakes worth keeping:** a Python heredoc corrupted JS regex escapes twice; I printed `.claude/settings.local.json` (an API key) into a transcript and reported it; the PR #53 issue body miscounted components (17 vs 23) and the bot could not edit it.

Links: [[design-system-ownership-and-rulings]], `handovers/HANDOVER_2026-10-11_design-system-one-source.md`.
