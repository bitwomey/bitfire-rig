import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Button',
  component: Button,
  args: { children: 'Save changes' },
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof meta>;

const button = (canvasElement: HTMLElement) => within(canvasElement).getAllByRole('button')[0];

// Forced states are driven through real input so the data-* attributes React
// Aria sets are the ones under test, not a hand-written class.
const hover: Story['play'] = async ({ canvasElement }) => {
  await userEvent.hover(button(canvasElement));
};
const focusVisible: Story['play'] = async () => {
  await userEvent.tab();
};
const pressed: Story['play'] = async ({ canvasElement }) => {
  await userEvent.pointer({ keys: '[MouseLeft>]', target: button(canvasElement) });
};

export const PrimaryDefault: Story = { args: { variant: 'primary' } };
export const PrimaryHovered: Story = { args: { variant: 'primary' }, play: hover };
export const PrimaryFocusVisible: Story = { args: { variant: 'primary' }, play: focusVisible };
export const PrimaryPressed: Story = { args: { variant: 'primary' }, play: pressed };
export const PrimaryDisabled: Story = { args: { variant: 'primary', isDisabled: true } };
export const PrimaryPending: Story = { args: { variant: 'primary', isPending: true } };

export const SecondaryDefault: Story = { args: { variant: 'secondary' } };
export const SecondaryHovered: Story = { args: { variant: 'secondary' }, play: hover };
export const SecondaryFocusVisible: Story = { args: { variant: 'secondary' }, play: focusVisible };
export const SecondaryPressed: Story = { args: { variant: 'secondary' }, play: pressed };
export const SecondaryDisabled: Story = { args: { variant: 'secondary', isDisabled: true } };
export const SecondaryPending: Story = { args: { variant: 'secondary', isPending: true } };
