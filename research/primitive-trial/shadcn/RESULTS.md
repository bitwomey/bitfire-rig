# Primitive trial: shadcn/ui (Radix + Base UI) with Tailwind 4

Folder: `research/primitive-trial/shadcn/`. Built from `../SPEC.md`. Real Chromium (Playwright 1.64, headless shell) driving the production build served by `vite preview`. Raw run output is in `tests/run-1-before-focus-fix.txt` and `tests/last-run.txt`; the script is `tests/run.mjs` (`npx vite build; node tests/run.mjs`).

Versions: shadcn CLI 4.21.4, radix-ui 1.7.0, @base-ui/react 1.8.0, tailwindcss 4.3.3, vite 8.3.4, react 19.3.0, typescript 7.0.2.

## 1. Effort

- Tool calls: about 38 (counted by hand, approximate).
- Files authored by hand: 14 (src: `App.tsx`, `main.tsx`, `data.ts`, `index.css`, `vite-env.d.ts`, `components/{danger-chip,spinner,incident-table,intake-form}.tsx`; root: `vite.config.ts`, `tsconfig.json`, `index.html`, `components.json`; test: `tests/run.mjs`).
- Lines of authored code: 758 total, of which 230 are the browser test script; 528 without it. `src/index.css` (83 lines) is the token bridge.
- Vendored, CLI-generated, then edited by me with `sed`: 13 files in `src/components/ui/` (1,376 lines), not counted above. The sed pass is a cost in itself (section 2).
- Disproportionate time:
  1. Making the generated components obey BITFire. Every shadcn component ships Tailwind default sizes, opacities, radii, z-indexes, `dark:` variants and lucide icons. I normalised them with a sed pass and then grepped for leftovers. This was the biggest single cost.
  2. I ran the CLI with `add` only, writing `components.json` by hand rather than running `init` (so `init` would not write its own theme block). That left out dependencies the components import (D1 below).
  3. Two of my multi-file shell heredocs failed to parse in this harness and wrote nothing; I redid them with the file-write tool. Tooling noise, not library cost.

## 2. Styling exceptions

How the bridge works. `src/index.css` imports `tailwindcss`, then the generated `tokens.css` (unlayered), then one `@theme inline` block. That block (a) maps BITFire tokens the way `consumers/tw-fixture` does (`--color-ink: var(--ink)` etc.), and (b) adds the semantic names the shadcn components use, each pointed at a BITFire token and defined only there:

| shadcn name | BITFire token |
| --- | --- |
| background / foreground | canvas / ink |
| card, secondary | surface, surface-raised |
| popover | surface-raised |
| primary / primary-foreground | signal / on-signal |
| muted / muted-foreground | surface-inset / ink-muted |
| accent | surface-hover |
| destructive | status-danger (text on it: on-status-danger) |
| input (control edge) | border (the 3:1 meaningful edge, not hairline) |
| ring | focus-ring |

There is no `:root` shadcn variable block and no `.dark` block, so there is one copy of every value and theme switching is just the `data-theme` attribute flipping the tokens. The bridge itself was clean. The exceptions below are all edits of vendored files or places the model fell short. No colour, size or radius is hard-coded by me.

1. **`dark:` variants.** Generated components carry `dark:bg-input/30`, `dark:aria-invalid:ring-destructive/40` and similar, keyed to a `.dark` class (Tailwind 4's default `dark` variant is `prefers-color-scheme`). Wanted: no per-theme code path. Did: stripped every `dark:` class from the vendored files with sed. Consequence: the dark-only tinted input fill is gone; inputs are transparent on the surface in both themes.
2. **Icons.** All generated files import `lucide-react`; the spec allows Phosphor only. Rewrote the imports to `@phosphor-icons/react` (regular weight, 16 or 20 px) and renamed Chevron to Caret.
3. **Radii.** Generated `rounded-[4px]`, `rounded-xs`, and `rounded-[calc(var(--radius)-5px)]` (the last references a `--radius` that `init` would define and I do not have). Replaced with `rounded-sm` (3px token). Buttons stay `rounded-md` (6px), dialog `rounded-lg` (10px), both match the system.
4. **Shadows.** `shadow-xs` has no token. Used `shadow-sm` and mapped `--shadow-sm/md/lg` in `@theme`.
5. **Disabled opacity.** Generated `opacity-50`; the token is 0.45. Replaced with `opacity-(--opacity-disabled)`.
6. **Focus ring.** Generated `ring-[3px]` replaced with `ring-(length:--stroke-heavy)`. Not fixed: the components use `ring-ring/50`, the focus-ring token mixed to 50 percent, plus a full-strength `border-ring`. The border alone is 10.6:1 (dark) and 5.9:1 (light) against the surface (hand calculation). I did not measure the diluted halo. The 50 percent mix is baked into generated class strings and no token can change it.
7. **z-index.** Generated `z-50` on dialog, overlay, select and combobox replaced by `z-(--z-modal)` or `z-(--z-dropdown)`.
8. **Overlay and destructive text.** `bg-black/50` and `text-white` (raw colours) replaced by `bg-scrim` and `text-on-status-danger`. The destructive button is not on the page; fixed so no raw colour remains in the folder.
9. **Type sizes.** Generated `text-xs` (12px) replaced with `text-sm` (14px) in several places. Nothing under 14px is rendered (audit in section 5). Inputs use the generated `text-base` (16px) below the `md` breakpoint, left alone.
10. **Animations.** The generated classes `animate-in`, `fade-in-0`, `zoom-in-95` come from `tw-animate-css`, which `init` would add and I did not. They emit no CSS (0 matches in the built CSS), so dialogs and popups appear without animation. Left as is to avoid another dependency.
11. **Danger chips.** The tokens expose `ink-on-warm` and `ink-on-deep`, so chips (`bg-fdr-*` fill, `border-border` edge, band word, text `ink-on-warm`, catastrophic `ink-on-deep`) needed no exception. Measured chip text contrast: High 11.68, Extreme 6.53, Moderate 5.35, Catastrophic 5.83, No rating 14.52 (all above 4.5:1). `fdr-*` is never a text or icon colour. Chip fill against surface (non-text 3:1) was not measured.
12. **Fonts.** IBM Plex is loaded from Google Fonts in `index.html` (the system ships no font files). Measured as loaded in the run (Sans 300, 400, 500; Mono 400). Needs network; offline it falls back to the stack in `--font-sans`.
13. **Table container.** The CLI `Table` wraps itself in `overflow-x-auto`, which gave the in-container scroll at 360px with no edit.

## 3. Dependencies

- Direct: 16. Runtime 7: `react`, `react-dom`, `radix-ui`, `@base-ui/react`, `class-variance-authority`, `cn`, `@phosphor-icons/react`. Dev 9: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `@types/node`, `tailwindcss`, `@tailwindcss/vite`, `playwright`. The shadcn approach itself accounts for `radix-ui`, `@base-ui/react`, `class-variance-authority`, `cn`.
- `npm ls --all --parseable | wc -l`: 129 (includes the project line itself).
- Licences: MIT for all except `class-variance-authority`, `playwright` and `typescript` (Apache-2.0).
- Peer-dependency conflicts or deprecation warnings: none seen. I only captured the tail of each install output (`found 0 vulnerabilities`), so the full install log is **UNVERIFIED** for warnings.
- Not an npm workspace member; installs were local. The one thing outside the folder is Playwright's Chromium download (about 118 MB) in the user-level `ms-playwright` cache, its default location. Nothing global was installed.
- `cn` is the CLI's own replacement for clsx plus tailwind-merge (package `cn@0.4.0`, repository `shadcn-ui/cn`), imported as `from "cn"` rather than the older `@/lib/utils`.

## 4. Bundle

`npx vite build`, production, final build:

| File | Raw | Gzip |
| --- | --- | --- |
| `dist/index.html` | 0.77 kB | 0.41 kB |
| `dist/assets/index-*.css` | 46.32 kB | 9.39 kB |
| `dist/assets/index-*.js` | 496.26 kB | 159.60 kB |

`tsc --noEmit` passes. Fonts are Google-hosted and not in the bundle.

## 5. Interaction defects

Chromium headless only (Firefox and WebKit **UNVERIFIED**). No screen reader was run, so announcements are **UNVERIFIED** (I checked attributes, not speech). Touch is **UNVERIFIED**; 360px was a resized desktop viewport.

### Defects and findings

- **D1. CLI `add` leaves the project missing packages.** Steps: hand-write `components.json` in a fresh Vite project, run `npx shadcn@latest add button input label select checkbox textarea dialog command popover table skeleton -y`. Result: files are written and `radix-ui`, `cmdk`, `cn` are installed, but `class-variance-authority` is not (it was in neither `package.json` nor `node_modules`) and the files import `lucide-react`, also absent. I did not run the build before fixing, so the missing-package state is observed and the build failure is inferred. Fix (normal usage): `npm i class-variance-authority`; lucide replaced by Phosphor (section 2). Whether running `shadcn init` first would have avoided this is **UNVERIFIED**.
- **D2. The shadcn 4.x `combobox` is not Radix.** `npx shadcn@latest add combobox field` pulls in `@base-ui/react` (Base UI) and the combobox, input-group and field files sit next to the Radix-based select, dialog and checkbox. Radix has no combobox primitive. The older recipe (Popover plus `cmdk`) puts the typed text in a popover search box and shows the chosen value on a button, which does not match the spec ("chosen value shows in the input"). I used the Base UI one, so this candidate is Radix plus Base UI. I installed and then removed `popover`, `command`, `cmdk`.
- **D3. Dialog does not restore focus when opened without a Trigger.** Steps: focus the form Submit button, press Enter with a valid form (the dialog opens from state, not `DialogTrigger`); press Escape, or click Cancel, or complete Submit. Observed in `tests/run-1-before-focus-fix.txt`: focus lands on `body` in all three cases. Cause: the Radix close handler focuses the trigger ref, which is empty. Fix (documented API): `onCloseAutoFocus={(e) => { e.preventDefault(); submitRef.current?.focus(); }}` on `DialogContent`. After the fix all three cases return focus to the form Submit button (`tests/last-run.txt`). Initial focus on open goes to Cancel, the first tabbable element.
- **D4. Date field has four tab stops.** Tabbing from Danger band lands on `#f-date` four times (month, day, year, picker button). This is native `<input type="date">` behaviour in Chromium, not shadcn; recorded because the spec lists Tab order. The order otherwise matches the visual order: theme toggle, disabled-demo toggle, name, band, date (x4), email, notes, share checkbox, region, Submit, Show loading, Show empty, the four sortable headers, then out of the page.
- **D5. Combobox Escape clears typed text.** Steps: type `ZZZ` in Region (shows "No regions match"), press Escape. The list closes and the input becomes empty. Base UI default behaviour; recorded as observed.
- **D6. Escape and Cancel are ignored while the dialog is submitting.** This is my own guard (`if (!busy)`), not a library defect; noted so it is not misread.
- **D7. Focus ring dilution** (section 2, item 6): focus visibility on fields relies on the full-strength border change; the halo is 50 percent. Not seen failing, not measured.

### Verified working (observed in the run)

- Validation: a failed submit focuses the first invalid field (`#f-name`). Errors have `role="alert"` and ids `e-<field>`; each field `aria-describedby` includes its error id (and helper id where there is one); `aria-invalid="true"` is set. Re-validates on change after the first failure (name "ab" shows the 3-to-60 message, "Test Fire" clears it; future date, bad email and 5-character notes each show their message).
- Select (Radix): Enter opens and focus moves to the first option; 2x ArrowDown reaches "Moderate"; Enter selects and returns focus to the trigger; Space opens; Escape closes with focus on the trigger; ArrowDown on the closed trigger opens; typeahead "Ext" selects Extreme.
- Combobox (Base UI): `role="combobox"`, labelled by "Region". `hu` gives Hunter and Upper Hunter; `hunter` matches case-insensitively; `ZZZ` shows "No regions match" and zero options; ArrowDown x2 then Enter fills the input with "Upper Hunter".
- Dialog: title "Submit incident?", `aria-labelledby` and `aria-describedby` set; focus moves in on open; Tab x6 and Shift+Tab x3 stay inside (Cancel and Submit cycle); background is `aria-hidden`; Escape and Cancel close. Submit shows the spinner and "Submitting" with the button disabled and `aria-busy`, closes after about 1.2 s, the success banner (`role="status"`) appears and the form resets.
- Table: `aria-sort` cycles none, ascending, descending, none on click and on Enter and Space (headers are real buttons). Area ascending puts Frenchmans Track (4) first, descending Eagle Gully (18,400). Band sorts by severity. Area cells are right-aligned, IBM Plex Mono, `tabular-nums`. Show loading renders 20 skeleton cells and `aria-busy="true"` on the table; Show empty renders "No incidents to show".
- Disabled demo: every input, select trigger, textarea, checkbox, combobox and the Submit button reports disabled.
- Themes: `data-theme` toggles on `<html>`; no component has a per-theme branch. Contrast measured from computed styles (dark / light): heading on canvas 17.7 / 15.6, helper text on surface 8.8 / 7.3, label 16.3 / 17.6, primary button 7.5 / 6.3, placeholder 8.8 / 7.3, error text 7.2 / 6.5 (all above 4.5:1). The control edge (token `border`) against surface is 4.47 / 4.48 by hand calculation (above 3:1). The "input_border_vs_surface" figure in `tests/last-run.txt` (7.19 / 6.47) is wrong: it was sampled after the failed submit, so it measured the error-coloured border. Disregard it.
- Font audit, all text nodes, both themes: no text under 14px. Body copy, helper text and table cells render at weight 300 at 14 to 15px, which the rule allows (the weight floor applies below 14px).
- 360px: `scrollWidth` equals `clientWidth` (360) in both themes, so there is no page-level horizontal scroll; the table scrolls inside its container (462px content in a 294px container). The dialog fits (left 16, right 344). Console: no errors or warnings in the run.

### Not run (UNVERIFIED)

Screen reader output; Firefox and WebKit; touch; forced-colours mode; reduced motion; visual strength of the focus halo; select behaviour when the list is taller than the viewport; the dialog at 360px with long text; chip non-text contrast against the surface; a clean `npm ci` with a full install log.

## 6. Screenshots

`shots/`: the four required are `dark-1280.png`, `light-1280.png`, `dark-360.png`, `light-360.png` (full page, empty form). Extras: errors (dark and light), select open, combobox open and empty, dialog, loading, success, table loading, disabled demo, and `light-360-dialog.png`. I looked at `dark-1280.png`, `light-360.png` and `dark-1280-combobox-open.png`; the rest were not inspected by eye (UNVERIFIED by eye beyond the measured checks). In the combobox shot the list opens above the input because the viewport is short; that is the library's flip behaviour.

## 7. Verdict

Easiest: pointing the shadcn semantic names at BITFire tokens in one `@theme inline` block was clean, gave correct dark and light with no per-theme code, and the `ink-on-warm` and fdr tokens meant the danger chips needed no exception. Hardest: the generated component files are Tailwind-default values (sizes, radii, opacities, z-index, `dark:` variants, lucide icons, a 50 percent focus ring) copied into the repo, so tokens cannot own them and I had to rewrite them with sed and regrep; the 4.x combobox also moves you onto a second primitive library (Base UI), and the dialog loses focus restoration unless you wire `onCloseAutoFocus` yourself. I would build a design system on it only if the vendored `ui/` files are treated as owned source with a CI guard for stray Tailwind defaults and a decision up front on Radix versus Base UI, because the behaviour was good once wired but token fidelity depends on editing code rather than configuring it.
