import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

// Simple inline icon; the component takes any ReactNode, no icon library is added.
const Inbox = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 13h5l1.5 3h5L16 13h5" />
    <path d="M5.5 5h13L21 13v6H3v-6z" />
  </svg>
);

const meta = {
  title: 'EmptyState',
  component: EmptyState,
  args: {
    icon: Inbox,
    heading: 'No incidents yet',
    description: 'Incidents you are watching will appear here once one is reported in your area.',
  },
} satisfies Meta<typeof EmptyState>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('heading', { level: 2, name: 'No incidents yet' })[0]).toBeVisible();
    await expect(canvasElement.querySelector('[aria-live],[role="status"],[role="alert"]')).toBeNull();
  },
};

export const WithAction: Story = {
  args: { action: <Button>Add a watch area</Button>, headingLevel: 3 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('heading', { level: 3 })[0]).toBeVisible();
    await expect(within(canvasElement).getAllByRole('button', { name: 'Add a watch area' })[0]).toBeVisible();
  },
};

export const Compact: Story = {
  args: { compact: true, heading: 'Nothing to show', description: 'No rows match the current filter.' },
};
