---
name: shadow-per-theme-resolveAlias-bug
description: "Cold reviewer found shadow per-theme branch in generate.mjs:68 was not calling resolveAlias(), confirmed by adversary as a real bypass producing invalid CSS with exit 0"
type: decision
---

The cold `bit:pr-review` ran on commit `f6ab347` and raised a FIX finding (adversary-confirmed):
`generate.mjs:68` — the shadow per-theme routing path called `perTheme[th].push([tok.name, tok.value[th]])` 
without wrapping `tok.value[th]` in `resolveAlias()`.

The colour per-theme path on line 55 already called `resolveAlias(raw)` correctly. The shadow path was a copy
that was never updated when alias resolution was added.

**Why this matters:** a shadow token using alias syntax `{canvas}` would emit the literal string `{canvas}`
rather than `var(--canvas)`. The generator exits 0 and the CSS is invalid silently. The adversary demonstrated
this live.

**Fix:** wrap `tok.value[th]` in `resolveAlias()` on line 68. Applied in commit `5247755`.

**Second finding from same code area:** a shadow token with only some themes defined fell through to 
`String(tok.value)` silently emitting `[object Object]`. Also fixed in `5247755` with an explicit error
listing the missing theme names.

**Gate test added:** new test in `gate-tests.sh` confirms that a shadow alias token emits `var()` output,
not a literal `{...}`. This was the class of bug this gate suite exists to catch.
