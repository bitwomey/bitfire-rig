import type { Meta, StoryObj } from '@storybook/react-vite';
import { HazardFill } from './HazardFill';
import type { FireDangerRating } from './FireDangerBadge';

const meta = { title: 'HazardFill', component: HazardFill } satisfies Meta<typeof HazardFill>;
export default meta;
type Story = StoryObj<typeof meta>;

const RATINGS: FireDangerRating[] = ['no-rating', 'moderate', 'high', 'extreme', 'catastrophic'];

export const NoRating: Story = { args: { rating: 'no-rating', className: 'h-16 w-40' } };
export const Moderate: Story = { args: { rating: 'moderate', className: 'h-16 w-40' } };
export const High: Story = { args: { rating: 'high', className: 'h-16 w-40' } };
export const Extreme: Story = { args: { rating: 'extreme', className: 'h-16 w-40' } };
export const Catastrophic: Story = { args: { rating: 'catastrophic', className: 'h-16 w-40' } };

const Row = () => (
  <div className="flex gap-2">
    {RATINGS.map((r) => (
      <HazardFill key={r} rating={r} className="h-20 w-28" />
    ))}
  </div>
);

export const AllBands: Story = { args: { rating: 'high' }, render: () => <Row /> };

// A stand-in for a variegated basemap (terrain, water, vegetation). The real
// basemap, Cesium ion in the Plume UI, is not exercised here.
const Basemap = ({ children }: { children: React.ReactNode }) => (
  <div
    className="relative h-56 w-[36rem] overflow-hidden"
    style={{
      backgroundImage:
        'radial-gradient(circle at 20% 30%, var(--viz-2) 0 18%, transparent 19%), radial-gradient(circle at 70% 60%, var(--viz-1) 0 22%, transparent 23%), radial-gradient(circle at 45% 85%, var(--viz-3) 0 16%, transparent 17%), linear-gradient(135deg, var(--viz-4), var(--viz-5))',
    }}
  >
    {children}
  </div>
);

const Cells = () => (
  <Basemap>
    <div className="absolute inset-4 grid grid-cols-5 gap-2">
      {RATINGS.map((r) => (
        <HazardFill key={r} rating={r} className="h-full" />
      ))}
    </div>
  </Basemap>
);

export const OverBasemap: Story = { args: { rating: 'high' }, render: () => <Cells /> };

// An approximate deuteranopia simulation (a fixed colour matrix, not a
// calibrated model). It is a screenshot aid for judging legibility by eye, not
// a measurement.
export const DeuteranopiaSimulation: Story = {
  args: { rating: 'high' },
  render: () => (
    <>
      <svg width="0" height="0" aria-hidden className="absolute">
        <filter id="hazard-deuteranopia">
          <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
        </filter>
      </svg>
      <div style={{ filter: 'url(#hazard-deuteranopia)' }}>
        <Cells />
      </div>
    </>
  ),
};
