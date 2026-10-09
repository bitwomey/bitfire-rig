import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Select } from './Select';
import { eachOpen, expectDimmed, expectFocusRing, expectInvalidBorder, withLocalPortal } from './storyUtils';

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
    withLocalPortal,
  ],
} satisfies Meta<typeof Select>;
export default meta;

type Story = StoryObj<typeof meta>;
const triggers = (c: HTMLElement) => [...c.querySelectorAll<HTMLElement>('button[aria-haspopup="listbox"]')];

export const Default: Story = {
  play: async ({ canvasElement }) => {
    for (const t of triggers(canvasElement)) await expect(t).toHaveTextContent('Choose...');
  },
};
export const Open: Story = {
  parameters: { tall: true },
  play: ({ canvasElement }) =>
    eachOpen(canvasElement, async (root) => {
      await userEvent.click(root.querySelector<HTMLElement>('button[aria-haspopup="listbox"]')!);
      await expect(await within(root).findAllByRole('option')).toHaveLength(5);
    }),
};
export const Selected: Story = { args: { defaultSelectedKey: 'Hunter' }, play: async ({ canvasElement }) => {
  for (const t of triggers(canvasElement)) await expect(t).toHaveTextContent('Hunter');
} };
export const FocusVisible: Story = {
  play: ({ canvasElement }) => expectFocusRing(canvasElement),
};
export const Invalid: Story = {
  args: { error: 'Choose a region.' },
  play: async ({ canvasElement }) => {
    for (const t of triggers(canvasElement)) {
      await expectInvalidBorder(t);
      await expect(t).toHaveAccessibleDescription('Choose a region.');
    }
  },
};
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    for (const t of triggers(canvasElement)) {
      await expect(t).toBeDisabled();
      await expectDimmed(t);
    }
  },
};
