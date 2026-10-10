import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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
// A simulated hover is sometimes not picked up on a slow runner, and without an
// assertion the story would finish in whichever state it happened to reach, so
// its screenshot would differ between runs. Re-issue the hover until it takes.
const hover: Story['play'] = async ({ canvasElement }) => {
  await waitFor(
    async () => {
      if (button(canvasElement).getAttribute('data-hovered') !== 'true') await userEvent.hover(button(canvasElement));
      await expect(button(canvasElement)).toHaveAttribute('data-hovered', 'true');
    },
    { timeout: 8000, interval: 250 },
  );
};
// The focus ring must actually paint: the data attribute alone does not prove it.
const focusVisible: Story['play'] = async ({ canvasElement }) => {
  await userEvent.tab();
  const { outlineStyle, outlineWidth } = getComputedStyle(button(canvasElement));
  await expect(outlineStyle).not.toBe('none');
  await expect(outlineWidth).not.toBe('0px');
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
