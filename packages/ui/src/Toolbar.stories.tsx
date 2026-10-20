import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toolbar, ToolbarSpacer } from './Toolbar';
import { IconButton } from './IconButton';

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
    <line x1="3" y1="5" x2="17" y2="5" />
    <line x1="5" y1="10" x2="15" y2="10" />
    <line x1="7" y1="15" x2="13" y2="15" />
  </svg>
);

const meta = { title: 'Toolbar', component: Toolbar } satisfies Meta<typeof Toolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Docked: Story = {
  args: { label: 'Map controls', variant: 'docked' },
  render: (args) => (
    <div style={{ width: 400 }}>
      <Toolbar {...args}>
        <IconButton label="Search" glyph={<SearchIcon />} />
        <IconButton label="Toggle layers" glyph={<LayersIcon />} />
        <ToolbarSpacer />
        <IconButton label="Filter" glyph={<FilterIcon />} bordered />
      </Toolbar>
    </div>
  ),
};

export const Overlay: Story = {
  args: { label: 'Floating map controls', variant: 'overlay' },
  render: (args) => (
    <div style={{ padding: 32 }}>
      <Toolbar {...args}>
        <IconButton label="Search" glyph={<SearchIcon />} />
        <IconButton label="Toggle layers" glyph={<LayersIcon />} on />
        <IconButton label="Filter" glyph={<FilterIcon />} />
      </Toolbar>
    </div>
  ),
};
