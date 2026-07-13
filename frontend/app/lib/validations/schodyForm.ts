import { z } from 'zod';

/**
 * A stair dimension, in centimetres. Empty strings (untouched inputs) become
 * `undefined` so the required-field message wins over a coercion error; present
 * values are coerced to a number and checked for positivity.
 */
function dimension(message: string) {
  return z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number({ error: message }).positive(message),
  );
}

/**
 * The seven dimensions from the technical diagram, in render order. `dimH` and
 * `dimh` are two distinct measurements (height including the ceiling vs. height
 * to the ceiling) — the case difference is meaningful, not a typo.
 */
export const SCHODY_DIMENSIONS = [
  { name: 'dimA', label: 'A — szerokość otworu [cm]', logLabel: 'A — szerokość otworu' },
  { name: 'dimB', label: 'B — głębokość otworu [cm]', logLabel: 'B — głębokość otworu' },
  { name: 'dimC', label: 'C — grubość stropu [cm]', logLabel: 'C — grubość stropu' },
  { name: 'dimD', label: 'D — długość schodów [cm]', logLabel: 'D — długość schodów' },
  { name: 'dimE', label: 'E — szerokość stopni [cm]', logLabel: 'E — szerokość stopni' },
  {
    name: 'dimH',
    label: 'H — wysokość od podłoża wraz ze stropem [cm]',
    logLabel: 'H — wys. od podłoża ze stropem',
  },
  {
    name: 'dimh',
    label: 'h — wysokość od podłoża do stropu [cm]',
    logLabel: 'h — wys. od podłoża do stropu',
  },
] as const;

export const schodyFormSchema = z.object({
  // Insulation (only relevant for outdoor stairs)
  isInsulated: z.enum(['tak', 'nie'], { error: 'Określ czy budynek jest ocieplony' }),

  // Dimensions (cm)
  dimA: dimension('Podaj wymiar A — szerokość otworu'),
  dimB: dimension('Podaj wymiar B — głębokość otworu'),
  dimC: dimension('Podaj wymiar C — grubość stropu'),
  dimD: dimension('Podaj wymiar D — długość schodów'),
  dimE: dimension('Podaj wymiar E — szerokość stopni'),
  dimH: dimension('Podaj wymiar H — wysokość od podłoża wraz ze stropem'),
  dimh: dimension('Podaj wymiar h — wysokość od podłoża do stropu'),

  // Contact & location
  postalCode: z
    .string()
    .min(6, 'Podaj kod pocztowy')
    .regex(/^\d{2}-\d{3}$/, 'Format: 00-000'),
  name: z.string().min(2, 'Podaj swoje imię i nazwisko'),
  phone: z.string().min(9, 'Podaj numer telefonu'),
  email: z.email('Podaj poprawny adres e-mail'),

  // Extras
  notes: z.string().optional(),
  photo: z.any().optional(), // File objects, handled separately in the component

  // Consents
  consentRodo: z.boolean().refine((val) => val === true, {
    message: 'Zgoda jest wymagana',
  }),
  consentMarketing: z.boolean(),
});

export type SchodyFormInput = z.input<typeof schodyFormSchema>;
export type SchodyFormData = z.output<typeof schodyFormSchema>;
