import { NumberInput } from '@ark-ui/react/number-input';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Controller } from 'react-hook-form';
import type { Control, FieldError, FieldValues, Path } from 'react-hook-form';

interface FormNumberInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  error?: FieldError;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  step?: number;
  min?: number;
}

/**
 * Number field built on Ark UI's headless `NumberInput` so the increment /
 * decrement controls are styled to the page (chevron steppers) instead of the
 * browser's default spinner arrows. Controlled through react-hook-form; the raw
 * string value is stored so the Zod schema's coercion handles parsing.
 */
export function FormNumberInput<T extends FieldValues>({
  label,
  name,
  control,
  error,
  placeholder,
  helperText,
  required,
  step = 0.01,
  min = 0,
}: FormNumberInputProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-body text-sm font-medium text-white">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {helperText && <p className="text-xs text-silver">{helperText}</p>}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <NumberInput.Root
            value={field.value == null ? '' : String(field.value)}
            onValueChange={(details) => field.onChange(details.value)}
            onFocusChange={(details) => {
              if (!details.focused) field.onBlur();
            }}
            step={step}
            min={min}
            clampValueOnBlur={false}
            inputMode="decimal"
            formatOptions={{ useGrouping: false, maximumFractionDigits: 2 }}
            invalid={Boolean(error)}
          >
            <NumberInput.Control className="relative isolate">
              <NumberInput.Input
                placeholder={placeholder}
                className="w-full rounded-lg border border-graphite bg-bg-surface py-3 pr-10 pl-4 text-sm text-white transition-colors duration-200 placeholder:text-silver/50 focus:border-accent focus:outline-none data-invalid:border-red-500"
              />
              <div className="absolute inset-y-1 right-1 flex w-7 flex-col overflow-hidden rounded-md border border-graphite bg-bg-surface">
                <NumberInput.IncrementTrigger
                  className="flex flex-1 items-center justify-center text-silver transition-colors hover:bg-accent/10 hover:text-accent"
                  aria-label="Zwiększ"
                >
                  <ChevronUp size={14} />
                </NumberInput.IncrementTrigger>
                <NumberInput.DecrementTrigger
                  className="flex flex-1 items-center justify-center border-t border-graphite text-silver transition-colors hover:bg-accent/10 hover:text-accent"
                  aria-label="Zmniejsz"
                >
                  <ChevronDown size={14} />
                </NumberInput.DecrementTrigger>
              </div>
            </NumberInput.Control>
          </NumberInput.Root>
        )}
      />
      {error && <p className="text-xs text-red-400">{error.message}</p>}
    </div>
  );
}
