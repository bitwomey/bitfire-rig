import { useMemo, useState } from 'react';
import { Table as T, TableHeader, Column, TableBody, Row, Cell, type SortDescriptor } from 'react-aria-components';
import { CaretUp, CaretDown, CaretUpDown } from '@phosphor-icons/react';
import { BANDS, INCIDENTS } from './data';
import { BandChip } from './ui';

const COLS = [
  { id: 'name', label: 'Name', num: false },
  { id: 'band', label: 'Danger band', num: false },
  { id: 'area', label: 'Area (ha)', num: true },
  { id: 'updated', label: 'Updated', num: false },
] as const;

const cell = 'px-3 py-2 align-middle outline-none data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-focus-ring';
const SKELETON = [0, 1, 2, 3, 4];

export function IncidentTable({ loading, empty }: { loading: boolean; empty: boolean }) {
  // undefined = unsorted. RAC only toggles asc/desc, so the third state (none) is ours.
  const [sort, setSort] = useState<SortDescriptor | undefined>();
  const rows = useMemo(() => {
    if (empty) return [];
    const list = [...INCIDENTS];
    if (!sort) return list;
    const k = sort.column as 'name' | 'band' | 'area' | 'updated';
    const val = (r: (typeof INCIDENTS)[number]) => (k === 'band' ? BANDS.indexOf(r.band) : r[k]);
    list.sort((a, b) => (val(a) < val(b) ? -1 : val(a) > val(b) ? 1 : 0));
    if (sort.direction === 'descending') list.reverse();
    return list;
  }, [sort, empty]);

  const onSortChange = (next: SortDescriptor) =>
    setSort(sort?.column === next.column && sort.direction === 'descending' ? undefined : next);

  return (
    <div className="overflow-x-auto rounded-lg border border-border-hairline bg-surface">
      <T aria-label="Incidents" sortDescriptor={sort} onSortChange={onSortChange} className="w-full border-collapse text-left">
        <TableHeader className="border-b border-border-hairline">
          {COLS.map((c) => (
            <Column key={c.id} id={c.id} isRowHeader={c.id === 'name'} allowsSorting
              className={`label ${cell} ${c.num ? 'text-right' : ''} text-ink-muted font-normal! cursor-default whitespace-nowrap data-[hovered]:bg-surface-hover`}>
              {({ sortDirection }) => (
                <span className={`inline-flex items-center gap-1 ${c.num ? 'flex-row-reverse' : ''}`}>
                  {c.label}
                  {sortDirection === 'ascending' ? <CaretUp size={16} aria-hidden /> : sortDirection === 'descending' ? <CaretDown size={16} aria-hidden /> : <CaretUpDown size={16} aria-hidden />}
                </span>
              )}
            </Column>
          ))}
        </TableHeader>
        <TableBody
          items={loading ? SKELETON.map((id) => ({ id })) : rows}
          renderEmptyState={() => <div className="body px-3 py-6 text-center text-ink-muted">No incidents to show</div>}>
          {(r: any) =>
            loading ? (
              <Row id={`s${r.id}`} className="border-b border-border-hairline last:border-b-0">
                {COLS.map((c) => (
                  <Cell key={c.id} className={cell}>
                    <span aria-hidden className="block h-4 w-full max-w-24 rounded-sm bg-surface-hover" style={{ animation: 'pulse-skel 1.4s ease-in-out infinite' }} />
                    <span className="sr-only">Loading</span>
                  </Cell>
                ))}
              </Row>
            ) : (
              <Row id={r.id} className="border-b border-border-hairline last:border-b-0 data-[hovered]:bg-surface-hover">
                <Cell className={`body ${cell} text-ink whitespace-nowrap`}>{r.name}</Cell>
                <Cell className={cell}><BandChip band={r.band} /></Cell>
                <Cell className={`readout-sm ${cell} text-right tabular-nums text-ink`}>{r.area.toLocaleString('en-AU')}</Cell>
                <Cell className={`readout-sm ${cell} tabular-nums text-ink whitespace-nowrap`}>{r.updated}</Cell>
              </Row>
            )
          }
        </TableBody>
      </T>
    </div>
  );
}
