---
name: "bitfire-design"
description: "Apply the BITFire design system when building any UI, chart, dashboard, document or deck — colour jobs, tokens, hazard rules, typography, and the contrast checks that must run before shipping."
---
{{generated-note}}

# BITFire design system

BITFire is Ben's practice and the system it works in: consulting, building and deploying software, documents and decks across wildfire intelligence. Apply this to any interface, chart, dashboard, report or slide.

## First: the repo is the source of truth

If you are in the BITFire build rig (it has `packages/tokens/src/tokens.json`), read `DESIGN-RULES.md` and use the generated `@bitfire/tokens` CSS (`tokens.css`, `tailwind.css`). That is authoritative and may be newer than this skill. Never hard-code a colour, size or radius.

This skill is a generated copy of those sources. If you are working from it alone, say once that you are working from the skill's copy rather than the repo's, and where the two differ the repo wins.

The brand book, voice and logos live in a Design artifact on Ben's claude.ai account. Ask for the link if you need something this skill does not cover.

## The rule that matters most

**Colour states the finding.** A chart's job is not to say which series is which, it is to say what to do. Pick the colour job from what the reader must conclude, never from how many series there are:

| Reader must… | Job | Tokens |
| --- | --- | --- |
| tell series apart, no ordering | Categorical | `viz-1`…`viz-6`, in order, never cycled, max 4 per chart |
| judge **how much** | Sequential | `sev-0`…`sev-4` |
| judge **which side of normal** | Diverging | `div-lo-*`, `div-mid`, `div-hi-*` |
| act on a **state** | Status | `status-*`, always with a word |
| find **the one that matters** | Emphasis | `focus`, with all context drawn from `ink-subtle` at `opacity-context-dim` ({{v:opacity-context-dim}}) |

Most fire metrics mean worse-or-better, so most charts want sequential or status, not categorical. Colouring six sectors six hues spends the colour channel on something the axis already showed.

Emphasis is the strongest channel and costs nothing from the colour budget. Reach for it before adding another series colour. Choose whatever chart type suits the question.

## Three rules that are easy to get wrong

**Warm means severity.** Correct wherever severity is encoded: the hazard ramp, `sev-*`, the above-baseline arm of a diverging scale. Banned for identity or decoration. `brand-ember` is the brand colour, not an interface colour: never decoration, never in a data region (exact scope in the design rules below).

**Anchor flips by theme.** A sequential or diverging scale puts its most prominent step on its largest value in *both* themes: brightest on dark, darkest on light. Backwards makes the worst value the dullest mark.

**Nothing below 14px drops below font-weight 400.** Thin strokes bloom and break up on dark grounds. The one recorded exception is in the design rules below. The scale is otherwise light; the weights are in the type scale below.

## Hard rules

- Never use an `fdr-*` token as a text or icon colour. They are fills, always with a `border` edge and the band word.
- Never re-tint the `fdr-*` ramp, including for accessibility: it must match the signage and public warnings the reader sees elsewhere. Add hatching as the non-colour channel instead.
- Never use `viz-*` in the same visual region as an `fdr-*` chip.
- Every status and hazard chip carries a word. Colour is never the sole carrier.
- Attach provenance (observed / modelled / inferred / unverified) to any value not directly observed. Default to unverified when unsure.

## Core tokens

Dark is primary; `data-theme="light"` for print, projection and documents.

{{core-tokens}}

{{ramps}}

{{fdr}}

{{spacing}}

## Typography

{{families}}

Every number a reader compares, aligns or watches change is mono. Prose is sans. Condensed is for density only: table headers and map labels. Serif only for print body.

{{type-scale}}

## Components

Built in `@bitfire/ui` (React Aria Components styled with Tailwind 4 utilities and the tokens): {{components}}.

Anything not in that list is not built yet. Build it on React Aria Components styled through the BITFire tokens, not on shadcn/ui, and see the brand book's component specs.

Icons are Phosphor (MIT), 16 or 20px on the grid (weight rules are in the design rules below). Four gaps exist in geospatial and aviation; to draw one, use a 256×256 viewBox, round caps and joins, `currentColor`, strokes of 8/12/16/24 for thin/light/regular/bold. No multi-part machine icon survives 16px.

{{rules}}

## Before you ship: measure, do not assert

This is not optional and it is the step most often skipped. The design rules above also require rendering the result and validating any new chart palette.

1. **Check contrast in both themes.** Text pairs hold 4.5:1, meaningful marks 3:1. Compute it; do not eyeball it.
2. **In the build rig, run `npm run check`** and read the output. A local pass is what CI will see, except the visual gate, which only runs on Linux.
3. **Mark anything unverified as unverified.** Never present an unchecked value as fact.

Known limits, so nobody rediscovers them: six-slot all-pairs colour-blind separation is achievable by no palette, published ones included. Dark mode's difficulty is a lightness-band problem, not a palette problem: direct labels, distinct markers and texture do more work there than colour will.
