import type { ReactNode } from 'react';

export type MetricTileSize = 'md' | 'xl';
export type DeltaDirection = 'up' | 'down';

export type MetricTileProps = {
  label: string;
  value: ReactNode;
  unit?: string;
  delta?: ReactNode;
  deltaDirection?: DeltaDirection;
  size?: MetricTileSize;
  flat?: boolean;
  provenance?: ReactNode;
  asOf?: string;
  className?: string;
};

const DELTA_COLOR: Record<DeltaDirection, string> = {
  up: 'text-status-danger',
  down: 'text-status-ok',
};

// CSS clip-path triangles — IBM Plex has no geometric-shape glyphs.
const DELTA_ARROW: Record<DeltaDirection, string> = {
  up: 'size-2 bg-status-danger [clip-path:polygon(50%_0%,100%_100%,0%_100%)]',
  down: 'size-2 bg-status-ok [clip-path:polygon(0%_0%,100%_0%,50%_100%)]',
};

const DELTA_LABEL: Record<DeltaDirection, string> = {
  up: 'Rising',
  down: 'Falling',
};

export function MetricTile({
  label,
  value,
  unit,
  delta,
  deltaDirection,
  size = 'md',
  flat = false,
  provenance,
  asOf,
  className,
}: MetricTileProps) {
  if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV && !provenance) {
    console.error('MetricTile: no provenance supplied. Add <Provenance> whenever the value is not directly observed.');
  }

  const card = flat ? '' : 'rounded-md bg-surface-raised p-4';
  const valueClass = size === 'xl' ? 'readout-xl' : 'readout';

  return (
    <div className={`${className ?? ''} ${card} flex flex-col gap-1`.trim()}>
      <p className="label text-ink-muted">{label}</p>

      <div className="flex items-baseline gap-1.5">
        <span className={valueClass}>{value}</span>
        {unit && <span className="body text-ink-muted">{unit}</span>}
      </div>

      {(delta !== undefined || deltaDirection !== undefined) && (
        <div className={`mono-sm flex items-center gap-1 ${deltaDirection ? DELTA_COLOR[deltaDirection] : 'text-ink'}`}>
          {deltaDirection && (
            <>
              <span className="sr-only">{DELTA_LABEL[deltaDirection]}:</span>
              <span aria-hidden className={`inline-block shrink-0 ${DELTA_ARROW[deltaDirection]}`} />
            </>
          )}
          <span>{delta}</span>
        </div>
      )}

      {(provenance || asOf) && (
        <div className="mt-1 flex items-center gap-3">
          {provenance}
          {asOf && <span className="caption text-ink-muted">{asOf}</span>}
        </div>
      )}
    </div>
  );
}
