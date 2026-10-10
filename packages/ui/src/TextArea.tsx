import { TextArea as RACTextArea, TextField as RACTextField } from 'react-aria-components';
import { controlCls, FieldParts, fieldCls } from './field';
import type { BitTextFieldProps } from './TextField';

export function TextArea({ label, description, error, className, ...props }: BitTextFieldProps) {
  return (
    <RACTextField {...props} isInvalid={props.isInvalid || !!error} className={`${fieldCls} ${className ?? ''}`}>
      <FieldParts label={label} description={description} error={error}>
        <RACTextArea rows={4} className={`${controlCls} h-auto min-h-20 resize-y py-2`} />
      </FieldParts>
    </RACTextField>
  );
}
