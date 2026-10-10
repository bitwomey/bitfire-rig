import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { ComboBox } from './ComboBox';
import { expectDimmed, expectFocusRing, expectInvalidBorder } from './storyUtils';

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
  ],
} satisfies Meta<typeof ComboBox>;
export default meta;

type Story = StoryObj<typeof meta>;
const input = (c: HTMLElement) => within(c).getByRole('combobox');

// Real input. The popover portals into <body>, so it is queried from `screen` and left
// open for the addon's own axe run, which checks it in the theme under test.
export const Default: Story = {};
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(canvasElement.querySelector('button')!);
    await expect(await screen.findAllByRole('option')).toHaveLength(regions.length);
  },
};
export const Filtered: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.type(input(canvasElement), 'hun');
    const options = await screen.findAllByRole('option');
    await expect(options.map((o) => o.textContent)).toEqual(['Hunter']);
  },
};
export const NoMatch: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.type(input(canvasElement), 'zzz');
    await waitFor(() => expect(screen.getByText('No matches')).toBeVisible());
    // The empty state must not be offered as something to pick.
    await expect(screen.queryAllByRole('option')).toHaveLength(0);
  },
};
export const Selected: Story = {
  args: { defaultSelectedKey: 'Hunter' },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(input(canvasElement)).toHaveValue('Hunter')); // waits for the collection (production build)
  },
};
export const FocusVisible: Story = { play: () => expectFocusRing() };
export const Invalid: Story = {
  args: { error: 'Choose a region from the list.' },
  play: async ({ canvasElement }) => {
    await expectInvalidBorder(input(canvasElement));
    await expect(input(canvasElement)).toHaveAccessibleDescription('Choose a region from the list.');
  },
};
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    await expect(input(canvasElement)).toBeDisabled();
    await expectDimmed(input(canvasElement));
  },
};
