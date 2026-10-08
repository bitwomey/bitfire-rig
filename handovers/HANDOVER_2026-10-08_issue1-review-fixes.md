# Handover -- Issue #1 Session 2: Cold Review Fixes
**2026-10-08**

## TL;DR

| Item | Status |
|---|---|
| Issue #1 -- Tailwind 4 token mapping | 🏗️ PR #14 draft, review complete (not posted) |
| Shadow alias bug fixed (`generate.mjs:68`) | ✅ `5247755` |
| Partial-theme shadow validation | ✅ `5247755` |
| Gate suite 9 -> 12 tests | ✅ `5247755` |
| 53 colour tokens mapped in fixture | ✅ `5247755` |
| bit-* installation IDs for bitwomey | ✅ `settings.local.json` |
| Cold review result | 🟡 NOT BLOCKING -- 7 FIX, 4 NOTE to address |
| bit-reviewer posting | ❌ 403 on every attempt -- unresolved |
| Issue #15 -- brand assets | 📋 Deferred, issue raised |

## What shipped this session

Commit `5247755` on `issue-1-tailwind-4-mapping`, pushed to origin.

Applied 4 of 5 FIX findings from the first cold review:
1. `generate.mjs:68` -- shadow per-theme path now calls `resolveAlias()`
2. Partial-theme shadow token now raises a named error
3. Gate tests: 3 new tests (12/12 pass, `npm run check` green)
4. `focus`, `focus-wash`, `status-info` added to `@theme inline` (now 53/53)

## Second cold review verdict (NOT POSTED -- 403 unresolved)

**Verdict:** 🟡 NOT BLOCKING -- 7 FIX, 4 NOTE, 0 BLOCKER

Full review body: `C:\Users\BENTWO~1\AppData\Local\Temp\claude\C--Projects-bitfire-rig\e38b5f5f-5bd3-4809-aaac-b766853650bd\scratchpad\review-pr14.md`

### FIX findings to address next session

| # | Location | Finding |
|---|---|---|
| F1/F2 | `generate.mjs:10` | `COLOR_RE` has no end anchor -- `{signal}garbage` passes and emits literally |
| F3/F6 | `generate.mjs:64-75` | Shadow per-theme values have zero validation (`{canvas}garbage` emits literally) |
| F5 | `generate.mjs:67-72` | `checkLen` bypassed for per-theme spacing/radius/stroke tokens |
| F7 | `generate.mjs:62-82` | Opacity/zIndex have no format validation (`{canvas}` as opacity emits literally) |
| F4 | `generate.mjs` | `type.families` values not type-checked (object emits `[object Object]`) |

STD-0002 violation: `allowScripts` in `package.json` is a dead field (not a recognised npm key).

### NOTE findings

- Theme ID interpolated raw into CSS -- crafted ID could inject CSS rule
- `themes.length < 2` guard exits before other errors are collected (push to errors array instead)
- `grep -q` in shadow alias gate test swallows diagnostic output
- `resolveAlias` full-value-only behaviour is undocumented (embedded aliases silently unresolved)

### Controls block (from reviewer)

```
controls:
STD-0002 violated
STD-0003 satisfied
STD-0006 not_applicable: repository has no coverage-measurement tooling; correctness is validated by the gate suite, not line coverage percentage
STD-0008 satisfied
```

## Most useful next action (for the next session)

**1. Resolve the bit-reviewer 403.** The app has `pull_requests: write` at the account level and
`BIT_REVIEWER_INSTALLATION_ID=162157273` is set in `settings.local.json`, but reviews still fail
to post. The most likely cause: the subagent environment is not picking up the env var from
`settings.local.json`. Investigate: does `gh_app_token.py --app reviewer` use `BIT_REVIEWER_INSTALLATION_ID`?
If not, what env var does it read?

**2. Apply the FIX findings** from the second cold review (F1-F7 above), then re-dispatch.

## Current state

- **Branch:** `issue-1-tailwind-4-mapping`
- **HEAD:** `5247755`
- **PR:** https://github.com/bitwomey/bitfire-rig/pull/14 (draft)
- **Receipt:** complete for `5247755` (ledger ✓, prototype ✓, internal-review ✓)
- **Cold review:** completed -- full body in scratchpad (path above)

## Critical gotchas

- **bit-reviewer 403 persists** -- The app has the right permissions at account level. The installation
  ID override is in `settings.local.json`. But the subagent (Agent tool dispatch) is not picking it
  up -- it gets a 403 on EVERY attempt. This may be a subagent env-var inheritance issue. Debug before
  spending another review round.
- **bit-author can't push directly** -- push with Ben's credentials (`git push origin HEAD`), use
  bit-author token for `gh pr create / gh pr edit` only.
- **Never commit `settings.local.json`** -- has API key + installation IDs.
- **`npm run check` must pass** before any push.

## Where things live

| Path | Role |
|---|---|
| `packages/tokens/src/tokens.json` | Authoritative token values |
| `packages/tokens/dist/` | Generated -- never hand-edit |
| `tools/generate.mjs` | Token generator (v1.0.1) |
| `tools/gate-tests.sh` | Gate failure tests (12 tests) |
| `consumers/tw-fixture/` | Tailwind 4 mapping fixture |
| `.claude/settings.local.json` | Gitignored -- API key + bitwomey installation IDs |
| `.claude/review-receipts/` | Per-commit receipts (gitignored) |
| `handovers/` | Session handovers (this file) |
| `memory/decision_logs/` | Decision logs |
| `memory/journal/` | Session journals |

## Predecessor work (do not redo)

- Session 1: built fixture, fixed alias/shadow bugs, repaired gate suite, opened PR #14
- Session 2 (this): cold review fixes, 12 tests, bit-* IDs, Issue #15 raised

## Read these first

1. This handover
2. `memory/journal/2026-10-08_issue1_session-2-review-fixes_88a72b.md`
3. `memory/decision_logs/2026-10-08_issue1_shadow-per-theme-resolvealias-bug_d6b23b.md`
4. https://github.com/bitwomey/bitfire-rig/pull/14

---

## Copy-paste resume prompt

```
I'm continuing work on `bitwomey/bitfire-rig` (Issue #1 -- Tailwind 4 token mapping, PR #14).

Last session (2026-10-08) shipped commit 5247755 on branch `issue-1-tailwind-4-mapping`:
- Fixed shadow per-theme alias resolution bug (generate.mjs:68)
- Added partial-theme shadow validation
- Expanded gate suite to 12 tests (npm run check: 12/12 pass)
- Added 3 missing colour tokens to @theme inline (now 53/53 mapped)

A second cold bit:pr-review ran against 5247755 and returned verdict: 🟡 NOT BLOCKING -- 7 FIX,
4 NOTE, 0 BLOCKER. The full review body is at:
C:\Users\BENTWO~1\AppData\Local\Temp\claude\C--Projects-bitfire-rig\e38b5f5f-5bd3-4809-aaac-b766853650bd\scratchpad\review-pr14.md

The review could NOT be posted to GitHub PR #14 (403 "Resource not accessible by integration"
on every attempt). bit-reviewer has pull_requests:write at account level and
BIT_REVIEWER_INSTALLATION_ID=162157273 is in .claude/settings.local.json, but the subagent is
still getting 403. This is the blocker to resolve first.

**This session's mission:** resolve the bit-reviewer 403, apply the 7 FIX findings, get PR #14 clean
and posted.

**The crux:** why is bit-reviewer still getting 403 despite the installation ID override?
Most likely: the Agent-tool subagent is not picking up BIT_REVIEWER_INSTALLATION_ID from
settings.local.json (env vars from settings files may not propagate to subagents). Debug:
run `python "C:/Users/Ben Twomey/.claude/plugins/cache/bit-marketplace/bit/0.22.40/skills/pr/gh_app_token.py" --app reviewer`
directly and check what installation ID it uses.

**Open questions to resolve BEFORE acting:**
1. Does gh_app_token.py --app reviewer read BIT_REVIEWER_INSTALLATION_ID or a different env var?
2. Does the Agent tool inherit env vars set via settings.local.json?

**FIX findings to address (from review-pr14.md):**
- F1/F2: COLOR_RE has no end anchor (generate.mjs:10) -- `{signal}garbage` passes validation
- F3/F6: Shadow per-theme has zero value validation beyond resolveAlias
- F5: checkLen bypassed for per-theme spacing/radius/stroke
- F7: Opacity/zIndex have no format validation
- F4: type.families values not type-checked
- STD-0002: allowScripts in package.json is a dead field

**Required reading (priority order):**
1. handovers/HANDOVER_2026-10-08_issue1-review-fixes.md
2. memory/journal/2026-10-08_issue1_session-2-review-fixes_88a72b.md
3. C:\Users\BENTWO~1\AppData\Local\Temp\...\scratchpad\review-pr14.md (the review body)
4. tools/generate.mjs (the generator to fix)

**Key context:**
- bit-author can't push to bitwomey/bitfire-rig -- always push with Ben's credentials
- Never commit .claude/settings.local.json
- npm run check = stale + colour + gate-tests (must pass before any push)
- Cold review must be dispatched as a non-fork Agent with ONLY the preamble:
  "bit:pr-review for PR #14 in bitwomey/bitfire-rig (https://github.com/bitwomey/bitfire-rig/pull/14)"

**Scope guardrails:**
- Issue #15 (brand assets) -- deferred, do not touch on this branch
- Do not modify packages/tokens/dist/ by hand
- No commits to main

Start with /bit:session-start.
```
