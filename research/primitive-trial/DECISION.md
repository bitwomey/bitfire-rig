# Primitive trial: result and proposed choice (issue #2)

**Proposed: React Aria Components.** Not yet confirmed by Ben; this file records the reasoning so the choice can be accepted or overturned.

Both candidates built the same page from `SPEC.md` in Chromium: a validated form, a searchable selector, a modal and a sortable table, in both themes and at 360 px. Full detail is in `rac/RESULTS.md` and `shadcn/RESULTS.md`. Figures marked "re-run" were re-measured by the coordinating session, not only taken from the builder's report.

## Side by side

| | shadcn/ui (Radix + Base UI) | React Aria Components |
| --- | --- | --- |
| Direct dependencies | 16 | 13 (5 runtime) |
| All installed packages (re-run) | 129 | 58 |
| JS bundle, gzip (re-run) | 159.6 kB | 200.7 kB |
| CSS, gzip (re-run) | 9.7 kB | 5.9 kB |
| Authored app code, excluding vendored (re-run, lines) | 486 | 489 |
| Vendored component source | 13 files, 1,376 lines, edited by `sed` | none |
| Styling exceptions recorded | 13 | 9 |
| Library defects found | CLI left packages missing; dialog loses focus without a trigger; combobox needs a second primitive library | native validation re-validates only on blur; combobox shows nothing when empty; no `aria-busy` on a pending button |
| `check-rawcolour` on the folder (re-run) | ok | ok |

## Why React Aria Components

1. **It fits the governing rule.** BITFire's rule is that design values live in `tokens.json` and nowhere else. shadcn copies Tailwind default values (sizes, radii, opacities, z-index, `dark:` variants, a 50 percent focus ring) into the repo as component source, so the tokens cannot own them. The builder had to rewrite them with `sed` and grep for leftovers, and nothing stops a later `shadcn add` from putting them back. React Aria ships no styles, so every value in the page comes from a token.
2. **A smaller dependency surface.** 58 installed packages against 129, and one primitive library against two. The shadcn combobox is built on Base UI, not Radix, so choosing shadcn means choosing both.
3. **Behaviour and accessibility were close to free.** Focus trap and restore, listbox and combobox keyboard handling, `aria-sort`, grid navigation in the table and an inert background all worked without code.

## What it costs

- **Bundle:** 40 kB more gzipped JavaScript, which the builder attributes to locale string tables. The attribution is a reading of the bundle text, not a measurement, and no mitigation was tried.
- **A wrapper layer:** every control needs a hand-written wrapper (about 157 lines in `ui.tsx` for this surface) and a form-wide disabled context. These are the system's own components, which is the point of building `@bitfire/ui`, but it is real work that shadcn pre-writes.
- **Forms:** native validation could not re-validate on change, so validation is controlled and focus-first-invalid is hand-written.
- **Open defects:** no `aria-busy` while pending, dialog initial focus lands on the container, tabbing into the table lands on the first row (sorting is reached with ArrowUp), and the empty combobox message is exposed as a selectable option.

## Departure from the design skill

The `bitfire-design` skill says to use shadcn/ui, themed through the BITFire variables, for the components that are not built yet. This proposal departs from that. The skill's recommendation predates this trial, and issue #2 exists because the plan treated shadcn as settled rather than tested.

## Limits of this evidence

- One run per candidate, each built by a separate Sonnet agent, so effort figures (about 45 and 38 tool calls) are noisy and not a fair measure of the libraries.
- Chromium only. No Firefox, WebKit, touch, forced-colours or reduced-motion run.
- **No screen reader was run for either candidate.** Accessibility claims are from attributes and keyboard behaviour, not from announced speech.
- The agents captured only the tail of each `npm install`, so the absence of install warnings is unverified for both.
- Whether `shadcn init` before `add` would have avoided the missing-package defect was not tried.
- Several screenshots were not inspected by eye by either builder. The coordinating session looked at the error-state and light-theme pages for both: both render correctly, with the same band chips, mono numerals and right-aligned area column.
- Neither Mantine nor Base UI on its own was built, so this is a choice between two, not among four.

## Token gaps both candidates hit (the system's problem, not the library's)

- Type-role classes in `tokens.css` are unlayered, so they beat Tailwind utilities on the same element.
- No Tailwind namespace exists for opacity, z-index or shadow tokens, so they use arbitrary-value syntax.
- No width or size token exists.
- In the light theme, `ink-subtle` on `surface-inset` measures 4.45:1, under the 4.5:1 text threshold.
