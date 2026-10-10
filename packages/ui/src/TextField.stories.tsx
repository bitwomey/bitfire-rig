import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { TextField } from './TextField';
import { expectDimmed, expectFocusRing, expectInvalidBorder } from './storyUtils';

const meta = {
  title: 'Forms/TextField',
  component: TextField,
  args: { label: 'Site name', description: 'Shown on the shared incident map.', placeholder: 'e.g. Mt Buller' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextField>;
export default meta;

type Story = StoryObj<typeof meta>;
const boxes = (c: HTMLElement) => within(c).getAllByRole('textbox');

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: 'Mt Buller' } };
export const FocusVisible: Story = { play: () => expectFocusRing() };
export const Invalid: Story = {
  args: { defaultValue: 'x', error: 'Enter at least 3 characters.' },
  play: async ({ canvasElement }) => {
    for (const b of boxes(canvasElement)) {
      await expectInvalidBorder(b);
      await expect(b).toHaveAttribute('aria-invalid', 'true');
      // The message is tied to the field, not just placed near it.
      const described = b.getAttribute('aria-describedby')!.split(' ').map((id) => document.getElementById(id)?.textContent);
      await expect(described).toContain('Enter at least 3 characters.');
    }
  },
};
export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'Mt Buller' },
  play: async ({ canvasElement }) => {
    for (const b of boxes(canvasElement)) {
      await expect(b).toBeDisabled();
      await expectDimmed(b);
    }
  },
};
export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultValue: 'Mt Buller' },
  play: async ({ canvasElement }) => {
    for (const b of boxes(canvasElement)) {
      await expect(b).toHaveAttribute('readonly');
      await expect(getComputedStyle(b).borderTopStyle).toBe('dashed');
    }
  },
};
