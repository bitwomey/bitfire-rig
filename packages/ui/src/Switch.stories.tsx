import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Switch } from './Switch';
import { expectDimmed, expectFocusRing, indicatorOf } from './storyUtils';

const meta = {
  title: 'Forms/Switch',
  component: Switch,
  args: { children: 'Share location with the crew' },
} satisfies Meta<typeof Switch>;
export default meta;

type Story = StoryObj<typeof meta>;
const switches = (c: HTMLElement) => within(c).getAllByRole('switch');

export const Off: Story = {
  play: async ({ canvasElement }) => {
    for (const s of switches(canvasElement)) await expect(s).not.toBeChecked();
  },
};
// Turned on by clicking, so the attribute under test is the one React Aria sets.
export const On: Story = {
  play: async ({ canvasElement }) => {
    for (const s of switches(canvasElement)) {
      await userEvent.click(s);
      await expect(s).toBeChecked();
    }
  },
};
export const FocusVisible: Story = { play: ({ canvasElement }) => expectFocusRing(canvasElement, indicatorOf) };
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    for (const s of switches(canvasElement)) {
      await expect(s).toBeDisabled();
      await expectDimmed(s);
    }
  },
};
