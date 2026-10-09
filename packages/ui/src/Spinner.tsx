export type SpinnerProps = {
  size?: 'sm' | 'md';
  /** Accessible name, announced as a status. */
  label?: string;
  className?: string;
};

const sizes = { sm: 'size-4', md: 'size-6' };

// Under prefers-reduced-motion the spin stops but the ring stays visible.
export function Spinner({ size = 'md', label = 'Loading', className }: SpinnerProps) {
  return (
    <span role="status" className={`${className ?? ''} inline-flex`}>
      <span
        aria-hidden
        className={`${sizes[size]} inline-block animate-spin rounded-full border-2 border-ink-subtle border-t-signal motion-reduce:animate-none`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
