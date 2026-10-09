import type { Meta, StoryObj } from '@storybook/react-vite';

// DELIBERATELY BROKEN, and only in the light theme. Excluded from the
// workbench; only `npm run check:a11y` loads it (A11Y_PROOF=contrast-light). It uses
// two real tokens, ink-subtle on surface-inset, which axe measures at 4.44:1 in the
// light theme (below the 4.5:1 for text) and pass in the dark theme. That shows
// the gate checks each theme separately. No raw colour is written here.
const meta = { title: 'Proof/LightContrast' } satisfies Meta;
export default meta;

export const SubtleOnInset: StoryObj<typeof meta> = {
  render: () => <p className="body bg-surface-inset p-2 text-ink-subtle">Subtle text on an inset surface</p>,
};
