import { Button, ListBox, Popover, Select as RACSelect, SelectValue, type SelectProps } from 'react-aria-components';
import { Caret, controlCls, FieldParts, fieldCls, listBoxCls, Option, popoverCls, type FieldText } from './field';

export type BitSelectProps = Omit<SelectProps<object, 'single'>, 'className' | 'children' | 'items'> & FieldText & { items: string[] };

export function Select({ label, description, error, className, items, placeholder = 'Choose...', ...props }: BitSelectProps) {
  return (
    <RACSelect {...props} placeholder={placeholder} isInvalid={props.isInvalid || !!error} className={`${fieldCls} ${className ?? ''}`}>
      <FieldParts label={label} description={description} error={error}>
        <Button className={`${controlCls} flex items-center justify-between gap-2 text-left data-[pressed]:bg-surface-hover`}>
          <SelectValue className="data-[placeholder]:text-ink-muted" />
          <Caret />
        </Button>
        <Popover className={popoverCls}>
          <ListBox className={listBoxCls}>
            {items.map((i) => (
              <Option key={i} id={i}>
                {i}
              </Option>
            ))}
          </ListBox>
        </Popover>
      </FieldParts>
    </RACSelect>
  );
}
