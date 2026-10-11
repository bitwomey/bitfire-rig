---
name: design-system-ownership-and-rulings
description: Why the repo owns token values and build rules, the artifact owns the brand book, the skill is a generated read-only proposal, and Ben's rulings of 2026-10-10/11
type: decision
---

# Design system ownership and rulings (issue #38, 2026-10-11)

## Decision

One owner per kind of thing, and everything derived is regenerated, not edited:

| Kind of thing | Owner |
| --- | --- |
| Token values | the repo (`packages/tokens/src/tokens.json`) |
| Build rules (numbers, caps, gates) | the repo (`DESIGN-RULES.md`) |
| Skill prose | the repo (`design/bitfire-design/SKILL.template.md`); the skill body is generated |
| Components | the repo (`packages/ui`); ten domain components currently exist only as artifact specs (#53) |
| Brand book, voice, logos | the Design artifact; logos are copied to `assets/brand/` with SHA-256 |

The `bitfire-design` skill is a read-only cache of an account skill. Nothing in the repo writes to it. The repo emits `design/bitfire-design/SKILL.md` (committed, stale-checked); a Cowork session turns it into a proposal; Ben approves with one click. The handoff copy carries the source commit so a session that has the skill loaded can state it.

## Why

- A generator that rebuilt the skill from `tokens.json` alone would silently drop rules that live only in prose (the 28% dimming, the adjacent-pairs gate). So skill-only values were diffed first (62 statements: 6 skill-only, 6 conflicts, 5 stale), landed in the repo, and the 28% became the token `opacity-context-dim`.
- Writing to the synced skill folder appears to work and changes nothing, so the design routes through a human approval and a self-reporting commit line. That is a mitigation, not a gate: the skill's state cannot be verified from the repo side.
- A session-start drift check was dropped as a convention that would be skipped; drift detection is a scheduled Cowork job, because CI cannot read the artifact.

## Rulings (Ben)

- Phase 3 split; 3a done, 3b deferred.
- `brand-ember`: wordmark, cover and brand marks only; never decoration.
- `caption` 12 px weight 300 is the one recorded weight exception.
- No dual-axis chart rule; `viz-6` orange accepted.
- Hidden terminal commands only.

## Alternatives rejected

- Build a writer for the skill folder: overwritten on sync, would report success forever.
- Dropbox request/receipt channel: not needed while the repo is public (Cowork fetches the raw GitHub URL pinned to a commit); revisit when the repo goes private.
- Copy the brand book's prose into the repo: two copies drift. Only constraints a builder must obey are copied.

## Limits

- Some template prose is fixed text with no repo source (contrast thresholds, icon sizes, "max 4 series").
- The artifact's compiled files do not recompile when `tokens.json` is published.

Related: [[bitfire-ui-primitive-react-aria]]
