import { z } from 'zod';

import { optionalText } from './optionalText';

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

/** Same as `dimension`, but an untouched input is simply absent instead of an error. */
function optionalDimension(max: number, invalidMessage: string, maxMessage: string) {
  return z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce
      .number({ error: invalidMessage })
      .positive(invalidMessage)
      .max(max, maxMessage)
      .optional(),
  );
}

/**
 * Openings 2 and 3 are optional, but each is a pair — half an opening would
 * reach sales as a lead with a width and no height. Keyed by opening number.
 */
const OPTIONAL_OPENINGS = [
  { height: 'opening2Height', width: 'opening2Width', number: 2 },
  { height: 'opening3Height', width: 'opening3Width', number: 3 },
] as const;

export const zaluzjeFormSchema = z
  .object({
    // Opening 1 — required
    openingHeight: dimension(300, 'Podaj wysokość otworu', 'Maksymalna wysokość to 300 cm'),
    openingWidth: dimension(1000, 'Podaj szerokość otworu', 'Maksymalna szerokość to 1000 cm'),

    // Openings 2 and 3 — optional, but both-or-neither (see the refinement below)
    opening2Height: optionalDimension(
      300,
      'Podaj wysokość otworu 2',
      'Maksymalna wysokość to 300 cm',
    ),
    opening2Width: optionalDimension(
      1000,
      'Podaj szerokość otworu 2',
      'Maksymalna szerokość to 1000 cm',
    ),
    opening3Height: optionalDimension(
      300,
      'Podaj wysokość otworu 3',
      'Maksymalna wysokość to 300 cm',
    ),
    opening3Width: optionalDimension(
      1000,
      'Podaj szerokość otworu 3',
      'Maksymalna szerokość to 1000 cm',
    ),

    // Contact & location
    postalCode: z
      .string()
      .min(6, 'Podaj kod pocztowy')
      .regex(/^\d{2}-\d{3}$/, 'Format: 00-000'),
    // Optional by client request — the e-mail address is the required contact route.
    name: optionalText(2, 'Podaj swoje imię i nazwisko'),
    phone: optionalText(9, 'Podaj numer telefonu'),
    email: z.email('Podaj poprawny adres e-mail'),

    // Extras
    installationService: z.boolean(),
    notes: z.string().optional(),
    photo: z.any().optional(), // File objects, handled separately in the component

    // Consent — RODO only; the marketing opt-in was dropped at the client's request.
    consentRodo: z.boolean().refine((val) => val === true, {
      message: 'Zgoda jest wymagana',
    }),
  })
  .superRefine(
    (data, ctx) => {
      for (const { height, width, number } of OPTIONAL_OPENINGS) {
        const hasHeight = data[height] !== undefined;
        const hasWidth = data[width] !== undefined;
        if (hasHeight && !hasWidth) {
          ctx.addIssue({
            code: 'custom',
            path: [width],
            message: `Podaj szerokość otworu ${number}`,
          });
        }
        if (hasWidth && !hasHeight) {
          ctx.addIssue({
            code: 'custom',
            path: [height],
            message: `Podaj wysokość otworu ${number}`,
          });
        }
      }
    },
    {
      // By default an object refinement is skipped while any field is invalid, so
      // the pair error would only appear after the whole form was fixed. Run it as
      // soon as the optional-opening fields themselves parsed cleanly.
      when: (payload) =>
        !payload.issues.some((issue) =>
          OPTIONAL_OPENINGS.some(
            ({ height, width }) => issue.path?.[0] === height || issue.path?.[0] === width,
          ),
        ),
    },
  );

export type ZaluzjeFormInput = z.input<typeof zaluzjeFormSchema>;
export type ZaluzjeFormData = z.output<typeof zaluzjeFormSchema>;
