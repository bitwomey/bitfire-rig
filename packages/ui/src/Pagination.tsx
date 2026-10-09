import { Button } from './Button';

export type PaginationProps = {
  /** Current page, 1-based. */
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  className?: string;
};

// First, last, current and its neighbours; a gap of one page shows that page
// rather than an ellipsis that would hide nothing more than it replaces.
function items(page: number, count: number): (number | 'gap')[] {
  const keep = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count));
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev === 2) out.push(prev + 1);
    else if (prev !== undefined && p - prev > 2) out.push('gap');
    out.push(p);
  });
  return out;
}

export function Pagination({ page, pageCount, onChange, className }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className={className}>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          <Button variant="secondary" isDisabled={page <= 1} onPress={() => onChange(page - 1)}>
            Previous
          </Button>
        </li>
        {items(page, pageCount).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} aria-hidden className="mono px-2 text-ink-muted">
              …
            </li>
          ) : (
            <li key={p}>
              {/* Current page: filled, underlined and aria-current, so colour is not the only cue.
                  `mono` is declared after `body-sm` in tokens.css, so it wins on the shared element. */}
              <Button
                variant={p === page ? 'primary' : 'secondary'}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
                onPress={() => onChange(p)}
                className={`mono min-w-10 px-2! ${p === page ? 'underline decoration-2 underline-offset-4' : ''}`}
              >
                {p}
              </Button>
            </li>
          ),
        )}
        <li>
          <Button variant="secondary" isDisabled={page >= pageCount} onPress={() => onChange(page + 1)}>
            Next
          </Button>
        </li>
      </ul>
    </nav>
  );
}
