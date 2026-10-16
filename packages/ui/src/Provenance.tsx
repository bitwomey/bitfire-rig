import type { ReactNode } from 'react';

export type ProvenanceLevel = 'observed' | 'modelled' | 'inferred' | 'unverified';

export type ProvenanceProps = {
  /** Where the value came from. Anything missing or unrecognised is shown as unverified, on purpose. */
  level?: ProvenanceLevel | (string & {});
  /** The sensor, run or observer, named specifically: "ForeFire 12z", "Himawari-9". */
  source?: string;
  /** Replaces the level word. */
  children?: ReactNode;
  className?: string;
};

// Four levels, four marker shapes and four words, so the level never rests on
// colour alone. The markers are drawn in CSS: IBM Plex has no geometric-shape
// glyphs, and a font glyph would silently fall back to another font.
const LEVELS = {
  observed: { word: 'Observed', ground: '', marker: 'size-2 rounded-full bg-ink' },
  modelled: { word: 'Modelled', ground: '', marker: 'size-2 rotate-45 bg-signal' },
  inferred: { word: 'Inferred', ground: '', marker: 'size-2 rounded-full border-2 border-ink-muted' },
  // The loudest on purpose: a wash behind it, and a warning triangle.
  unverified: {
    word: 'Unverified',
    ground: 'rounded-sm bg-status-warn-wash px-2 py-0.5',
    marker: 'size-2.5 bg-status-warn [clip-path:polygon(50%_0,100%_100%,0_100%)]',
  },
} as const;

const isLevel = (l: unknown): l is ProvenanceLevel => typeof l === 'string' && Object.hasOwn(LEVELS, l);

export function Provenance({ level, source, children, className }: ProvenanceProps) {
  const key: ProvenanceLevel = isLevel(level) ? level : 'unverified';
  const spec = LEVELS[key];
  return (
    <span
      data-level={key}
      className={`${className ?? ''} caption inline-flex items-center gap-1.5 ${key === 'inferred' ? 'text-ink-muted' : 'text-ink'} ${spec.ground}`}
    >
      <span aria-hidden className={`inline-block shrink-0 ${spec.marker}`} />
      <span>{children ?? spec.word}</span>
      {source && (
        <>
          <span aria-hidden className="text-ink-muted">
            ·
          </span>
          <span className="text-ink-muted">{source}</span>
        </>
      )}
    </span>
  );
}
