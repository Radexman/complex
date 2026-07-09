import type { ReactNode } from 'react';
import { Checkbox } from '@ark-ui/react/checkbox';
import { Check } from 'lucide-react';
import { Controller } from 'react-hook-form';
import type { Control, FieldError, FieldPathByValue, FieldValues } from 'react-hook-form';

interface FormCheckboxProps<T extends FieldValues> {
  label: ReactNode;
  name: FieldPathByValue<T, boolean>;
  control: Control<T>;
  error?: FieldError;
  helperText?: string;
}

export function FormCheckbox<T extends FieldValues>({
  label,
  name,
  control,
  error,
  helperText,
}: FormCheckboxProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Checkbox.Root
            checked={Boolean(field.value)}
            onCheckedChange={(details) => field.onChange(details.checked === true)}
            onBlur={field.onBlur}
            invalid={Boolean(error)}
            className="flex cursor-pointer items-start gap-3"
          >
            <Checkbox.Control className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-graphite bg-bg-surface transition-all data-[state=checked]:border-accent data-[state=checked]:bg-accent data-invalid:border-red-500">
              <Checkbox.Indicator>
                <Check size={12} className="text-black" strokeWidth={3} />
              </Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.Label className="font-body text-sm leading-relaxed text-silver">
              {label}
            </Checkbox.Label>
            <Checkbox.HiddenInput />
          </Checkbox.Root>
        )}
      />
      {helperText && <p className="ml-8 text-xs text-silver">{helperText}</p>}
      {error && <p className="ml-8 text-xs text-red-400">{error.message}</p>}
    </div>
  );
}
