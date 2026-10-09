import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComboBox } from './ComboBox';
import { eachOpen, expectDimmed, expectFocusRing, expectInvalidBorder, withLocalPortal } from './storyUtils';

const regions = [
  'Alpine', 'Barossa', 'Bendigo', 'Blue Mountains', 'Central Highlands', 'Eyre Peninsula', 'Flinders', 'Gippsland East',
  'Gippsland West', 'Goldfields', 'Grampians', 'Hunter', 'Illawarra', 'Kangaroo Island', 'Kimberley', 'Mallee',
  'Mid North', 'Murray', 'Northern Rivers', 'Otways', 'Pilbara', 'Riverina', 'South West', 'Snowy Monaro',
  'Sunraysia', 'Tablelands', 'Top End', 'Wheatbelt', 'Wimmera', 'Yorke Peninsula',
];

const meta = {
  title: 'Forms/ComboBox',
  component: ComboBox,
  args: { label: 'Region', items: regions, placeholder: 'Search regions' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
    withLocalPortal,
  ],
} satisfies Meta<typeof ComboBox>;
export default meta;

type Story = StoryObj<typeof meta>;
const inputs = (c: HTMLElement) => [...c.querySelectorAll<HTMLInputElement>('input[role="combobox"]')];

// Real input: type into the field of each copy, check that copy with axe while its
// popover is open (see eachOpen), then close it.
const typeInto = (text: string, check: (root: HTMLElement) => Promise<void>): Story['play'] => ({ canvasElement }) =>
  eachOpen(canvasElement, async (root) => {
    await userEvent.type(root.querySelector('input')!, text);
    await check(root);
  });

export const Default: Story = {};
export const Open: Story = {
  parameters: { tall: true },
  play: ({ canvasElement }) =>
    eachOpen(canvasElement, async (root) => {
      await userEvent.click(root.querySelector<HTMLElement>('button')!);
      await expect(await within(root).findAllByRole('option')).toHaveLength(regions.length);
    }),
};
export const Filtered: Story = {
  parameters: { tall: true },
  play: typeInto('hun', async (root) => {
    const options = await within(root).findAllByRole('option');
    await expect(options.map((o) => o.textContent)).toEqual(['Hunter']);
  }),
};
export const NoMatch: Story = {
  parameters: { tall: true },
  play: typeInto('zzz', async (root) => {
    await waitFor(() => expect(within(root).getByText('No matches')).toBeVisible());
    // The empty state must not be offered as something to pick.
    await expect(within(root).queryAllByRole('option')).toHaveLength(0);
  }),
};
export const Selected: Story = {
  args: { defaultSelectedKey: 'Hunter' },
  play: async ({ canvasElement }) => {
    for (const i of inputs(canvasElement)) await expect(i).toHaveValue('Hunter');
  },
};
export const FocusVisible: Story = { play: ({ canvasElement }) => expectFocusRing(canvasElement) };
export const Invalid: Story = {
  args: { error: 'Choose a region from the list.' },
  play: async ({ canvasElement }) => {
    for (const i of inputs(canvasElement)) {
      await expectInvalidBorder(i);
      await expect(i).toHaveAccessibleDescription('Choose a region from the list.');
    }
  },
};
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    for (const i of inputs(canvasElement)) {
      await expect(i).toBeDisabled();
      await expectDimmed(i);
    }
  },
};
