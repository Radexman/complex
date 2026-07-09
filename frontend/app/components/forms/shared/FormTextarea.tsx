import type { FieldError, FieldValues, Path, UseFormRegister } from 'react-hook-form';

interface FormTextareaProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  rows?: number;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

export function FormTextarea<T extends FieldValues>({
  label,
  name,
  register,
  error,
  rows = 4,
  placeholder,
  helperText,
  required,
}: FormTextareaProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-body text-sm font-medium text-white">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {helperText && <p className="text-xs text-silver">{helperText}</p>}
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : undefined}
        className="resize-none rounded-lg border border-graphite bg-bg-surface px-4 py-3 text-sm text-white transition-colors duration-200 placeholder:text-silver/50 focus:border-accent focus:outline-none aria-invalid:border-red-500"
        {...register(name)}
      />
      {error && <p className="text-xs text-red-400">{error.message}</p>}
    </div>
  );
}
