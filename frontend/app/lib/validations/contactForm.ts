import { z } from 'zod';

/**
 * An optional free-text field: an untouched input arrives as `''`, which becomes
 * `undefined` (absent) rather than a failed `.min()`. A value that *was* typed is
 * still length-checked, so a three-digit phone number is still rejected.
 */
function optionalText(min: number, message: string) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().min(min, message).optional(),
  );
}

export const contactFormSchema = z.object({
  // Optional by client request (round 4) — visitors would not fill them in.
  name: optionalText(2, 'Podaj swoje imię i nazwisko'),
  phone: optionalText(9, 'Podaj numer telefonu'),
  // The only guaranteed way to reply now that the phone number is optional.
  email: z.email('Podaj poprawny adres e-mail'),
  message: z.string().min(10, 'Wiadomość jest za krótka — napisz przynajmniej kilka słów'),

  consentRodo: z.boolean().refine((val) => val === true, {
    message: 'Zgoda jest wymagana',
  }),
  consentMarketing: z.boolean(),
});

export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormData = z.output<typeof contactFormSchema>;
