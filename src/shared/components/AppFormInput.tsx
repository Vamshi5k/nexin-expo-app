import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import AppInput, { type AppInputProps } from './AppInput';

export type AppFormInputProps<T extends FieldValues> = Omit<
  AppInputProps,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> & {
  control: Control<T>;
  name: FieldPath<T>;
};

export default function AppFormInput<T extends FieldValues>({
  control,
  name,
  ...input
}: AppFormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
        <AppInput
          ref={ref}
          value={value == null ? '' : String(value)}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...input}
        />
      )}
    />
  );
}
