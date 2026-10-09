import { useRef, useState } from 'react';
import { Form, Heading, Dialog, Modal, ModalOverlay } from 'react-aria-components';
import { parseDate, type DateValue } from '@internationalized/date';
import { BANDS, REGIONS } from './data';
import { Button, Checkbox, ComboBox, DateField, DisabledCtx, Select, Switch, TextField } from './ui';
import { IncidentTable } from './Table';

const TODAY = parseDate('2026-10-09'); // reference date from the spec
type V = { name: string; band: string | null; start: DateValue | null; email: string; region: string | null; notes: string; share: boolean };
const EMPTY: V = { name: '', band: null, start: null, email: '', region: null, notes: '', share: false };
// Order matters: it is the DOM order, and the first failing key gets focus.
function validate(v: V): Partial<Record<keyof V, string>> {
  const n = v.name.trim();
  const e: Partial<Record<keyof V, string>> = {};
  if (!n) e.name = 'Enter an incident name';
  else if (n.length < 3 || n.length > 60) e.name = 'Incident name must be 3 to 60 characters';
  if (!v.band) e.band = 'Choose a danger band';
  if (!v.start) e.start = 'Enter a start date';
  else if (v.start.compare(TODAY) > 0) e.start = 'Start date cannot be in the future';
  if (!v.email.trim()) e.email = 'Enter a contact email';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = 'Enter an email like name@example.com';
  if (!v.region) e.region = 'Choose a region from the list';
  if (v.notes && v.notes.length < 10) e.notes = 'Notes must be at least 10 characters if you add any';
  return e;
}

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [disabledDemo, setDisabledDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [summary, setSummary] = useState<[string, string][] | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [v, setV] = useState<V>(EMPTY);
  const [submitted, setSubmitted] = useState(false); // after the first failed submit, show errors live
  const formRef = useRef<HTMLFormElement>(null);
  const errs = submitted ? validate(v) : {};
  const set = <K extends keyof V>(k: K) => (x: V[K]) => setV((p) => ({ ...p, [k]: x }));

  const toggleTheme = (dark: boolean) => {
    const t = dark ? 'dark' : 'light';
    setTheme(t);
    document.documentElement.dataset.theme = t;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(validate(v)).length) {
      // RAC native validation would focus for us, but only revalidates on blur, so we own it.
      // Wait a frame so the fields have rendered aria-invalid, then focus the first invalid control.
      requestAnimationFrame(() => {
        const root = formRef.current?.querySelector('[data-invalid]');
        root?.querySelector<HTMLElement>('input:not([type=hidden]),textarea,button,[role=spinbutton]')?.focus();
      });
      return;
    }
    setSummary([
      ['Incident name', v.name], ['Danger band', v.band!], ['Start date', v.start!.toString()], ['Contact email', v.email],
      ['Region', v.region!], ['Notes', v.notes || 'Not given'], ['Shared with the regional team', v.share ? 'Yes' : 'No'],
    ]);
    setDone(false);
  };

  const confirm = () => {
    setPending(true);
    setTimeout(() => { setPending(false); setSummary(null); setDone(true); }, 1200);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6">
      <header className="flex flex-col gap-4">
        <h1 className="display-md">Incident intake</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <Switch isSelected={theme === 'dark'} onChange={toggleTheme}>Dark theme</Switch>
          <Switch isSelected={disabledDemo} onChange={setDisabledDemo}>Disabled demo</Switch>
        </div>
      </header>

      {done && (
        <div role="status" className="body flex gap-2 rounded-md border border-status-ok bg-status-ok-wash px-4 py-3 text-ink">
          <strong className="font-normal">Submitted.</strong> The incident was sent to the regional team.
        </div>
      )}

      <section aria-labelledby="form-h" className="flex flex-col gap-4 rounded-lg border border-border-hairline bg-surface p-4">
        <h2 id="form-h" className="display-md">New incident</h2>
        <DisabledCtx.Provider value={disabledDemo}>
          <Form ref={formRef} validationBehavior="aria" onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Incident name" description="3 to 60 characters" isRequired value={v.name} onChange={set('name')} error={errs.name} />
              <Select label="Danger band" items={[...BANDS]} placeholder="Choose a band" isRequired value={v.band} onChange={(k) => set('band')(k as string)} error={errs.band} />
              <DateField label="Start date" description="Not after 2026-10-09" isRequired value={v.start} onChange={set('start')} error={errs.start} />
              <TextField type="email" label="Contact email" isRequired value={v.email} onChange={set('email')} error={errs.email} />
              <ComboBox label="Region" description="Type to search" items={REGIONS} isRequired allowsEmptyCollection menuTrigger="focus" selectedKey={v.region} onSelectionChange={(k) => set('region')(k as string | null)} error={errs.region} />
            </div>
            <TextField area label="Notes" description="Optional. At least 10 characters if you add any" value={v.notes} onChange={set('notes')} error={errs.notes} />
            <Checkbox isSelected={v.share} onChange={set('share')}>Share with the regional team</Checkbox>
            <div><Button type="submit" variant="primary">Submit</Button></div>
          </Form>
        </DisabledCtx.Provider>
      </section>

      <section aria-labelledby="tbl-h" className="flex flex-col gap-4">
        <h2 id="tbl-h" className="display-md">Incidents</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <Switch isSelected={loading} onChange={setLoading}>Show loading</Switch>
          <Switch isSelected={empty} onChange={setEmpty}>Show empty</Switch>
        </div>
        <IncidentTable loading={loading} empty={empty} />
      </section>

      <ModalOverlay isOpen={!!summary} onOpenChange={(o) => { if (!o && !pending) setSummary(null); }} isDismissable={false}
        className="fixed inset-0 z-(--z-modal) flex items-center justify-center bg-scrim p-4">
        <Modal className="w-full max-w-md rounded-lg border border-border-hairline bg-surface-raised shadow-[var(--shadow-panel)]">
          <Dialog className="flex flex-col gap-4 p-6 outline-none">
            {({ close }) => (
              <>
                <Heading slot="title" className="display-md">Submit incident?</Heading>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  {summary?.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="label text-ink-muted">{k}</dt>
                      <dd className="body m-0 break-words text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onPress={close}>Cancel</Button>
                  <Button isPending={pending} onPress={confirm}>Submit</Button>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
