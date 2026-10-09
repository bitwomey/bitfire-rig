# Primitive trial: React Aria Components (RAC) candidate

Page: "Incident intake" per `../SPEC.md`. React 19, `react-aria-components` 1.22.0, Tailwind 4.3, Vite 8, TypeScript. All browser results below are from **Microsoft Edge (Chromium 154) driven by Playwright 1.64**, against `vite build` output served by `vite preview`. No other browser or engine was run. No screen reader was run.

Re-run: `npm install; npm run build; npm run preview` then `node tests/e2e.mjs` and `node tests/contrast.mjs`. Raw output of the last run is in `tests/last-run.txt` and `tests/contrast-run.txt`.

## 1. Effort

- Tool calls: about 45 (reads, shell, writes and edits, including dead ends).
- Authored files: 15 (`src/App.tsx`, `src/Table.tsx`, `src/ui.tsx`, `src/data.ts`, `src/main.tsx`, `src/main.css`, `index.html`, `vite.config.ts`, `tsconfig.json`, `package.json`, `tests/e2e.mjs`, `tests/contrast.mjs`, `tests/probe.mjs`, `tests/probe2.mjs`, `tests/probe3.mjs`) plus this file.
- Authored lines (`wc -l`): the app is App 140 + Table 76 + ui 157 + data 13 + main.tsx 5 = **391 lines of TS/TSX**, plus `main.css` (92 lines, of which about 80 are the `@theme inline` block copied from `consumers/tw-fixture`). Config 60 lines. Test and probe scripts 240 lines.
- Disproportionate time:
  1. Form validation. The library's native validation mode gave focus-first-invalid for free but cannot do "re-validate on change after a failed submit" (see defects D1 and D2), so I replaced it with controlled `isInvalid` plus my own `validate()` and my own focus-first-invalid. That was the biggest single detour.
  2. Every control needed its own wrapper in `ui.tsx` (label, helper, error, focus ring, invalid, disabled), because RAC ships nothing.
  3. A first draft wrote the preview server log into the repo `.claude` folder, outside my folder. I deleted that file at once; nothing else was written outside the folder.

## 2. Styling exceptions

BITFire tokens drove everything through Tailwind utilities (`bg-surface-inset`, `border-border`, `text-ink`, `bg-signal`, `bg-fdr-*`, `text-ink-on-warm`, `text-ink-on-deep`, `outline-focus-ring`) and RAC's data attributes (`data-[focus-visible]`, `data-[pressed]`, `data-[hovered]`, `data-[selected]`, `data-[invalid]`, `data-[disabled]`, `data-[pending]`, `data-[placeholder]`, `data-[focus-within]`). No hex or rgb colour was written in the app source. `check-rawcolour` result is at the end.

Exceptions and workarounds, none of them hard-coded colour:

| # | Wanted | Blocked by | Did instead |
| --- | --- | --- | --- |
| E1 | Token type roles (`.body`, `.label`, `.readout-sm`) combined with a family utility such as `font-condensed` or `font-mono`. | `tokens.css` defines the roles as plain unlayered classes. Unlayered CSS beats Tailwind's layered utilities, so a utility on the same element silently loses. | Used the role class alone where it fits (`.readout-sm` already is mono for the Area and Updated columns). Where I needed to override (button and table header weight) I used the important modifier `font-normal!`. The condensed face the design system recommends for table headers is **not applied**: I gave up on it rather than fight the cascade. |
| E2 | Font sizes from tokens as utilities. | The tokens expose sizes only as the role classes, not as `--text-*` variables, so Tailwind has no theme namespace to map. | Same as E1: only the role classes carry size. No arbitrary pixel sizes were written. |
| E3 | Opacity, z-index, shadow tokens as named utilities. | Same limitation the fixture notes: no Tailwind namespace for them. | Used arbitrary-value syntax pointing at the variable: `opacity-(--opacity-disabled)`, `z-(--z-modal)`, `z-(--z-dropdown)`, `shadow-[var(--shadow-panel)]`. Token-driven, but not a mapped utility. |
| E4 | Layout widths (`max-w-md`, `max-w-5xl`, `size-4`, `h-10`, `w-10`). | There is no width or size token. `h-10` and spacing do resolve through the mapped `--spacing-*` tokens; `max-w-*` uses Tailwind's own container scale. | Used Tailwind's default `max-w-*` scale for the page and dialog widths. This is a design-system gap, not a RAC one. Marked here because it is a size not driven by a token. |
| E5 | Invalid border on the Select trigger via `data-[invalid]`. | RAC puts `data-invalid` on the Select root, not on the trigger button. | Gave the root Tailwind's `group` class and styled the trigger with `group-data-[invalid]:...`. Found by screenshot (defect D3). |
| E6 | Whole-form disabled. | RAC has no form- or fieldset-level `isDisabled`. | A React context (`DisabledCtx`) read by every wrapper, plus a hook. About 6 lines but every wrapper must remember it. |
| E7 | Danger-band chip text colours from the token system. | None: `--ink-on-warm` and `--ink-on-deep` exist and map cleanly. | No exception. Chip fill `bg-fdr-*`, `border-border` edge, band word, text `ink-on-warm`, except catastrophic `ink-on-deep`. |
| E8 | Light-theme placeholder contrast. | The token pair `ink-subtle` on `surface-inset` measures **4.45:1** in light (needs 4.5:1 for text). This is a token-pair issue, independent of RAC. | Left as the tokens give it and report it here. Unresolved. |
| E9 | Spinner. | RAC ships none. | A CSS-only ring using `border-current` plus Tailwind `animate-spin`. The skeleton uses a small keyframe in `main.css` (no colour). |

Not an exception but a cost: the Tailwind `@theme inline` block was copied, not shared, from the fixture; each candidate carries its own copy.

## 3. Dependencies

- Direct runtime dependencies: **5** (`react`, `react-dom`, `react-aria-components`, `@internationalized/date`, `@phosphor-icons/react`). Direct dev dependencies: 8 (`vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `typescript`, `@types/react`, `@types/react-dom`, `playwright`).
- `npm ls --all --parseable | wc -l` = **58** (includes the project root line). Production only: 18.
- Licences (direct runtime): react MIT, react-dom MIT, react-aria-components Apache-2.0, @internationalized/date Apache-2.0, @phosphor-icons/react MIT. Dev: tailwindcss MIT, vite MIT, typescript Apache-2.0, playwright Apache-2.0.
- Peer-dependency conflicts or deprecation warnings: **none seen**. I read only the tail of each `npm install` output, which showed `found 0 vulnerabilities` and no `warn` lines; I did not keep the full log, so a warning earlier in the output is **UNVERIFIED** as absent.
- `@internationalized/date` is a direct dependency only because the form needs `parseDate` and `CalendarDate` for the date field and the "not in the future" check.

## 4. Bundle (`vite build`)

```
dist/index.html                   0.75 kB | gzip:   0.41 kB
dist/assets/index-DRej7ed-.css   23.34 kB | gzip:   5.86 kB
dist/assets/index-CXj4JEG7.js   659.33 kB | gzip: 200.66 kB
```

Vite warns the JS chunk is over 500 kB. Phosphor is tree-shaken (an unused icon name does not appear in the bundle). The size is the library: the bundle contains the locale string tables for dozens of locales (the locale codes appear repeatedly in the output). I did not measure the exact split, so the attribution to locale tables is a reading of the bundle text, not a measurement, and no mitigation was tried.

## 5. Interaction defects and observations

Everything here was run in Edge (Chromium) via Playwright. Items marked UNVERIFIED were not run.

Defects:

- **D1. Native validation re-validates on blur, not on change.** Steps: leave `validationBehavior` at the default (native) with `validate` props, click Submit on an empty form, then type "ab" into Incident name. Observed (tests/probe.mjs in an earlier build): the stale message "Enter an incident name" stays while typing; the new message appears only after Tab; typing a valid value leaves `aria-invalid="true"` until blur. The spec wants re-validation on change. **Fix applied, and it is documented usage:** controlled `isInvalid` plus a `FieldError` that renders my message, with `validationBehavior="aria"` on the Form. In exchange I had to write focus-first-invalid myself (native mode did it automatically). After the fix: typing "ab" immediately shows "Incident name must be 3 to 60 characters", typing "Test Fire" clears it, and on a failed submit focus lands on the Incident name input (all observed).
- **D2. Required but empty Select and Date show the browser's own English message, and `validate` is not consulted.** Steps: native mode, submit empty. Observed text: "Please select an item in the list." (Danger band) and "Please fill in this field." (Start date), while the text field showed my message. Resolved by the same switch to controlled errors as D1 (not by the documented `valueMissing` render-prop route, which I did not try).
- **D3. Select trigger did not show the invalid state.** Steps: submit empty form; the Danger band control had no red border while the others did (seen in a screenshot). Cause and fix in E5. Fixed.
- **D4. Pending button exposes no `aria-busy`.** Steps: confirm in the dialog; during the 1200 ms the button has `aria-disabled="true"`, `data-pending="true"`, text "Submitting", and `aria-busy` is absent. The spinner is `aria-hidden`; the label change is the only cue. Whether a screen reader announces it is UNVERIFIED.
- **D5. Initial dialog focus is the dialog container, not a control.** Steps: submit a valid form; `document.activeElement` is the dialog (`role=dialog`). Focus is inside the dialog as required, and Tab moves to Cancel then Submit, but a first Tab press is needed to reach a control. This is RAC's default; I did not try to change it.
- **D6. Tabbing into the table lands on the first row, not on the sort headers.** Steps: Tab from "Show empty". Focus is the first data row. Keyboard-only sorting works but via ArrowUp to a header (verified in `tests/probe2.mjs`: Tab, ArrowUp, ArrowRight to Danger band, Enter gave ascending, Enter twice more gave descending then none). A keyboard user must know to press ArrowUp.
- **D8. Combobox shows nothing at all when no option matches.** Steps: click Region, type "zzz". Observed with my first build: no popover, no listbox, `aria-expanded="false"`, so the spec empty state "No regions match" was missing even though I had passed `renderEmptyState`. **Fix applied, documented prop:** `allowsEmptyCollection` on the ComboBox. After it the listbox opens with "No regions match" (observed; screenshot `shots/combobox-empty-1280-dark.png`). Side observation: the empty-state element is exposed with role option (Playwright counts 1 option for it), so assistive technology may announce it as a selectable item. Not changed.
- **D7. Light-theme placeholder contrast 4.45:1**, below 4.5:1 (token pair, see E8).

Checked and working (observed):

- Tab order, forward: Dark theme, Disabled demo, Incident name, Danger band, Start date (day, month, year segments are three tab stops), Contact email, Region, Notes, Share checkbox, Submit, Show loading, Show empty, table (one tab stop), then leaves the page. Shift+Tab reversed it correctly.
- Select: Enter opens, ArrowDown moves, Escape closes and returns focus to the trigger, Space opens, Enter selects and shows the value.
- Combobox: focus or click opens all 30 options (I set `menuTrigger="focus"`); "hun" gives Hunter and Upper Hunter; ArrowDown then Enter selects Hunter; "zzz" shows "No regions match" (after fix D8); case-insensitive "PILB" selects Pilbara; Escape closes and clears the unselected typed text.
- Date field: typing 08102026 gives 08/10/2026; 15/10/2026 shows "Start date cannot be in the future". Display order is day, month, year because of the browser locale.
- Dialog: opens with title "Submit incident?" and a seven-line summary; Tab and Shift+Tab cycle only between Cancel and Submit (trap); Escape closes; Cancel closes; focus returns to the form Submit button in both cases; the rest of the page gets `inert`; confirm shows "Submitting" for 1200 ms then closes and shows the "Submitted." banner (`role=status`); focus after that is on the form Submit button.
- Table: `aria-sort` on every header (`none`, `ascending`, `descending`), Enter and Space both cycle ascending, descending, none (and the row order changes accordingly); band sort uses severity order, not alphabetical; ArrowLeft/Right/Down move by cell; loading toggle shows 5 skeleton rows; empty toggle shows "No incidents to show".
- Disabled demo: all 10 form controls report disabled (including the three date segments and the select trigger), and Tab skips the whole form.
- 360 px: `scrollWidth` equals `clientWidth` (360) in both themes, so no horizontal page scroll; the table scrolls inside its own container. The select popover at 360 px sits at 33 to 327 px, inside the viewport.
- Both themes through the page's own switch, no per-theme code path in the app; contrast measured from computed styles (full numbers in `tests/contrast-run.txt`): chip text on fill 5.35 to 14.52 in both themes (Moderate 5.35 lowest); error text 7.19 dark / 6.47 light; helper text 8.78 / 7.25; primary button 7.50 / 6.28; input border against panel 7.19 / 6.47.
- Console and page errors during the whole run: none.

UNVERIFIED (not run): any screen reader; Firefox and Safari; touch input or a real phone; the dialog at 360 px (no screenshot or measurement); high-contrast or forced-colours mode; reduced motion; the Select typeahead; behaviour when the list is long enough to scroll inside the popover; the loading-table state in light theme and the 360 px error state; the preview served from a non-root path.

## 6. Screenshots

In `shots/` (PNG): `page-1280-dark`, `page-1280-light`, `page-360-dark`, `page-360-light` (full page, theme switched with the page's own toggle), plus `errors-1280-dark`, `errors-1280-light`, `dialog-1280-dark`, `loading-1280-dark` (dialog confirming), `table-loading-1280-dark`, `disabled-1280-dark`, `select-open-360-dark`, `combobox-empty-1280-dark`.

## 7. Verdict

Easiest: behaviour and accessibility were nearly free once wired (focus trap and restore, listbox and combobox keyboard handling, `aria-sort`, grid navigation in the table, `inert` background), and the data attributes took BITFire tokens through Tailwind utilities with no raw colour. Hardest: forms, because the library's native validation could not do the spec's re-validate-on-change, so I wrote a controlled validation layer and my own focus-first-invalid, and because every control needs a hand-written wrapper plus a disabled context; the token type roles also fight Tailwind utilities (E1). I would build a design system on it for the accessibility and keyboard behaviour I did not have to author, accepting that the system's own wrapper layer (about 160 lines for this surface) is the cost, that the JS bundle is 200 kB gzipped, and that the style-system gaps (type roles, no opacity or shadow mapping, the light placeholder pair) are the tokens' problem to fix once rather than per component.
