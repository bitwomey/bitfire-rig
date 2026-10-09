import { useRef, type ReactNode } from 'react';
import type { Decorator } from '@storybook/react-vite';
import { UNSAFE_PortalProvider } from 'react-aria';
import axe from 'axe-core';
import { expect, userEvent } from 'storybook/test';

// Shared by the form stories. Not a story file, so Storybook does not list it.

// In test mode each story renders once per theme container. A popover portals to
// <body>, outside both containers, so it would take no theme and axe would check it
// in one theme only. This puts each popover inside its own story's container.
// Stories with an open popover set parameters.tall to leave room for it.
function LocalPortal({ children, tall }: { children: ReactNode; tall?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className={`${tall ? 'min-h-80' : ''}`}>
      <UNSAFE_PortalProvider getContainer={() => ref.current}>{children}</UNSAFE_PortalProvider>
    </div>
  );
}
export const withLocalPortal: Decorator = (Story, { parameters }) => (
  <LocalPortal tall={parameters.tall}>
    <Story />
  </LocalPortal>
);

// One element per rendered copy of the story: two in test mode, one in the workbench.
export const instances = (canvas: HTMLElement) => {
  const themed = [...canvas.querySelectorAll<HTMLElement>('[data-theme]')];
  return themed.length ? themed : [canvas];
};

// Tab to each copy in turn (one tab stop per field) and require the ring to paint on
// the element `ringOf` picks. Focus ends on the last copy.
export async function expectFocusRing(canvas: HTMLElement, ringOf: (active: HTMLElement) => Element | null = (a) => a) {
  for (const _ of instances(canvas)) {
    await userEvent.tab();
    const ring = ringOf(document.activeElement as HTMLElement);
    await expect(ring).not.toBeNull();
    const { outlineStyle, outlineWidth } = getComputedStyle(ring!);
    await expect(outlineStyle).not.toBe('none');
    await expect(outlineWidth).not.toBe('0px');
  }
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
  for (let n: HTMLElement | null = el; n && !n.hasAttribute('data-theme'); n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
  await expect(o).toBeLessThan(1);
}

// A popover can only stay open in one copy at a time (opening the next closes the
// last), and the addon's axe run happens once, after play. So play opens each copy in
// turn, runs axe on it while open, and closes it, except the last, which stays open
// for the addon's own run.
export async function eachOpen(canvas: HTMLElement, open: (root: HTMLElement) => Promise<void>) {
  const roots = instances(canvas);
  for (const [i, root] of roots.entries()) {
    // Only one copy exists on a real page: the others go inert so axe does not flag them
    // as aria-hidden-with-focusable-content while this copy's popover hides everything else.
    for (const r of roots) r.inert = r !== root;
    await open(root);
    const { violations } = await axe.run(root, { resultTypes: ['violations'] });
    await expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    if (i < roots.length - 1) await userEvent.keyboard('{Escape}');
  }
}
