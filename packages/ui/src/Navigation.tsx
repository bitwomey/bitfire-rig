import { Breadcrumb, Breadcrumbs as RACBreadcrumbs, Link as RACLink, composeRenderProps, type BreadcrumbsProps, type LinkProps } from 'react-aria-components';

const focusRing =
  'outline-none data-[focus-visible]:outline-solid data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus-ring';

export function Link(props: LinkProps) {
  return (
    <RACLink
      {...props}
      className={composeRenderProps(
        props.className,
        (c) =>
          `${c ?? ''} body-sm cursor-pointer rounded-sm text-signal underline underline-offset-2 data-[hovered]:text-signal-hover data-[hovered]:decoration-2 data-[current]:cursor-default data-[current]:text-ink data-[current]:no-underline ${focusRing} data-[disabled]:opacity-(--opacity-disabled) data-[disabled]:cursor-not-allowed`,
      )}
    />
  );
}

export type Crumb = { label: string; href?: string };

// The last crumb is the current page: plain text with aria-current, not a link.
export function Breadcrumbs({ items, ...props }: Omit<BreadcrumbsProps<object>, 'children' | 'items'> & { items: Crumb[] }) {
  return (
    <RACBreadcrumbs {...props} className="flex items-center gap-2">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <Breadcrumb key={c.label} id={c.label} className="flex items-center gap-2">
            {last ? <span aria-current="page" className="body-sm text-ink">{c.label}</span> : <Link href={c.href}>{c.label}</Link>}
            {!last && <span aria-hidden className="body-sm text-ink-subtle">/</span>}
          </Breadcrumb>
        );
      })}
    </RACBreadcrumbs>
  );
}

export type NavItem = { label: string; href: string; current?: boolean };

export function Nav({ label, items, orientation = 'horizontal' }: { label: string; items: NavItem[]; orientation?: 'horizontal' | 'stacked' }) {
  return (
    <nav aria-label={label}>
      <ul className={`flex ${orientation === 'stacked' ? 'flex-col gap-2' : 'flex-row gap-4'}`}>
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} aria-current={i.current ? 'page' : undefined}>{i.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
