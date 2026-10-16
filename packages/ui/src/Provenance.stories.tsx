import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Provenance } from './Provenance';

const meta = { title: 'Provenance', component: Provenance } satisfies Meta<typeof Provenance>;
export default meta;

type Story = StoryObj<typeof meta>;

const level = (canvasElement: HTMLElement) => canvasElement.querySelector('[data-level]') as HTMLElement;

export const Observed: Story = {
  args: { level: 'observed', source: 'Sentinel-2' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Observed')).toBeInTheDocument();
    await expect(within(canvasElement).getByText('Sentinel-2')).toBeInTheDocument();
  },
};

export const Modelled: Story = { args: { level: 'modelled', source: 'ForeFire 12z' } };

export const Inferred: Story = { args: { level: 'inferred' } };

export const Unverified: Story = { args: { level: 'unverified', source: 'no field check' } };

// A missing level must read as unverified: never as a quieter, more trusted level.
export const MissingLevel: Story = {
  args: { source: 'AOB visual' },
  play: async ({ canvasElement }) => {
    await expect(level(canvasElement).dataset.level).toBe('unverified');
    await expect(within(canvasElement).getByText('Unverified')).toBeInTheDocument();
  },
};

export const UnrecognisedLevel: Story = {
  args: { level: 'confirmed' },
  play: async ({ canvasElement }) => {
    await expect(level(canvasElement).dataset.level).toBe('unverified');
    await expect(within(canvasElement).queryByText('confirmed')).toBeNull();
  },
};

export const CustomWord: Story = { args: { level: 'modelled', source: 'ForeFire 12z', children: 'Simulated' } };

// Side by side, the way a reader meets them: four shapes, four words.
export const AllLevels: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <Provenance level="observed" source="Sentinel-2" />
      <Provenance level="modelled" source="ForeFire 12z" />
      <Provenance level="inferred" />
      <Provenance level="unverified" source="no field check" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const levels = [...canvasElement.querySelectorAll<HTMLElement>('[data-level]')].map((e) => e.dataset.level);
    await expect(levels).toEqual(['observed', 'modelled', 'inferred', 'unverified']);
  },
};
