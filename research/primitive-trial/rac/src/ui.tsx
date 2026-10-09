import { createContext, useContext, type ReactNode } from 'react';
import {
  Button as RACButton, type ButtonProps,
  Label as RACLabel, Text, FieldError as RACFieldError, Input,
  TextField as RACTextField, type TextFieldProps, TextArea,
  Select as RACSelect, type SelectProps, SelectValue, Popover, ListBox, ListBoxItem, type ListBoxItemProps,
  ComboBox as RACComboBox, type ComboBoxProps,
  DateField as RACDateField, type DateFieldProps, DateInput, DateSegment, type DateValue,
  Checkbox as RACCheckbox, type CheckboxProps,
  Switch as RACSwitch, type SwitchProps,
  composeRenderProps,
} from 'react-aria-components';
import { CaretDown, Check } from '@phosphor-icons/react';
import type { Band } from './data';

/* Whole-form disabled demo. RAC has no fieldset/form-level isDisabled, so every control reads this. */
export const DisabledCtx = createContext(false);
const useDis = (p?: boolean) => {
  const c = useContext(DisabledCtx);
  return p ?? c;
};

const focusRing = 'outline-none data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus-ring';
const dim = 'data-[disabled]:opacity-(--opacity-disabled) data-[disabled]:cursor-not-allowed';

export function Spinner() {
  return <span aria-hidden className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

export function Button({ variant = 'primary', className, children, ...p }: ButtonProps & { variant?: 'primary' | 'secondary' }) {
  const isDisabled = useDis(p.isDisabled);
  const v = variant === 'primary'
    ? 'bg-signal text-on-signal border-signal data-[hovered]:bg-signal-hover data-[pressed]:bg-signal-hover'
    : 'bg-surface-raised text-ink border-border data-[hovered]:bg-surface-hover data-[pressed]:bg-surface-inset';
  return (
    <RACButton {...p} isDisabled={isDisabled}
      className={composeRenderProps(className, (c) => `${c ?? ''} body-sm inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 font-normal! cursor-default ${v} data-[pressed]:translate-y-px ${focusRing} ${dim} data-[pending]:cursor-progress`)}>
      {composeRenderProps(children, (c, { isPending }) => (isPending ? <><Spinner />Submitting</> : c))}
    </RACButton>
  );
}

function Shell({ label, description, error, children }: { label: ReactNode; description?: ReactNode; error?: string; children: ReactNode }) {
  return (
    <>
      <RACLabel className="label text-ink">{label}</RACLabel>
      {children}
      {description && <Text slot="description" className="body-sm text-ink-muted">{description}</Text>}
      <RACFieldError className="body-sm text-status-danger">{error}</RACFieldError>
    </>
  );
}
const fieldCls = 'flex flex-col gap-1';
const control = `body h-10 w-full rounded-sm border border-border bg-surface-inset px-3 text-ink placeholder:text-ink-subtle data-[hovered]:bg-surface-hover data-[invalid]:border-status-danger data-[invalid]:border-2 data-[disabled]:opacity-(--opacity-disabled) data-[disabled]:cursor-not-allowed ${focusRing}`;

export function TextField({ label, description, error, area, ...p }: TextFieldProps & { label: ReactNode; description?: ReactNode; error?: string; area?: boolean }) {
  return (
    <RACTextField {...p} isDisabled={useDis(p.isDisabled)} isInvalid={!!error} className={fieldCls}>
      <Shell label={label} description={description} error={error}>
        {area ? <TextArea rows={4} className={`${control} h-auto py-2`} /> : <Input className={control} />}
      </Shell>
    </RACTextField>
  );
}

export function DateField<T extends DateValue>({ label, description, error, ...p }: DateFieldProps<T> & { label: ReactNode; description?: ReactNode; error?: string }) {
  return (
    <RACDateField {...p} isDisabled={useDis(p.isDisabled)} isInvalid={!!error} className={fieldCls}>
      <Shell label={label} description={description} error={error}>
        <DateInput className={`${control} flex items-center data-[focus-within]:outline-2 data-[focus-within]:outline-offset-2 data-[focus-within]:outline-focus-ring`}>
          {(seg) => <DateSegment segment={seg} className="rounded-sm px-0.5 font-mono tabular-nums outline-none data-[placeholder]:text-ink-subtle data-[focused]:bg-signal data-[focused]:text-on-signal" />}
        </DateInput>
      </Shell>
    </RACDateField>
  );
}

const popover = 'z-(--z-dropdown) w-(--trigger-width) rounded-md border border-border bg-surface-raised shadow-[var(--shadow-md)]';
const optCls = 'body flex cursor-default items-center justify-between gap-2 px-3 py-2 text-ink outline-none data-[focused]:bg-signal-wash data-[hovered]:bg-surface-hover data-[selected]:font-normal';
export function Option(p: ListBoxItemProps & { children: string }) {
  return (
    <ListBoxItem {...p} textValue={p.children} className={optCls}>
      {({ isSelected }) => <>{p.children}{isSelected && <Check size={16} aria-hidden />}</>}
    </ListBoxItem>
  );
}

export function Select({ label, description, error, items, ...p }: Omit<SelectProps<{ id: string }>, 'children' | 'items'> & { label: ReactNode; description?: ReactNode; error?: string; items: string[] }) {
  return (
    <RACSelect {...p} isDisabled={useDis(p.isDisabled)} isInvalid={!!error} className={`${fieldCls} group`}>
      <Shell label={label} description={description} error={error}>
        <RACButton className={`${control} group-data-[invalid]:border-status-danger group-data-[invalid]:border-2 flex items-center justify-between text-left data-[pressed]:bg-surface-hover`}>
          <SelectValue className="data-[placeholder]:text-ink-subtle" />
          <CaretDown size={16} aria-hidden />
        </RACButton>
        <Popover className={popover}>
          <ListBox className="max-h-64 overflow-auto py-1 outline-none">{items.map((i) => <Option key={i} id={i}>{i}</Option>)}</ListBox>
        </Popover>
      </Shell>
    </RACSelect>
  );
}

export function ComboBox({ label, description, error, items, ...p }: Omit<ComboBoxProps<{ id: string }>, 'children' | 'items'> & { label: ReactNode; description?: ReactNode; error?: string; items: string[] }) {
  return (
    <RACComboBox {...p} isDisabled={useDis(p.isDisabled)} isInvalid={!!error} className={fieldCls}>
      <Shell label={label} description={description} error={error}>
        <div className="relative">
          <Input className={`${control} pr-10`} />
          <RACButton className={`absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-sm text-ink ${focusRing} ${dim}`}><CaretDown size={16} aria-hidden /></RACButton>
        </div>
        <Popover className={popover}>
          <ListBox className="max-h-64 overflow-auto py-1 outline-none" renderEmptyState={() => <div className="body px-3 py-2 text-ink-muted">No regions match</div>}>
            {items.map((i) => <Option key={i} id={i}>{i}</Option>)}
          </ListBox>
        </Popover>
      </Shell>
    </RACComboBox>
  );
}

export function Checkbox({ children, ...p }: Omit<CheckboxProps, "children"> & { children: ReactNode }) {
  return (
    <RACCheckbox {...p} isDisabled={useDis(p.isDisabled)} className={`group flex items-center gap-2 ${dim}`}>
      {({ isSelected }) => (
        <>
          <span className="flex size-5 items-center justify-center rounded-sm border border-border group-data-[selected]:border-signal group-data-[selected]:bg-signal group-data-[selected]:text-on-signal group-data-[focus-visible]:outline-2 group-data-[focus-visible]:outline-offset-2 group-data-[focus-visible]:outline-focus-ring">
            {isSelected && <Check size={16} weight="regular" aria-hidden />}
          </span>
          <span className="body text-ink">{children}</span>
        </>
      )}
    </RACCheckbox>
  );
}

export function Switch({ children, ...p }: Omit<SwitchProps, "children"> & { children: ReactNode }) {
  return (
    <RACSwitch {...p} className={`group flex items-center gap-2 ${dim}`}>
      <span className="flex h-6 w-10 items-center rounded-full border border-border bg-surface-inset px-0.5 group-data-[selected]:border-signal group-data-[selected]:bg-signal-wash group-data-[focus-visible]:outline-2 group-data-[focus-visible]:outline-offset-2 group-data-[focus-visible]:outline-focus-ring">
        <span className="size-4 rounded-full bg-ink-muted transition-transform group-data-[selected]:translate-x-4 group-data-[selected]:bg-signal" />
      </span>
      <span className="body text-ink">{children}</span>
    </RACSwitch>
  );
}

const chipFill: Record<Band, string> = {
  'No rating': 'bg-fdr-no-rating text-ink-on-warm',
  Moderate: 'bg-fdr-moderate text-ink-on-warm',
  High: 'bg-fdr-high text-ink-on-warm',
  Extreme: 'bg-fdr-extreme text-ink-on-warm',
  Catastrophic: 'bg-fdr-catastrophic text-ink-on-deep',
};
export function BandChip({ band }: { band: Band }) {
  return <span className={`label inline-block rounded-sm border border-border px-2 py-0.5 font-normal! ${chipFill[band]}`}>{band}</span>;
}
