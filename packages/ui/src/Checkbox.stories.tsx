import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Checkbox } from './Checkbox';
import { expectDimmed, expectFocusRing, expectInvalidBorder, indicatorOf } from './storyUtils';

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  args: { children: 'Send me burn-off notices' },
} satisfies Meta<typeof Checkbox>;
export default meta;

type Story = StoryObj<typeof meta>;
const boxes = (c: HTMLElement) => within(c).getAllByRole('checkbox');

export const Default: Story = {};
export const Checked: Story = {
  args: { defaultSelected: true },
  play: async ({ canvasElement }) => {
    for (const b of boxes(canvasElement)) await expect(b).toBeChecked();
  },
};
export const Indeterminate: Story = {
  args: { isIndeterminate: true },
  play: async ({ canvasElement }) => {
    for (const b of boxes(canvasElement)) await expect((b as HTMLInputElement).indeterminate).toBe(true);
  },
};
export const FocusVisible: Story = { play: ({ canvasElement }) => expectFocusRing(canvasElement, indicatorOf) };
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    for (const b of boxes(canvasElement)) {
      await expect(b).toBeDisabled();
      await expectDimmed(b);
    }
  },
};
export const Invalid: Story = {
  args: { children: 'I accept the terms', error: 'Accept the terms to continue.' },
  play: async ({ canvasElement }) => {
    for (const b of boxes(canvasElement)) {
      await expectInvalidBorder(indicatorOf(b) as HTMLElement);
      await expect(b).toHaveAccessibleDescription('Accept the terms to continue.');
    }
  },
};
