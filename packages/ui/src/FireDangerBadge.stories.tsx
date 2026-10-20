import type { Meta, StoryObj } from '@storybook/react';
import { FireDangerBadge } from './FireDangerBadge';

const meta: Meta<typeof FireDangerBadge> = {
  component: FireDangerBadge,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof FireDangerBadge>;

export const NoRating: Story = { args: { rating: 'no-rating' } };
export const Moderate: Story = { args: { rating: 'moderate' } };
export const High: Story = { args: { rating: 'high' } };
export const Extreme: Story = { args: { rating: 'extreme' } };
export const Catastrophic: Story = { args: { rating: 'catastrophic' } };
export const SizeLg: Story = { args: { rating: 'extreme', size: 'lg' } };
export const Localised: Story = { args: { rating: 'high', children: 'Alto' } };

export const AllRatings: Story = {
  render: () => (
    <div className="flex flex-col gap-2 items-start">
      {(['no-rating', 'moderate', 'high', 'extreme', 'catastrophic'] as const).map((r) => (
        <FireDangerBadge key={r} rating={r} />
      ))}
    </div>
  ),
};

export const AllRatingsLg: Story = {
  render: () => (
    <div className="flex flex-col gap-2 items-start">
      {(['no-rating', 'moderate', 'high', 'extreme', 'catastrophic'] as const).map((r) => (
        <FireDangerBadge key={r} rating={r} size="lg" />
      ))}
    </div>
  ),
};
