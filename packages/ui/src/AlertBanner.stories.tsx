import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AlertBanner } from './AlertBanner';

const meta = { title: 'AlertBanner', component: AlertBanner } satisfies Meta<typeof AlertBanner>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Ok: Story = {
  args: { tone: 'ok', title: 'Feeds nominal', children: 'All data sources are current and within expected ranges.' },
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('[role="status"]') as HTMLElement;
    await expect(el).toBeInTheDocument();
  },
};

export const Warn: Story = {
  args: { tone: 'warn', glyph: '⚠', title: 'Fuel layer ageing', children: 'The SFMS layer is 4 hours old. Readings may not reflect current conditions.' },
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('[role="status"]') as HTMLElement;
    await expect(el).toBeInTheDocument();
  },
};

export const Danger: Story = {
  args: { tone: 'danger', glyph: '🔥', title: 'Total fire ban', children: 'All open fires are prohibited. Check local declarations before commencing work.' },
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('[role="alert"]') as HTMLElement;
    await expect(el).toBeInTheDocument();
    await expect(within(el).queryByRole('button', { name: 'Dismiss' })).toBeNull();
  },
};

export const Info: Story = {
  args: { tone: 'info', glyph: 'ℹ', title: 'Maintenance window', children: 'Weather data will be unavailable from 02:00–04:00 AEST tonight.' },
  play: async ({ canvasElement }) => {
    // info: no live-region role
    await expect(canvasElement.querySelector('[role="alert"]')).toBeNull();
    await expect(canvasElement.querySelector('[role="status"]')).toBeNull();
  },
};

export const Dismissible: Story = {
  args: { tone: 'warn', glyph: '⚠', title: 'Stale weather', children: 'Bureau data is 2 hours old.', onDismiss: () => undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  },
};

export const DismissDangerous: Story = {
  name: 'Danger — no dismiss (safety-critical)',
  args: { tone: 'danger', glyph: '🔥', title: 'Evacuation order', children: 'Leave immediately. Do not return until the all-clear is issued.' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('button')).toBeNull();
  },
};

export const DismissInteraction: Story = {
  name: 'Dismiss interaction',
  render: () => {
    const [visible, setVisible] = useState(true);
    return visible ? (
      <AlertBanner tone="warn" title="Stale data" onDismiss={() => setVisible(false)}>
        Fuel layer is 3 hours old.
      </AlertBanner>
    ) : (
      <p data-testid="dismissed">Banner dismissed</p>
    );
  },
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button', { name: 'Dismiss' });
    await userEvent.click(btn);
    await expect(within(canvasElement).getByTestId('dismissed')).toBeInTheDocument();
  },
};

export const TitleOnly: Story = {
  args: { tone: 'ok', title: 'System restored.' },
};

export const AllTones: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <AlertBanner tone="ok" title="Nominal" glyph="✓">All feeds current.</AlertBanner>
      <AlertBanner tone="warn" title="Caution" glyph="⚠">Fuel layer ageing.</AlertBanner>
      <AlertBanner tone="danger" title="Critical" glyph="🔥">Total fire ban active.</AlertBanner>
      <AlertBanner tone="info" title="Notice" glyph="ℹ">Maintenance tonight.</AlertBanner>
    </div>
  ),
};
