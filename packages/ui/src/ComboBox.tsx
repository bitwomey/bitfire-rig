import { useContext } from 'react';
import { Button, ComboBox as RACComboBox, ComboBoxStateContext, Input, ListBox, Popover, type ComboBoxProps } from 'react-aria-components';
import { Caret, controlCls, dim, FieldParts, fieldCls, focusRing, listBoxCls, Option, popoverCls, type FieldText } from './field';

export type BitComboBoxProps = Omit<ComboBoxProps<object, 'single'>, 'className' | 'children' | 'items'> & FieldText & { items: string[] };

// allowsEmptyCollection keeps the popover open when nothing matches; without it React Aria
// shows nothing at all. Its renderEmptyState is wrapped in role="option", which would
// announce "No matches" as something to pick, so the message is rendered beside the
// (empty) list as a status instead.
function NoMatches() {
  const state = useContext(ComboBoxStateContext);
  return (
    <div role="status">
      {state?.collection.size === 0 && <p className="body m-0 px-3 py-2 text-ink-muted">No matches</p>}
    </div>
  );
}

export function ComboBox({ label, description, error, className, items, ...props }: BitComboBoxProps) {
  return (
    <RACComboBox {...props} allowsEmptyCollection isInvalid={props.isInvalid || !!error} className={`${fieldCls} ${className ?? ''}`}>
      <FieldParts label={label} description={description} error={error}>
        <div className="relative">
          <Input className={`${controlCls} pr-10`} />
          <Button className={`absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-sm border-0 bg-transparent p-0 text-ink ${dim} ${focusRing}`}>
            <Caret />
          </Button>
        </div>
        <Popover className={popoverCls}>
          <ListBox className={listBoxCls}>
            {items.map((i) => (
              <Option key={i} id={i}>
                {i}
              </Option>
            ))}
          </ListBox>
          <NoMatches />
        </Popover>
      </FieldParts>
    </RACComboBox>
  );
}
