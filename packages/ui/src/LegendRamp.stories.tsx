import type { Meta, StoryObj } from '@storybook/react-vite';
import { LegendRamp } from './LegendRamp';

const meta = { title: 'LegendRamp', component: LegendRamp } satisfies Meta<typeof LegendRamp>;
export default meta;
type Story = StoryObj<typeof meta>;

const SEV_SWATCHES = [
  { token: 'sev-0', label: 'Very Low' },
  { token: 'sev-1', label: 'Low' },
  { token: 'sev-2', label: 'Moderate' },
  { token: 'sev-3', label: 'High' },
  { token: 'sev-4', label: 'Extreme' },
];

const STATUS_SWATCHES = [
  { token: 'status-ok', label: 'Nominal' },
  { token: 'status-warn', label: 'Caution' },
  { token: 'status-danger', label: 'Failure' },
];

export const Severity: Story = {
  args: { swatches: SEV_SWATCHES },
};

export const StatusVertical: Story = {
  args: { swatches: STATUS_SWATCHES },
};

export const SeverityHorizontal: Story = {
  args: { swatches: SEV_SWATCHES, orientation: 'horizontal' },
};

export const RawColors: Story = {
  args: {
    swatches: [
      { color: '#ff0000', label: 'Red (raw)' },
      { color: '#00ff00', label: 'Green (raw)' },
      { color: '#0000ff', label: 'Blue (raw)' },
    ],
  },
};
