import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent } from 'storybook/test';
import { IconButton } from './IconButton';

// Inline SVG stand-ins — consumers will pass Phosphor (or any icon set) elements directly.
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <circle cx="9" cy="9" r="5.5" />
    <line x1="13.5" y1="13.5" x2="17" y2="17" />
  </svg>
);

const LayersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <polygon points="10,3 17,7 10,11 3,7" />
    <polyline points="3,11 10,15 17,11" />
  </svg>
);

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <line x1="3" y1="5" x2="17" y2="5" /><line x1="5" y1="10" x2="15" y2="10" /><line x1="7" y1="15" x2="13" y2="15" />
  </svg>
);

const meta = { title: 'IconButton', component: IconButton } satisfies Meta<typeof IconButton>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Search', glyph: <SearchIcon /> },
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button', { name: 'Search' });
    await expect(btn).toBeInTheDocument();
    await expect(btn).not.toHaveAttribute('aria-pressed', 'true');
  },
};

export const Bordered: Story = {
  args: { label: 'Search', glyph: <SearchIcon />, bordered: true },
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button', { name: 'Search' });
    await expect(btn).toBeInTheDocument();
  },
};

export const On: Story = {
  args: { label: 'Toggle layers', glyph: <LayersIcon />, on: true },
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button', { name: 'Toggle layers' });
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
  },
};

export const Off: Story = {
  args: { label: 'Toggle layers', glyph: <LayersIcon />, on: false },
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button', { name: 'Toggle layers' });
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
  },
};

export const Disabled: Story = {
  args: { label: 'Filter', glyph: <FilterIcon />, disabled: true },
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button', { name: 'Filter' });
    await expect(btn).toBeDisabled();
  },
};

export const BorderedOn: Story = {
  args: { label: 'Toggle layers', glyph: <LayersIcon />, bordered: true, on: true },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 16 }}>
      <IconButton label="Search" glyph={<SearchIcon />} />
      <IconButton label="Search bordered" glyph={<SearchIcon />} bordered />
      <IconButton label="Layers on" glyph={<LayersIcon />} on />
      <IconButton label="Layers off" glyph={<LayersIcon />} on={false} bordered />
      <IconButton label="Filter disabled" glyph={<FilterIcon />} disabled />
    </div>
  ),
};
