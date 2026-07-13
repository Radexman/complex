import { z } from 'zod';

/**
 * An opening dimension, in centimetres. Empty strings (untouched inputs) become
 * `undefined` so the required-field message wins over a coercion error; present
 * values are coerced to a number and range-checked.
 */
function dimension(max: number, requiredMessage: string, maxMessage: string) {
  return z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number({ error: requiredMessage }).positive(requiredMessage).max(max, maxMessage),
  );
}

export const zaluzjeFormSchema = z.object({
  // Opening dimensions
  openingHeight: dimension(500, 'Podaj wysokość otworu', 'Maksymalna wysokość to 500 cm'),
  openingWidth: dimension(1000, 'Podaj szerokość otworu', 'Maksymalna szerokość to 1000 cm'),

  // Contact & location
  postalCode: z
    .string()
    .min(6, 'Podaj kod pocztowy')
    .regex(/^\d{2}-\d{3}$/, 'Format: 00-000'),
  name: z.string().min(2, 'Podaj swoje imię i nazwisko'),
  phone: z.string().min(9, 'Podaj numer telefonu'),
  email: z.email('Podaj poprawny adres e-mail'),

  // Extras
  installationService: z.boolean(),
  notes: z.string().optional(),
  photo: z.any().optional(), // File objects, handled separately in the component

  // Consents
  consentRodo: z.boolean().refine((val) => val === true, {
    message: 'Zgoda jest wymagana',
  }),
  consentMarketing: z.boolean(),
});

export type ZaluzjeFormInput = z.input<typeof zaluzjeFormSchema>;
export type ZaluzjeFormData = z.output<typeof zaluzjeFormSchema>;
