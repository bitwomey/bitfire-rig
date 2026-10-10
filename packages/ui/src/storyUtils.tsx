import { expect, userEvent } from 'storybook/test';

// Assertion helpers shared by the form stories. Not a story file, so Storybook does not list it.

// Tab to the field (one tab stop) and require the ring to paint on the element
// `ringOf` picks: attributes alone do not prove the ring is visible.
export async function expectFocusRing(ringOf: (active: HTMLElement) => Element | null = (a) => a) {
  await userEvent.tab();
  const ring = ringOf(document.activeElement as HTMLElement);
  await expect(ring).not.toBeNull();
  const { outlineStyle, outlineWidth } = getComputedStyle(ring!);
  await expect(outlineStyle).not.toBe('none');
  await expect(outlineWidth).not.toBe('0px');
}
export const indicatorOf = (active: HTMLElement) => active.closest('label')!.querySelector('[data-indicator]');

// Invalid must look different without relying on the message: its border is a different
// colour from the default border token, and wider.
export async function expectInvalidBorder(el: HTMLElement) {
  const probe = document.createElement('div');
  probe.style.cssText = 'border:1px solid var(--color-border);position:absolute;visibility:hidden';
  el.parentElement!.appendChild(probe);
  const normal = getComputedStyle(probe).borderTopColor;
  probe.remove();
  const s = getComputedStyle(el);
  await expect(s.borderTopColor).not.toBe(normal);
  await expect(s.borderTopWidth).toBe('2px');
}

// Effective opacity of the control, including any dimmed ancestor.
export async function expectDimmed(el: HTMLElement) {
  let o = 1;
  for (let n: HTMLElement | null = el; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
  await expect(o).toBeLessThan(1);
}
