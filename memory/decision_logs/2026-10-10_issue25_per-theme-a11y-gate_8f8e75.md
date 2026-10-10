---
name: per-theme-a11y-gate
description: "The accessibility gate runs the stories once per theme with the theme on the document, because React Aria portals popovers and dialogs into body where the old dark and light containers never reached"
type: decision
---

**Problem (found by a builder, issue #25).** Test mode rendered each story twice, in a dark and a light container. React Aria portals popovers, listboxes and dialogs into `<body>`, outside both containers, so they were only ever checked in dark. The double render also made duplicate landmarks that stories worked around.

**Decision.** `VITE_A11Y_THEME` (`dark` or `light`) sets the theme on the document for the whole run; `check:a11y` runs the real stories under each theme. Removed the double-render decorator and the untried `bothThemes` option.

**How it is shown.** Three committed proof stories in `packages/ui/proof/` (selected with `A11Y_PROOF=<file stem>`): nameless controls must fail on `button-name` and `label`; two light-only contrast stories (in the page, and inside a portalled dialog) use `ink-subtle` on `surface-inset` (4.44:1 in light) and must fail on `color-contrast` under light and pass under dark. The proofs set no a11y parameter of their own, so deleting the global `a11y.test: 'error'` makes the gate fail.

**Not shown.** A dark-only failure (no token pair fails only in dark); a screen reader.
