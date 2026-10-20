import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Provenance } from './Provenance';
import { MetricTile } from './MetricTile';

const meta = { title: 'MetricTile', component: MetricTile } satisfies Meta<typeof MetricTile>;
export default meta;

type Story = StoryObj<typeof meta>;

const obs = <Provenance level="observed" />;
const model = <Provenance level="modelled" source="ForeFire 12z" />;

export const Basic: Story = {
  args: { label: 'FFDI', value: '74', unit: '', provenance: obs },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('FFDI')).toBeInTheDocument();
    await expect(within(canvasElement).getByText('74')).toBeInTheDocument();
  },
};

export const WithUnit: Story = {
  args: { label: 'Wind speed', value: '42', unit: 'km/h', provenance: obs },
};

export const RisingDelta: Story = {
  args: {
    label: 'FFDI',
    value: '74',
    deltaDirection: 'up',
    delta: '+12 from 12z',
    provenance: obs,
  },
  play: async ({ canvasElement }) => {
    // Rising direction must have a text label — colour is not the only carrier.
    await expect(within(canvasElement).getByText('Rising:')).toBeInTheDocument();
    await expect(within(canvasElement).getByText('+12 from 12z')).toBeInTheDocument();
  },
};

export const FallingDelta: Story = {
  args: {
    label: 'Wind speed',
    value: '32',
    unit: 'km/h',
    deltaDirection: 'down',
    delta: '−10 km/h',
    provenance: obs,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Falling:')).toBeInTheDocument();
  },
};

export const SizeXl: Story = {
  args: { label: 'Fire Danger Index', value: '112', unit: 'FFDI', size: 'xl', provenance: obs },
};

export const SizeMd: Story = {
  args: { label: 'Humidity', value: '18', unit: '%', size: 'md', provenance: obs },
};

export const Flat: Story = {
  args: { label: 'Temperature', value: '38', unit: '°C', flat: true, provenance: obs },
};

export const WithModelledProvenance: Story = {
  args: {
    label: 'Spotting distance',
    value: '3.4',
    unit: 'km',
    provenance: model,
    asOf: '14:30 AEST',
  },
};

export const WithAsOf: Story = {
  args: {
    label: 'FFDI',
    value: '88',
    provenance: <Provenance level="observed" source="BoM AWS" />,
    asOf: '15:00 AEST',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('15:00 AEST')).toBeInTheDocument();
  },
};

export const AllProps: Story = {
  args: {
    label: 'Rate of Spread',
    value: '1,200',
    unit: 'm/h',
    deltaDirection: 'up',
    delta: '+400 m/h',
    size: 'xl',
    provenance: model,
    asOf: '13:00 AEST',
  },
};
