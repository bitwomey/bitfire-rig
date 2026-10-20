import type { Meta, StoryObj } from '@storybook/react-vite';
import { Panel } from './Panel';

const meta = { title: 'Panel', component: Panel } satisfies Meta<typeof Panel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Weather Overview',
    children: <p className="body text-ink">Panel body content goes here.</p>,
  },
};

export const WithEyebrowAndActions: Story = {
  args: {
    eyebrow: 'Live',
    title: 'Fire Weather',
    actions: <button className="caption text-signal">Refresh</button>,
    children: <p className="body text-ink">Content area.</p>,
  },
};

export const WithFooter: Story = {
  args: {
    title: 'Metrics',
    children: <p className="body text-ink">Body.</p>,
    footer: 'Source: Bureau of Meteorology · Updated 2 min ago',
  },
};

export const Flush: Story = {
  args: {
    title: 'Flush Panel',
    flush: true,
    children: <p className="body text-ink">No radius or shadow.</p>,
  },
};

export const BodyFlush: Story = {
  args: {
    title: 'Table Panel',
    bodyFlush: true,
    children: (
      <table className="w-full">
        <tbody>
          <tr className="border-b border-hairline">
            <td className="px-4 py-2 caption text-ink">Row 1</td>
            <td className="px-4 py-2 caption text-ink-muted">Value</td>
          </tr>
          <tr>
            <td className="px-4 py-2 caption text-ink">Row 2</td>
            <td className="px-4 py-2 caption text-ink-muted">Value</td>
          </tr>
        </tbody>
      </table>
    ),
  },
};
