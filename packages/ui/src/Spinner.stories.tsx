import { useId } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Spinner, type SpinnerProps } from './Spinner';

const meta = { title: 'Spinner', component: Spinner } satisfies Meta<typeof Spinner>;
export default meta;

type Story = StoryObj<typeof meta>;

// role="status" takes its name from content, so find it by text rather than by accessible name.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const label = within(canvasElement).getAllByText('Loading')[0];
    const status = label.closest('[role="status"]') as HTMLElement;
    await expect(status).toBeInTheDocument();
    const ring = status.firstElementChild as HTMLElement;
    await expect(getComputedStyle(ring).animationName).toContain('spin');
  },
};

export const Small: Story = { args: { size: 'sm', label: 'Saving' } };

// Panel-like bordered box with a heading, proving the busy container pattern.
function Box(props: SpinnerProps) {
  const id = useId();
  return (
    <section aria-busy="true" aria-labelledby={id} className="max-w-sm rounded-lg border border-border bg-surface p-4">
      <h2 id={id} className="body-lg mb-3 text-ink">
        Fire weather
      </h2>
      <div className="flex items-center gap-2 text-ink-muted">
        <Spinner {...props} />
        <span className="body-sm" aria-hidden>
          Fetching latest readings
        </span>
      </div>
    </section>
  );
}

export const InContainer: Story = {
  render: (args) => <Box {...args} />,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[aria-busy="true"]')).not.toBeNull();
  },
};
