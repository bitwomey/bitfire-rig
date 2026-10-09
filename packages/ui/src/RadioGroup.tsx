import { Radio, RadioGroup as RACRadioGroup, type RadioGroupProps } from 'react-aria-components';
import { dim, FieldParts, groupRing, type FieldText } from './field';

export type BitRadioGroupProps = Omit<RadioGroupProps, 'className' | 'children'> & FieldText & { options: { value: string; label: string }[] };

export function RadioGroup({ label, description, error, className, options, ...props }: BitRadioGroupProps) {
  return (
    <RACRadioGroup {...props} isInvalid={props.isInvalid || !!error} className={`group flex flex-col gap-1 ${className ?? ''}`}>
      <FieldParts label={label} description={description} error={error}>
        <div className="flex flex-col gap-2 py-1">
          {options.map((o) => (
            <Radio key={o.value} value={o.value} className={`group flex items-center gap-2 ${dim}`}>
              <span
                data-indicator
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-surface-inset group-data-[invalid]:border-2 group-data-[invalid]:border-status-danger group-data-[selected]:border-signal group-data-[hovered]:bg-surface-hover ${groupRing}`}
              >
                <span className="size-2.5 rounded-full bg-signal opacity-0 group-data-[selected]:opacity-100" />
              </span>
              <span className="body text-ink">{o.label}</span>
            </Radio>
          ))}
        </div>
      </FieldParts>
    </RACRadioGroup>
  );
}
