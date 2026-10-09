import { Tab as RACTab, TabList as RACTabList, TabPanel as RACTabPanel, Tabs as RACTabs, composeRenderProps, type TabProps, type TabsProps, type TabListProps, type TabPanelProps } from 'react-aria-components';

const focusRing =
  'outline-none data-[focus-visible]:outline-solid data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus-ring';

export function Tabs(props: TabsProps) {
  return <RACTabs {...props} className={composeRenderProps(props.className, (c) => `${c ?? ''} flex flex-col gap-4`)} />;
}

export function TabList<T extends object>(props: TabListProps<T>) {
  return <RACTabList {...props} className={composeRenderProps(props.className, (c) => `${c ?? ''} flex gap-4 border-b border-border-hairline`)} />;
}

// The selected tab carries a stroke-mark (2px) underline in the signal token plus
// full-strength ink, so selection is not conveyed by colour alone.
export function Tab(props: TabProps) {
  return (
    <RACTab
      {...props}
      className={composeRenderProps(
        props.className,
        (c) =>
          `${c ?? ''} tab -mb-px cursor-default border-b-2 border-transparent px-1 py-2 text-ink-muted data-[hovered]:text-ink data-[selected]:border-signal data-[selected]:text-ink ${focusRing} data-[disabled]:opacity-(--opacity-disabled) data-[disabled]:cursor-not-allowed`,
      )}
    />
  );
}

export function TabPanel(props: TabPanelProps) {
  return <RACTabPanel {...props} className={composeRenderProps(props.className, (c) => `${c ?? ''} body text-ink ${focusRing}`)} />;
}
