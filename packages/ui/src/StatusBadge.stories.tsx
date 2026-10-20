import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { StatusBadge } from './StatusBadge';

const meta = { title: 'StatusBadge', component: StatusBadge } satisfies Meta<typeof StatusBadge>;
export default meta;

type Story = StoryObj<typeof meta>;

const tone = (canvasElement: HTMLElement) => canvasElement.querySelector('[data-tone]') as HTMLElement;

export const Ok: Story = {
  args: { tone: 'ok' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Nominal')).toBeInTheDocument();
    await expect(tone(canvasElement).dataset.tone).toBe('ok');
  },
};

export const Warn: Story = {
  args: { tone: 'warn' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Caution')).toBeInTheDocument();
  },
};

export const Danger: Story = {
  args: { tone: 'danger' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Critical')).toBeInTheDocument();
  },
};

export const Info: Story = {
  args: { tone: 'info' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Notice')).toBeInTheDocument();
    await expect(tone(canvasElement).dataset.tone).toBe('info');
  },
};

// Two-channel distinction: danger suppressing=false is under assessment
// (crews on scene sizing it up), suppressing=true is going (actively fighting).
export const UnderAssessment: Story = {
  args: { tone: 'danger', suppressing: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Critical')).toBeInTheDocument();
  },
};

export const CustomWord: Story = {
  args: { tone: 'warn', children: 'Escalating' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Escalating')).toBeInTheDocument();
  },
};

export const Bare: Story = {
  args: { tone: 'danger', bare: true },
};

// Side by side: four tones, filled. The word is always present.
export const AllTones: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <StatusBadge tone="ok" />
      <StatusBadge tone="warn" />
      <StatusBadge tone="danger" />
      <StatusBadge tone="info" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tones = [...canvasElement.querySelectorAll<HTMLElement>('[data-tone]')].map(e => e.dataset.tone);
    await expect(tones).toEqual(['ok', 'warn', 'danger', 'info']);
  },
};

// Filled (suppressing) vs hollow (under assessment) for the same severity.
export const FilledVsHollow: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <StatusBadge tone="danger">Going</StatusBadge>
      <StatusBadge tone="danger" suppressing={false}>Under assessment</StatusBadge>
    </div>
  ),
};
