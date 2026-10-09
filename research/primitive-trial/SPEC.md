# UI primitive trial: shared spec (issue #2)

Two candidates build the **same** surface from this spec, so their costs can be compared. Candidates:

- **shadcn/ui** over Radix primitives, added with the shadcn CLI, styled with Tailwind 4.
- **React Aria Components** (`react-aria-components`), styled with Tailwind 4.

Each candidate lives in its own folder, `research/primitive-trial/<shadcn|rac>/`, with its own `package.json` and lockfile. It is **not** an npm workspace member, so it cannot disturb the root install or lockfile.

## The surface: one page, "Incident intake"

A single page with four parts. All copy is plain English; all data is the fixed data below, hard-coded, never random.

### 1. Labelled form with validation

Fields, each with a visible label, helper text where noted, and an inline error message tied to the field for assistive technology:

| Field | Control | Rule |
| --- | --- | --- |
| Incident name | text | required; 3 to 60 characters |
| Danger band | select (single) | required; options No rating, Moderate, High, Extreme, Catastrophic |
| Start date | date | required; not in the future (reference date 2026-10-09) |
| Contact email | email | required; valid email shape |
| Notes | textarea | optional; if present, at least 10 characters |
| Share with the regional team | checkbox | optional |

Behaviour:

- Validate on submit; after a first failed submit, re-validate each field on change.
- On a failed submit, focus moves to the first invalid field.
- The Submit button has two states beyond default: loading (a visible spinner and the label "Submitting", 1200 ms of fake delay, then success), and disabled, which applies only while the form is in the disabled demo state below.
- A "Disabled demo" toggle on the page forces the whole form (every field and the button) into its disabled state so it can be inspected.

### 2. Searchable selector

A combobox labelled "Region" over the 30 regions below. Typing filters by case-insensitive substring. Arrow keys move through options, Enter selects, Escape closes, and the chosen value shows in the input. No match shows an empty state, "No regions match". The selector sits inside the form as a seventh field, and is required.

### 3. Modal

Submitting a valid form opens a confirmation dialog: title "Submit incident?", a summary of the entered values, **Cancel** and **Submit** buttons. Requirements: focus moves into the dialog on open, is trapped inside it, Escape and Cancel close it, and focus returns to the control that opened it. Submit runs the loading state above, then closes the dialog and shows a success banner on the page.

### 4. Sortable table

The 12 incidents below in a table with columns Name, Danger band, Area (ha), Updated. Name, Danger band, Area and Updated are sortable: activating a header cycles ascending, descending, none, announces the sort to assistive technology (`aria-sort`), and is operable from the keyboard alone. A "Show loading" toggle renders a loading state (skeleton rows), and a "Show empty" toggle renders an empty state ("No incidents to show"). Area is right-aligned, in a monospaced face, and tabular.

## Both themes

A toggle on the page switches `data-theme` between dark (default) and `light` on `<html>`. Every part of the surface must be correct in both. No part may need a different code path per theme.

## Narrow layout

Usable at a 360 px viewport width with no horizontal page scroll. The table may scroll horizontally inside its own container.

## Styling rules (from the BITFire design system)

- Import the generated tokens, `../../../packages/tokens/dist/tokens.css`. **Never hard-code a colour, size or radius.** Map the tokens into Tailwind 4 the way `consumers/tw-fixture/src/main.css` does (`@theme inline`), and use those utilities.
- `npm run check:colour` from the repo root scans `packages fixtures consumers`. Run it on your folder too: `node tools/check-rawcolour.mjs research/primitive-trial/<name>`. It must pass.
- Use Phosphor icons only if you need an icon (regular weight, 16 or 20 px). Do not add an icon library otherwise.
- Danger-band chips use the `fdr-*` tokens as a fill with a `border` edge and the band **word**, never as text or icon colour. Text on them is `#0a1114` through the token system, except catastrophic (white); if the tokens do not expose this, record it as a styling exception rather than hard-coding.
- Nothing under 14 px below weight 400. Numbers a reader compares are monospaced.

## Fixed data

Regions (30): Alpine, Barwon South West, Bass Coast, Bendigo, Central Highlands, Central West, Darling Downs, Eyre Peninsula, Far North Coast, Flinders, Gippsland East, Goldfields, Hunter, Illawarra, Kangaroo Island, Kimberley, Lachlan, Mallee, Mid North Coast, Murray, Northern Rivers, Otways, Pilbara, Riverina, South East Forests, Southern Highlands, Sunshine Coast, Tablelands, Upper Hunter, Wimmera.

Incidents (12), name, band, area in hectares, updated (ISO date):

1. Black Creek, High, 412, 2026-10-08
2. Corryong Ridge, Extreme, 5230, 2026-10-09
3. Dunmore Flat, Moderate, 38, 2026-10-07
4. Eagle Gully, Catastrophic, 18400, 2026-10-09
5. Frenchmans Track, No rating, 4, 2026-10-02
6. Granite Spur, High, 960, 2026-10-08
7. Hawker Reserve, Moderate, 120, 2026-10-06
8. Ironbark Creek, Extreme, 2750, 2026-10-09
9. Jarrah Gully, High, 305, 2026-10-05
10. Kookaburra Bend, No rating, 11, 2026-09-30
11. Lyrebird Track, Moderate, 77, 2026-10-04
12. Mount Terrible, Extreme, 3100, 2026-10-08

## What to measure and report

Write `RESULTS.md` in your folder with these sections. Mark anything you did not run as **UNVERIFIED**. Do not report that something works because the code looks right.

1. **Effort.** Number of tool calls you made, number of files authored, lines of authored code (`wc -l` over files you wrote, not generated or vendored ones), and anything that cost you disproportionate time and why.
2. **Styling exceptions.** Every place the primitive's styling model could not take a BITFire token directly: what you wanted, what blocked it, and what you did instead. If you hard-coded or worked around anything, say so.
3. **Dependencies.** Direct dependency count, and the total from `npm ls --all --parseable | wc -l`. Licences of direct dependencies. Any peer-dependency conflict or deprecation warning during install, verbatim.
4. **Bundle.** `vite build` output sizes (raw and gzip) for the production build.
5. **Interaction defects.** Drive the page in a real browser (Playwright, installed in your folder, not globally) and test: Tab and Shift+Tab order; Enter, Space, Escape and arrow keys on the select, the combobox, the dialog and the table headers; focus trap and focus restoration for the dialog; disabled, error and loading states; the 360 px width; both themes. List each defect with exact steps to reproduce. If you could not run a real browser, say so and mark every item in this section UNVERIFIED.
6. **Screenshots.** Save screenshots of both themes at 1280 px and at 360 px to `shots/` in your folder (PNG).
7. **Verdict.** Three sentences: what was easiest, what was hardest, and whether you would build a design system on it, with the reason.

## Rules for the agent

- Work only inside your own folder. Do not edit the root `package.json`, lockfile, `tools/`, `packages/` or any other candidate's folder.
- Install dependencies inside your folder only. Do not install anything globally.
- If you start a dev or preview server, record its PID and **kill only that PID** when you are done. Never kill processes by image name (`taskkill /IM`): other sessions run on this machine.
- Keep any load short. Do not run anything for more than a few minutes.
- Do not commit. Leave your work uncommitted in your folder; the coordinating session commits.
- This repo is public. Do not put secrets, personal data, or any employer-related names in any file.
