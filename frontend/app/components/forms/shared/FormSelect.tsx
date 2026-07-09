import { ChevronDown } from 'lucide-react';
import type { FieldError, FieldValues, Path, UseFormRegister } from 'react-hook-form';

interface FormSelectProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  options: { value: string; label: string }[];
  register: UseFormRegister<T>;
  error?: FieldError;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
}

export function FormSelect<T extends FieldValues>({
  label,
  name,
  options,
  register,
  error,
  required,
  placeholder = 'Wybierz…',
  helperText,
}: FormSelectProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-body text-sm font-medium text-white">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {helperText && <p className="text-xs text-silver">{helperText}</p>}
      <div className="relative">
        <select
          id={name}
          defaultValue=""
          aria-invalid={error ? 'true' : undefined}
          className="w-full cursor-pointer appearance-none rounded-lg border border-graphite bg-bg-surface px-4 py-3 pr-10 text-sm text-white transition-colors focus:border-accent focus:outline-none aria-invalid:border-red-500"
          {...register(name)}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-silver"
          aria-hidden="true"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error.message}</p>}
    </div>
  );
}
