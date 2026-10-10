import { Input, TextField as RACTextField, type TextFieldProps } from 'react-aria-components';
import { controlCls, FieldParts, fieldCls, type FieldText } from './field';

export type BitTextFieldProps = Omit<TextFieldProps, 'className' | 'children'> & FieldText;

// `error` is controlled validation: a visible message tied to the input by React Aria.
export function TextField({ label, description, error, className, ...props }: BitTextFieldProps) {
  return (
    <RACTextField {...props} isInvalid={props.isInvalid || !!error} className={`${fieldCls} ${className ?? ''}`}>
      <FieldParts label={label} description={description} error={error}>
        <Input className={controlCls} />
      </FieldParts>
    </RACTextField>
  );
}
