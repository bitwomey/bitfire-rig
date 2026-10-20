import type { CSSProperties, ReactNode } from 'react';
import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';

export type DataTableColumn = {
  key: string;
  label: string;
  numeric?: boolean;
  width?: string | number;
};

export type DataTableRow = Record<string, ReactNode>;

export type DataTableProps = {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  zebra?: boolean;
  selectedIndex?: number;
  maxHeight?: string | number;
  caption: string;
  className?: string;
};

const headerCell =
  'sticky top-0 z-alert bg-surface-raised px-3 py-2 label text-left text-ink-muted border-b border-border-hairline whitespace-nowrap select-none outline-none';

const bodyCell = 'px-3 py-2 body-sm text-ink border-b border-border-hairline';

export function DataTable({
  columns,
  rows,
  zebra = false,
  selectedIndex,
  maxHeight,
  caption,
  className,
}: DataTableProps) {
  if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV && !caption) {
    console.error('DataTable: caption is required for accessibility. Provide a descriptive caption.');
  }

  const wrapStyle: CSSProperties = maxHeight
    ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight, overflowY: 'auto' }
    : {};

  return (
    <div className={`${className ?? ''} w-full overflow-x-auto`.trim()} style={wrapStyle}>
      <Table
        aria-label={caption}
        selectionMode={selectedIndex !== undefined ? 'single' : 'none'}
        selectedKeys={selectedIndex !== undefined ? new Set([String(selectedIndex)]) : undefined}
        onSelectionChange={() => {}}
        className="w-full border-separate border-spacing-0"
      >
        <TableHeader>
          {columns.map((col) => (
            <Column
              key={col.key}
              isRowHeader={col.key === columns[0]?.key}
              style={{ width: col.width }}
              className={`${headerCell}${col.numeric ? ' text-right' : ''}`}
            >
              {col.label}
            </Column>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => {
            const isSelected = i === selectedIndex;
            const isZebraOdd = zebra && i % 2 === 1;
            const rowClass = [
              'outline-none',
              isSelected ? 'bg-signal/10' : isZebraOdd ? 'bg-surface' : '',
              'data-[focus-visible]:outline-2 data-[focus-visible]:outline-solid data-[focus-visible]:outline-offset-[-2px] data-[focus-visible]:outline-focus-ring',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <Row
                key={i}
                id={String(i)}
                className={rowClass}
              >
                {columns.map((col) => (
                  <Cell
                    key={col.key}
                    className={`${bodyCell}${col.numeric ? ' text-right mono-sm tabular-nums' : ''}`}
                  >
                    {row[col.key] ?? null}
                  </Cell>
                ))}
              </Row>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
