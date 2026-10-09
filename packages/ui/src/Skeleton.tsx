import type { ReactNode } from 'react';

// Shimmer: surface-inset fill with a surface-hover edge, pulsing. Stops under reduced motion.
const shape = 'animate-pulse rounded-sm border border-surface-hover bg-surface-inset motion-reduce:animate-none';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={`${shape} ${className ?? ''}`} />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={`${className ?? ''} flex flex-col gap-2`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 3, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div aria-hidden className={`${className ?? ''} flex flex-col gap-3`}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} className="h-5" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Wraps skeletons: marks the region busy and gives assistive tech one status message. */
export function SkeletonRegion({ children, label = 'Loading content', className }: { children: ReactNode; label?: string; className?: string }) {
  return (
    <div aria-busy="true" className={className}>
      <span role="status" className="sr-only">
        {label}
      </span>
      {children}
    </div>
  );
}
