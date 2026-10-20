import {
  FireDangerBadge,
  MetricTile,
  Provenance,
  StatusBadge,
} from '@bitfire/ui';

const INCIDENTS = [
  { id: 1, name: 'Hawkwood Fire', status: 'going' as const, rating: 'extreme' as const, area: '1 240 ha', resources: 12 },
  { id: 2, name: 'Ridgeline North', status: 'going' as const, rating: 'high' as const, area: '340 ha', resources: 4 },
  { id: 3, name: 'Border East', status: 'under-assessment' as const, rating: 'moderate' as const, area: '—', resources: 2 },
];

export function App() {
  return (
    <div className="min-h-screen bg-canvas text-ink p-6 flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <h1 className="body-lg font-medium text-ink">Operations Overview</h1>
        <span className="flex-1" />
        <Provenance level="observed" source="FireWatch 06z" />
      </header>

      <section aria-label="Summary metrics" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricTile label="Active incidents" value="3" />
        <MetricTile label="Total area" value="1 580" unit="ha" delta="+340" deltaDirection="up" />
        <MetricTile label="Resources deployed" value="18" />
        <MetricTile label="Under assessment" value="1" flat />
      </section>

      <section aria-label="Incident list">
        <h2 className="caption text-ink-muted uppercase tracking-wide mb-2">Incidents</h2>
        <div className="bg-surface-raised rounded-lg shadow-panel overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hairline">
                <th className="table-header text-ink-muted px-4 py-2">Incident</th>
                <th className="table-header text-ink-muted px-4 py-2">Status</th>
                <th className="table-header text-ink-muted px-4 py-2">Danger</th>
                <th className="table-header text-ink-muted px-4 py-2">Area</th>
                <th className="table-header text-ink-muted px-4 py-2">Resources</th>
              </tr>
            </thead>
            <tbody>
              {INCIDENTS.map((inc) => (
                <tr key={inc.id} className="border-b border-hairline last:border-0">
                  <td className="body-sm px-4 py-2.5 font-medium">{inc.name}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge tone={inc.status === 'going' ? 'danger' : 'warn'}>
                      {inc.status === 'going' ? 'Going' : 'Under assessment'}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-2.5">
                    <FireDangerBadge rating={inc.rating} />
                  </td>
                  <td className="body-sm px-4 py-2.5 font-mono tabular-nums">{inc.area}</td>
                  <td className="body-sm px-4 py-2.5 font-mono tabular-nums">{inc.resources}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
