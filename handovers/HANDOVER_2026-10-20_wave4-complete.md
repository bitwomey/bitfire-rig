# Handover — 2026-10-20: Wave 4 complete

## TL;DR

| Issue | Title | Status |
|---|---|---|
| #60 | FireDangerBadge | ✅ Merged PR #80 |
| #59 | fire-dashboard starter | ✅ Merged PR #82 |
| #11 | CVD separation measurement | ✅ Merged PR #83 |
| #38 | Design-system source of truth | ✅ Closed (no code needed) |
| #10 | Hatching channel for hazard fills | 📋 Deferred |
| #9 | Map asset sources | 📋 Deferred |
| #8 | Cesium adapter | 📋 Deferred |
| #4 | Rollback on real registry | 📋 Deferred |
| #3 | Publish packages to BITFire org | 📋 Deferred |

`main` is at `c9e5488`. All open actionable issues are closed. Only deferred items remain.

## What shipped this session

### FireDangerBadge (#60, PR #80)

`packages/ui/src/FireDangerBadge.tsx` — renders an `fdr-*` coloured chip using the design system's
five fire danger tokens (no rating / moderate / high / extreme / catastrophic). Always shows the band
word; never uses colour alone. Exported from `@bitfire/ui`.

### fire-dashboard starter (#59, PR #82)

`starters/fire-dashboard/` — Vite + React 19 app consuming `@bitfire/tokens` and `@bitfire/ui`
via npm workspaces. Shows: header (Provenance mark), MetricTile grid, incident table with
StatusBadge + FireDangerBadge. The `check:starter` gate in root `package.json` runs
`tsc --noEmit && vite build` in CI.

### CVD measurement (#11, PR #83)

Ran `validate_palette.js` (OKLab ΔE ×100) on `viz-1`…`viz-4`, all-pairs, both themes.
Key result: the four-slot cap is confirmed as the CVD gate. No per-type alternate tokens.
Measurement recorded in `DESIGN-RULES.md` and regenerated into `design/bitfire-design/SKILL.md`.

### Design-system source of truth (#38)

All ACs already met by prior sessions. Closed without further changes.

## The single most useful next action

Start issue #62 — `StatusBadge` component for `@bitfire/ui`. It's referenced by the fire-dashboard
starter (currently a placeholder) and is the next item in the UI primitive backlog.

The component spec is in the Design artifact. Use `bit:session-start` and `bit:design` with
issue #62.

## Next actions after that

All remaining open issues are deferred per Ben's explicit direction:
- #10 hatching, #9 map sources, #8 Cesium — blocked on external decisions
- #3, #4 — blocked on registry setup

## Critical gotchas

### Stacked PRs: ALWAYS retarget before merging the base

Before Ben merges a PR that is the base of a stacked PR, run:
```powershell
gh pr edit <stacked-pr-number> --base main
```
Failure to do this causes GitHub to auto-close the stacked PR when the base branch is deleted.
This happened with PR #81 this session. Memory rule saved at `memory/feedback_stacked-pr-retarget.md`.

### Push credentials

`bit-author` cannot push to `bitwomey/bitfire-rig`. Always push with Ben's credentials.

### Do NOT point CI at self-hosted runner while repo is public.

### Known stashes (BLOCKER)

Two stashes from issue #66/#67 work survived across a session boundary:
- `stash@{0}` — hook files + `.serena/project.yml`
- `stash@{1}` — hook files + an old `CLAUDE.md` with a CI section that was later removed from HEAD

Both stashes contain no project source code worth keeping. They should be dropped:
```powershell
git stash drop stash@{0}
git stash drop stash@{0}   # after dropping the first, {1} becomes {0}
```
**Ben must confirm before dropping.**

## Read these first

1. This handover
2. `memory/journal/2026-10-20_issuenone_wave-4-completion-fire-dashboard-cvd_65b211.md`
3. `memory/science_decisions/2026-10-20_issue11_cvd-separation-measurement-viz-palette_a03ded.md`
4. `DESIGN-RULES.md` (CVD ruling + four-slot cap)
5. `memory/feedback_stacked-pr-retarget.md`

## Where things live

| Path | Role |
|---|---|
| `packages/tokens/src/tokens.json` | Authoritative token values (never edit generated output) |
| `packages/ui/src/` | `@bitfire/ui` components (React Aria + BITFire tokens) |
| `starters/fire-dashboard/` | Vite + React 19 demo app |
| `DESIGN-RULES.md` | Prose rules, rulings, measurements |
| `design/bitfire-design/SKILL.md` | Generated skill (run `node tools/design-system.mjs skill` to regenerate) |
| `handovers/` | Session handovers |
| `memory/` | Persistent decision logs, journal, science notes |

## Predecessor work (completed this session)

- PR #80: `[#60] Add FireDangerBadge component`
- PR #82: `[#59] Add fire dashboard starter` (was #81, auto-closed; rebased and reopened)
- PR #83: `[#11] Record measured CVD separation for viz-1..4`
- Issues #38, #11, #60, #59 all closed

## Phased plan for next session

### Phase 1 — StatusBadge component (#62)

1. Load `bit:session-start` → read this handover
2. `bit:design` for StatusBadge (issue #62) — read the Design artifact's component spec first
3. Build `packages/ui/src/StatusBadge.tsx` on React Aria + BITFire tokens
4. Add stories + accessibility gate
5. `npm run check` → pass
6. PR via `bit:pr`, draft until gates green

### Phase 2 — Verification gate

1. Update fire-dashboard starter to use real StatusBadge
2. `npm run check:starter` pass
3. Visual baselines if needed (Linux CI)

---

## Resume prompt (copy-paste to start next session)

```
I'm continuing work on BITFire (`bitfire-rig`, engineering track, Phase 3b).

Last session shipped Wave 4: FireDangerBadge (#60, PR #80), fire-dashboard starter (#59, PR #82),
and CVD measurement (#11, PR #83). main is at c9e5488. Issues #38, #11, #59, #60 all closed.
All remaining open issues are deferred.

This session's mission: StatusBadge component for @bitfire/ui (issue #62).

The crux: StatusBadge must use React Aria + BITFire tokens, show icon + label (never colour alone),
and match the Design artifact's component spec. It's used by the fire-dashboard starter.

Open questions before acting:
1. Read the Design artifact (https://claude.ai/artifact/FvCg7Vws1achAViYQAZDmn) for the StatusBadge spec
2. Check if issue #62 has been filed yet (or file it with bit:raise-issue)

Required reading:
- handovers/HANDOVER_2026-10-20_wave4-complete.md
- memory/journal/2026-10-20_issuenone_wave-4-completion-fire-dashboard-cvd_65b211.md
- DESIGN-RULES.md
- packages/ui/src/FireDangerBadge.tsx (reference implementation)

Key context:
- bit-author cannot push; always push with Ben's credentials
- npm run check before any PR
- Stacked PRs: retarget with `gh pr edit <n> --base main` before Ben merges a base PR
- Two stashes from #66/#67 work need Ben to drop them (hook files only, no code)

Scope guardrails:
- One issue per branch (scope discipline in CLAUDE.md)
- Never hand-edit packages/tokens/dist/
- Never use colour alone for status — always icon + word
- StatusBadge is NOT FireDangerBadge; it handles ok/warn/danger/unknown states

Start with /bit:session-start.
```
