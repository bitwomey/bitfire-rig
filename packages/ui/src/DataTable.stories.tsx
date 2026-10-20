import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DataTable } from './DataTable';

const meta = { title: 'DataTable', component: DataTable } satisfies Meta<typeof DataTable>;
export default meta;

type Story = StoryObj<typeof meta>;

const FIRE_COLS = [
  { key: 'location', label: 'Location' },
  { key: 'ffdi', label: 'FFDI', numeric: true },
  { key: 'rh', label: 'RH %', numeric: true },
  { key: 'wind', label: 'Wind km/h', numeric: true },
  { key: 'status', label: 'Status' },
];

const FIRE_ROWS = [
  { location: 'Toodyay', ffdi: '112', rh: '8', wind: '54', status: 'Extreme' },
  { location: 'Chittering', ffdi: '88', rh: '11', wind: '42', status: 'Very High' },
  { location: 'Northam', ffdi: '74', rh: '14', wind: '38', status: 'Very High' },
  { location: 'York', ffdi: '61', rh: '18', wind: '31', status: 'High' },
  { location: 'Beverley', ffdi: '55', rh: '22', wind: '28', status: 'High' },
];

export const Basic: Story = {
  args: {
    caption: 'Fire danger by location',
    columns: FIRE_COLS,
    rows: FIRE_ROWS,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Toodyay')).toBeInTheDocument();
    await expect(within(canvasElement).getByText('FFDI')).toBeInTheDocument();
  },
};

export const Zebra: Story = {
  args: {
    caption: 'Fire danger by location (zebra)',
    columns: FIRE_COLS,
    rows: FIRE_ROWS,
    zebra: true,
  },
};

export const SelectedRow: Story = {
  args: {
    caption: 'Fire danger by location — Chittering selected',
    columns: FIRE_COLS,
    rows: FIRE_ROWS,
    selectedIndex: 1,
  },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('[aria-selected="true"]');
    await expect(row).toBeInTheDocument();
  },
};

export const WithMaxHeight: Story = {
  args: {
    caption: 'Scrollable fire danger table',
    columns: FIRE_COLS,
    rows: [
      ...FIRE_ROWS,
      { location: 'Merredin', ffdi: '49', rh: '26', wind: '24', status: 'High' },
      { location: 'Kellerberrin', ffdi: '44', rh: '29', wind: '21', status: 'Very High' },
      { location: 'Cunderdin', ffdi: '38', rh: '33', wind: '19', status: 'High' },
    ],
    maxHeight: 200,
    zebra: true,
  },
};

// Demonstrates React node cells (StatusBadge / FireDangerBadge will slot in here post-merge).
export const NodeCells: Story = {
  args: {
    caption: 'Active incidents with severity badges',
    columns: [
      { key: 'incident', label: 'Incident' },
      { key: 'severity', label: 'Severity' },
      { key: 'ha', label: 'Ha', numeric: true },
    ],
    rows: [
      {
        incident: 'Muchea',
        severity: <span className="caption inline-flex items-center gap-1 rounded-sm bg-status-danger-wash px-2 py-0.5 text-ink">Extreme</span>,
        ha: '2,400',
      },
      {
        incident: 'Gingin Brook',
        severity: <span className="caption inline-flex items-center gap-1 rounded-sm bg-status-warn-wash px-2 py-0.5 text-ink">Very High</span>,
        ha: '640',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Muchea')).toBeInTheDocument();
  },
};

export const ManyColumns: Story = {
  args: {
    caption: 'Full weather observations',
    columns: [
      { key: 'stn', label: 'Station' },
      { key: 'temp', label: 'Temp °C', numeric: true },
      { key: 'rh', label: 'RH %', numeric: true },
      { key: 'dp', label: 'Dew Pt', numeric: true },
      { key: 'wind_spd', label: 'Wind km/h', numeric: true },
      { key: 'wind_dir', label: 'Dir' },
      { key: 'ffdi', label: 'FFDI', numeric: true },
      { key: 'gfdi', label: 'GFDI', numeric: true },
    ],
    rows: [
      { stn: 'Toodyay', temp: '42', rh: '8', dp: '−4', wind_spd: '54', wind_dir: 'NNE', ffdi: '112', gfdi: '98' },
      { stn: 'Chittering', temp: '39', rh: '11', dp: '−2', wind_spd: '42', wind_dir: 'NE', ffdi: '88', gfdi: '76' },
    ],
    zebra: true,
  },
};
