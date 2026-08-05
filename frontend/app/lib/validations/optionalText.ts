import { z } from 'zod';

/**
 * An optional free-text field: an untouched input arrives as `''`, which becomes
 * `undefined` (absent) rather than a failed `.min()`. A value that *was* typed is
 * still length-checked, so a three-digit phone number is still rejected.
 *
 * Shared by the contact form and all four quotation forms, where the client asked
 * for name and phone to be optional — one helper so the five can't drift.
 */
export function optionalText(min: number, message: string) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().min(min, message).optional(),
  );
}
