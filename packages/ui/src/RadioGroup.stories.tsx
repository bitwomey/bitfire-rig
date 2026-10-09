import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { RadioGroup } from './RadioGroup';
import { expectDimmed, expectFocusRing, expectInvalidBorder, indicatorOf } from './storyUtils';

const meta = {
  title: 'Forms/RadioGroup',
  component: RadioGroup,
  args: {
    label: 'Notification channel',
    options: [
      { value: 'sms', label: 'SMS' },
      { value: 'email', label: 'Email' },
      { value: 'radio', label: 'Radio call' },
    ],
  },
} satisfies Meta<typeof RadioGroup>;
export default meta;

type Story = StoryObj<typeof meta>;
const radios = (c: HTMLElement) => within(c).getAllByRole('radio');

export const Default: Story = {};
export const Selected: Story = {
  args: { defaultValue: 'email' },
  play: async ({ canvasElement }) => {
    for (const r of radios(canvasElement).filter((r) => (r as HTMLInputElement).value === 'email')) await expect(r).toBeChecked();
  },
};
export const FocusVisible: Story = { play: ({ canvasElement }) => expectFocusRing(canvasElement, indicatorOf) };
export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'sms' },
  play: async ({ canvasElement }) => {
    for (const r of radios(canvasElement)) {
      await expect(r).toBeDisabled();
      await expectDimmed(r);
    }
  },
};
export const Invalid: Story = {
  args: { error: 'Choose a channel.' },
  play: async ({ canvasElement }) => {
    for (const g of within(canvasElement).getAllByRole('radiogroup')) {
      await expect(g).toHaveAccessibleDescription('Choose a channel.');
      await expectInvalidBorder(indicatorOf(within(g).getAllByRole('radio')[0]) as HTMLElement);
    }
  },
};
