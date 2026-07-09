import type { FieldError, FieldValues, Path, UseFormRegister } from 'react-hook-form';

interface FormInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  type?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  step?: string | number;
  min?: string | number;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email';
  autoComplete?: string;
}

export function FormInput<T extends FieldValues>({
  label,
  name,
  register,
  error,
  type = 'text',
  placeholder,
  helperText,
  required,
  step,
  min,
  inputMode,
  autoComplete,
}: FormInputProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-body text-sm font-medium text-white">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {helperText && <p className="text-xs text-silver">{helperText}</p>}
      <input
        id={name}
        type={type}
        step={step}
        min={min}
        inputMode={inputMode}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? 'true' : undefined}
        className="rounded-lg border border-graphite bg-bg-surface px-4 py-3 text-sm text-white transition-colors duration-200 placeholder:text-silver/50 focus:border-accent focus:outline-none aria-invalid:border-red-500"
        {...register(name)}
      />
      {error && <p className="text-xs text-red-400">{error.message}</p>}
    </div>
  );
}
