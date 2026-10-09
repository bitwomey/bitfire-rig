import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList,
} from "@/components/ui/combobox";
import { BANDS, REFERENCE_DATE, REGIONS } from "@/data";

export type Values = {
  name: string; band: string; date: string; email: string; notes: string; share: boolean; region: string | null;
};
export const EMPTY: Values = { name: "", band: "", date: "", email: "", notes: "", share: false, region: null };

type Errors = Partial<Record<keyof Values, string>>;
const ORDER: (keyof Values)[] = ["name", "band", "date", "email", "notes", "share", "region"];

export function validate(v: Values): Errors {
  const e: Errors = {};
  const n = v.name.trim().length;
  if (n === 0) e.name = "Enter an incident name.";
  else if (n < 3 || n > 60) e.name = "Incident name must be 3 to 60 characters.";
  if (!v.band) e.band = "Choose a danger band.";
  if (!v.date) e.date = "Enter a start date.";
  else if (v.date > REFERENCE_DATE) e.date = "Start date cannot be in the future.";
  if (!v.email) e.email = "Enter a contact email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Enter an email like name@example.org.";
  if (v.notes && v.notes.trim().length < 10) e.notes = "Notes must be at least 10 characters if you add any.";
  if (!v.region) e.region = "Choose a region.";
  return e;
}

export function IntakeForm({
  disabled, values, setValues, onValid, submitRef,
}: {
  disabled: boolean;
  values: Values;
  setValues: (fn: (v: Values) => Values) => void;
  onValid: () => void;
  submitRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const [attempted, setAttempted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = attempted ? validate(values) : {};
  const set = <K extends keyof Values>(k: K, val: Values[K]) => setValues((v) => ({ ...v, [k]: val }));

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(values);
    setAttempted(true);
    const first = ORDER.find((k) => e[k]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#f-${first}`)?.focus();
      return;
    }
    onValid();
  };

  const d = (k: keyof Values, help?: boolean) =>
    [help ? `h-${k}` : null, errors[k] ? `e-${k}` : null].filter(Boolean).join(" ") || undefined;

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="f-name">Incident name</FieldLabel>
        <Input id="f-name" value={values.name} disabled={disabled} aria-invalid={!!errors.name}
          aria-describedby={d("name", true)} onChange={(e) => set("name", e.target.value)} />
        <FieldDescription id="h-name">3 to 60 characters.</FieldDescription>
        {errors.name && <FieldError id="e-name">{errors.name}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="f-band">Danger band</FieldLabel>
        <Select value={values.band} onValueChange={(b) => set("band", b)} disabled={disabled}>
          <SelectTrigger id="f-band" className="w-full" aria-invalid={!!errors.band} aria-describedby={d("band")}>
            <SelectValue placeholder="Choose a band" />
          </SelectTrigger>
          <SelectContent>
            {BANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.band && <FieldError id="e-band">{errors.band}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="f-date">Start date</FieldLabel>
        <Input id="f-date" type="date" value={values.date} disabled={disabled} aria-invalid={!!errors.date}
          aria-describedby={d("date", true)} onChange={(e) => set("date", e.target.value)} />
        <FieldDescription id="h-date">Not later than {REFERENCE_DATE}.</FieldDescription>
        {errors.date && <FieldError id="e-date">{errors.date}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="f-email">Contact email</FieldLabel>
        <Input id="f-email" type="email" value={values.email} disabled={disabled} aria-invalid={!!errors.email}
          aria-describedby={d("email")} onChange={(e) => set("email", e.target.value)} />
        {errors.email && <FieldError id="e-email">{errors.email}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="f-notes">Notes (optional)</FieldLabel>
        <Textarea id="f-notes" value={values.notes} disabled={disabled} aria-invalid={!!errors.notes}
          aria-describedby={d("notes", true)} onChange={(e) => set("notes", e.target.value)} />
        <FieldDescription id="h-notes">If you add notes, write at least 10 characters.</FieldDescription>
        {errors.notes && <FieldError id="e-notes">{errors.notes}</FieldError>}
      </Field>

      <Field orientation="horizontal">
        <Checkbox id="f-share" checked={values.share} disabled={disabled}
          onCheckedChange={(c) => set("share", c === true)} />
        <FieldLabel htmlFor="f-share">Share with the regional team</FieldLabel>
      </Field>

      <Field>
        <FieldLabel htmlFor="f-region">Region</FieldLabel>
        <Combobox items={REGIONS} value={values.region} onValueChange={(r) => set("region", r)} disabled={disabled}>
          <ComboboxInput id="f-region" placeholder="Type to search regions" aria-invalid={!!errors.region}
            aria-describedby={d("region", true)} />
          <ComboboxContent>
            <ComboboxEmpty>No regions match</ComboboxEmpty>
            <ComboboxList>
              {(r: string) => <ComboboxItem key={r} value={r}>{r}</ComboboxItem>}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription id="h-region">Type to filter, arrow keys to move, Enter to choose.</FieldDescription>
        {errors.region && <FieldError id="e-region">{errors.region}</FieldError>}
      </Field>

      <div>
        <Button ref={submitRef} type="submit" disabled={disabled}>Submit</Button>
      </div>
    </form>
  );
}
