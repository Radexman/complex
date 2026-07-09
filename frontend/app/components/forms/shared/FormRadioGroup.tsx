import { RadioGroup } from '@ark-ui/react/radio-group';
import { Controller } from 'react-hook-form';
import type { Control, FieldError, FieldPathByValue, FieldValues } from 'react-hook-form';

interface FormRadioGroupProps<T extends FieldValues> {
  label: string;
  name: FieldPathByValue<T, string>;
  options: { value: string; label: string }[];
  control: Control<T>;
  error?: FieldError;
  required?: boolean;
}

/**
 * Generic reusable radio group styled as pill buttons — for future quotation
 * forms (e.g. the zadaszenie roof type).
 */
export function FormRadioGroup<T extends FieldValues>({
  label,
  name,
  options,
  control,
  error,
  required,
}: FormRadioGroupProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <RadioGroup.Root
            value={field.value ?? null}
            onValueChange={(details) => field.onChange(details.value)}
            onBlur={field.onBlur}
          >
            <RadioGroup.Label className="font-body text-sm font-medium text-white">
              {label} {required && <span className="text-accent">*</span>}
            </RadioGroup.Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {options.map((option) => (
                <RadioGroup.Item
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer rounded-full border border-graphite px-4 py-2 text-sm text-silver transition-all hover:border-accent/50 data-[state=checked]:border-accent data-[state=checked]:bg-accent/5 data-[state=checked]:text-accent"
                >
                  <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
                  <RadioGroup.ItemHiddenInput />
                </RadioGroup.Item>
              ))}
            </div>
          </RadioGroup.Root>
        )}
      />
      {error && <p className="text-xs text-red-400">{error.message}</p>}
    </div>
  );
}
