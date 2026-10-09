import { useId } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Skeleton, SkeletonRegion, SkeletonTable, SkeletonText } from './Skeleton';

const meta = { title: 'Skeleton', component: Skeleton } satisfies Meta<typeof Skeleton>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-6">
      <Skeleton className="h-10 w-40" />
      <SkeletonText />
      <SkeletonTable />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const block = canvasElement.querySelector('.animate-pulse') as HTMLElement;
    await expect(getComputedStyle(block).animationName).toContain('pulse');
    // 1 block + 3 text lines + 15 table cells.
    await expect(canvasElement.querySelectorAll('.animate-pulse')).toHaveLength(1 + 3 + 15);
  },
};

function Box() {
  const id = useId();
  return (
    <section aria-labelledby={id} className="max-w-md rounded-lg border border-border bg-surface p-4">
      <h2 id={id} className="body-lg mb-3 text-ink">
        Incident history
      </h2>
      <SkeletonRegion className="flex flex-col gap-4">
        <SkeletonText />
        <SkeletonTable />
      </SkeletonRegion>
    </section>
  );
}

// Panel-like bordered box with a heading, proving the busy container pattern.
export const InContainer: Story = {
  render: () => <Box />,
  play: async ({ canvasElement }) => {
    const region = canvasElement.querySelector('[aria-busy="true"]') as HTMLElement;
    await expect(region).not.toBeNull();
    await expect(within(region).getByRole('status')).toHaveTextContent('Loading content');
    await expect(region.querySelectorAll('.animate-pulse')).toHaveLength(3 + 15);
  },
};
