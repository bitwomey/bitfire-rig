import { useMemo, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, CaretUpDownIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DangerChip } from "@/components/danger-chip";
import { BANDS, INCIDENTS, type Incident } from "@/data";

type Key = "name" | "band" | "area" | "updated";
type Sort = { key: Key; dir: "asc" | "desc" } | null;

const COLS: { key: Key; label: string; right?: boolean }[] = [
  { key: "name", label: "Name" },
  { key: "band", label: "Danger band" },
  { key: "area", label: "Area (ha)", right: true },
  { key: "updated", label: "Updated" },
];

function cmp(a: Incident, b: Incident, key: Key) {
  if (key === "band") return BANDS.indexOf(a.band) - BANDS.indexOf(b.band);
  if (key === "area") return a.area - b.area;
  return a[key].localeCompare(b[key]);
}

export function IncidentTable({ loading, empty }: { loading: boolean; empty: boolean }) {
  const [sort, setSort] = useState<Sort>(null);
  const rows = useMemo(() => {
    if (empty) return [];
    if (!sort) return INCIDENTS;
    const m = sort.dir === "asc" ? 1 : -1;
    return [...INCIDENTS].sort((a, b) => m * cmp(a, b, sort.key));
  }, [sort, empty]);

  // ascending -> descending -> none
  const cycle = (key: Key) =>
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));

  return (
    <Table aria-busy={loading} aria-label="Incidents">
      <TableHeader>
        <TableRow>
          {COLS.map((c) => {
            const active = sort?.key === c.key;
            const ariaSort = active ? (sort.dir === "asc" ? "ascending" : "descending") : "none";
            const Icon = !active ? CaretUpDownIcon : sort.dir === "asc" ? ArrowUpIcon : ArrowDownIcon;
            return (
              <TableHead key={c.key} aria-sort={ariaSort} className={c.right ? "text-right" : undefined}>
                <button
                  type="button"
                  onClick={() => cycle(c.key)}
                  className={
                    "inline-flex items-center gap-1 rounded-sm px-1 py-1 text-sm font-medium outline-none focus-visible:ring-(length:--stroke-heavy) focus-visible:ring-ring " +
                    (c.right ? "flex-row-reverse" : "")
                  }
                >
                  {c.label}
                  <Icon size={16} aria-hidden="true" />
                </button>
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 5 }, (_, i) => (
            <TableRow key={i} aria-hidden="true">
              {COLS.map((c) => (
                <TableCell key={c.key}>
                  <Skeleton className="h-4 w-full min-w-16" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={COLS.length} className="py-8 text-center text-muted-foreground">
              No incidents to show
            </TableCell>
          </TableRow>
        ) : (
          rows.map((r) => (
            <TableRow key={r.name}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell>
                <DangerChip band={r.band} />
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">{r.area.toLocaleString("en-AU")}</TableCell>
              <TableCell className="font-mono tabular-nums">{r.updated}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
