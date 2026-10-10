import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent } from 'storybook/test';
import { Select } from './Select';
import { expectDimmed, expectFocusRing, expectInvalidBorder } from './storyUtils';

const meta = {
  title: 'Forms/Select',
  component: Select,
  args: { label: 'Region', items: ['Alpine', 'Bendigo', 'Gippsland East', 'Hunter', 'Kimberley'] },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;
export default meta;

type Story = StoryObj<typeof meta>;
const trigger = (c: HTMLElement) => c.querySelector<HTMLElement>('button[aria-haspopup="listbox"]')!;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(trigger(canvasElement)).toHaveTextContent('Choose...');
  },
};
// The popover portals into <body>, so it is queried from `screen` and left open for the
// addon's own axe run, which checks it in the theme under test.
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(trigger(canvasElement));
    await expect(await screen.findAllByRole('option')).toHaveLength(5);
  },
};
export const Selected: Story = {
  args: { defaultSelectedKey: 'Hunter' },
  play: async ({ canvasElement }) => {
    await expect(trigger(canvasElement)).toHaveTextContent('Hunter');
  },
};
export const FocusVisible: Story = { play: () => expectFocusRing() };
export const Invalid: Story = {
  args: { error: 'Choose a region.' },
  play: async ({ canvasElement }) => {
    await expectInvalidBorder(trigger(canvasElement));
    await expect(trigger(canvasElement)).toHaveAccessibleDescription('Choose a region.');
  },
};
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    await expect(trigger(canvasElement)).toBeDisabled();
    await expectDimmed(trigger(canvasElement));
  },
};
