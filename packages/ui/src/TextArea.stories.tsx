import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { TextArea } from './TextArea';
import { expectDimmed, expectFocusRing, expectInvalidBorder } from './storyUtils';

const meta = {
  title: 'Forms/TextArea',
  component: TextArea,
  args: { label: 'Field notes', description: 'Plain text, shared with the crew.', placeholder: 'Conditions at the site' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextArea>;
export default meta;

type Story = StoryObj<typeof meta>;
const boxes = (c: HTMLElement) => within(c).getAllByRole('textbox');
const note = 'Wind easing from the south west.';

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: note } };
export const FocusVisible: Story = { play: ({ canvasElement }) => expectFocusRing(canvasElement) };
export const Invalid: Story = {
  args: { defaultValue: 'ok', error: 'Enter at least 20 characters.' },
  play: async ({ canvasElement }) => {
    for (const b of boxes(canvasElement)) {
      await expectInvalidBorder(b);
      await expect(b).toHaveAttribute('aria-invalid', 'true');
      const described = b.getAttribute('aria-describedby')!.split(' ').map((id) => document.getElementById(id)?.textContent);
      await expect(described).toContain('Enter at least 20 characters.');
    }
  },
};
export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: note },
  play: async ({ canvasElement }) => {
    for (const b of boxes(canvasElement)) {
      await expect(b).toBeDisabled();
      await expectDimmed(b);
    }
  },
};
export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultValue: note },
  play: async ({ canvasElement }) => {
    for (const b of boxes(canvasElement)) {
      await expect(b).toHaveAttribute('readonly');
      await expect(getComputedStyle(b).borderTopStyle).toBe('dashed');
    }
  },
};
