/* @bitfire/ui — components are authored source, not generated. */
import { v, tokenNames } from '@bitfire/tokens';

export type StatusTone = 'ok' | 'warn' | 'danger' | 'info';

// StatusBadge carries two channels: tone is the state, the dot's fill is
// whether resources are actively suppressing.
const TONES: readonly string[] = ['ok', 'warn', 'danger', 'info'];

export function statusBadgeStyle(tone: StatusTone = 'ok', suppressing = true) {
  if (!TONES.includes(tone)) throw new Error(`unknown tone "${tone}"`);
  const colour = v(`status-${tone === 'info' ? 'ok' : tone}`);
  return {
    color: v('ink'),
    background: v('surface-raised'),
    borderColor: v('border-hairline'),
    dotFill: suppressing ? colour : 'transparent',
    dotStroke: colour,
  };
}

// Proves the dependency is load-bearing: this fails if tokens drops a name.
export function assertRequiredTokens(): number {
  const need = ['ink', 'surface-raised', 'border-hairline',
                'status-ok', 'status-warn', 'status-danger'];
  const missing = need.filter((n) => !(tokenNames as readonly string[]).includes(n));
  if (missing.length) throw new Error(`@bitfire/ui requires tokens not present: ${missing.join(', ')}`);
  return need.length;
}

export const requiredTokens = 6;
