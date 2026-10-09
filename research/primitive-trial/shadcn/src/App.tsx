import { useRef, useState } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { IncidentTable } from "@/components/incident-table";
import { IntakeForm, EMPTY, type Values } from "@/components/intake-form";
import { Spinner } from "@/components/spinner";

function Toggle({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(c) => onChange(c === true)} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}

export function App() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [disabledDemo, setDisabledDemo] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [light, setLight] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);

  const confirm = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setOpen(false);
      setValues(EMPTY);
      setDone(true);
    }, 1200);
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="display-md">Incident intake</h1>
        <Toggle id="t-theme" label="Light theme" checked={light}
          onChange={(b) => {
            setLight(b);
            document.documentElement.setAttribute("data-theme", b ? "light" : "dark");
          }} />
      </header>

      {done && (
        <div role="status" className="flex items-center gap-2 rounded-md border border-status-ok bg-status-ok-wash p-3 text-ink">
          <CheckCircleIcon size={20} aria-hidden="true" />
          Incident submitted.
        </div>
      )}

      <section aria-labelledby="h-form" className="flex flex-col gap-4 rounded-lg border bg-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="h-form" className="display-md">New incident</h2>
          <Toggle id="t-disabled" label="Disabled demo" checked={disabledDemo} onChange={setDisabledDemo} />
        </div>
        <IntakeForm disabled={disabledDemo} values={values} setValues={setValues}
          onValid={() => { setDone(false); setOpen(true); }} submitRef={submitRef} />
      </section>

      <section aria-labelledby="h-table" className="flex flex-col gap-4 rounded-lg border bg-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="h-table" className="display-md">Incidents</h2>
          <div className="flex flex-wrap gap-4">
            <Toggle id="t-loading" label="Show loading" checked={showLoading} onChange={setShowLoading} />
            <Toggle id="t-empty" label="Show empty" checked={showEmpty} onChange={setShowEmpty} />
          </div>
        </div>
        <IncidentTable loading={showLoading} empty={showEmpty} />
      </section>

      <Dialog open={open} onOpenChange={(o) => { if (!busy) setOpen(o); }}>
        <DialogContent showCloseButton={false} onCloseAutoFocus={(e) => { e.preventDefault(); submitRef.current?.focus(); }}>
          <DialogHeader>
            <DialogTitle>Submit incident?</DialogTitle>
            <DialogDescription>Check these details before you submit.</DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Incident name</dt><dd>{values.name}</dd>
            <dt className="text-muted-foreground">Danger band</dt><dd>{values.band}</dd>
            <dt className="text-muted-foreground">Start date</dt><dd className="font-mono tabular-nums">{values.date}</dd>
            <dt className="text-muted-foreground">Contact email</dt><dd className="break-all">{values.email}</dd>
            <dt className="text-muted-foreground">Region</dt><dd>{values.region}</dd>
            <dt className="text-muted-foreground">Notes</dt><dd>{values.notes || "None"}</dd>
            <dt className="text-muted-foreground">Share with team</dt><dd>{values.share ? "Yes" : "No"}</dd>
          </dl>
          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={confirm} disabled={busy} aria-busy={busy}>
              {busy ? <><Spinner />Submitting</> : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
