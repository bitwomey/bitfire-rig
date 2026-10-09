import type { Meta, StoryObj } from '@storybook/react-vite';

// DELIBERATELY BROKEN. Excluded from the workbench; only `npm run check:a11y`
// loads it (A11Y_PROOF=violation), to show that an accessibility violation
// fails the gate. The violation is not a colour one: a button with no accessible
// name (axe rule "button-name") and an input with no label (axe rule "label").
// It sets no a11y parameter of its own, so it fails only if the global
// configuration in .storybook/preview.tsx makes violations fail.
const meta = { title: 'Proof/DeliberateViolation' } satisfies Meta;
export default meta;

export const NamelessControls: StoryObj<typeof meta> = {
  render: () => (
    <div className="flex gap-4 p-4">
      <button type="button" className="size-10 rounded-md border border-border" />
      <input type="text" className="h-10 rounded-sm border border-border bg-surface-inset" />
    </div>
  ),
};
