import { z } from 'zod';

/**
 * Fallback map of the side letters required per terrace shape, used only when a
 * submission does not carry its own `requiredSides` (e.g. a direct server call).
 * The real source of truth is each `tarasShape.sides` in Sanity — the form sends
 * the selected shape's CMS sides as `requiredSides`, and validation enforces
 * exactly those, so the rendered inputs and the validation can never diverge.
 */
export const REQUIRED_SIDES: Record<string, string[]> = {
  '1': ['A', 'B'],
  '2': ['A', 'B', 'C', 'D', 'E', 'F'],
  '3': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  '4': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
};

/** All possible side letters, in order. */
export const ALL_SIDES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;

/**
 * A single dimension input. Empty strings (untouched inputs) become `undefined`
 * so optional sides don't fail the positive check; present values are coerced
 * to a positive number.
 */
const optionalDimension = z.preprocess(
  (value) => (value === '' || value === undefined || value === null ? undefined : value),
  z.coerce.number().positive('Podaj dodatnią wartość').optional(),
);

export const tarasFormSchema = z
  .object({
    // Shape & dimensions
    shape: z.enum(['1', '2', '3', '4'], { error: 'Wybierz kształt tarasu' }),
    sideA: optionalDimension,
    sideB: optionalDimension,
    sideC: optionalDimension,
    sideD: optionalDimension,
    sideE: optionalDimension,
    sideF: optionalDimension,
    sideG: optionalDimension,
    sideH: optionalDimension,

    // Building position — the sides where a wall of the building adjoins the terrace
    buildingPosition: z.array(z.string()).min(1, 'Określ położenie budynku'),

    // Product options
    material: z.string().min(1, 'Wybierz materiał tarasowy'),
    installationService: z.boolean(),

    // Contact & location
    postalCode: z
      .string()
      .min(6, 'Podaj kod pocztowy')
      .regex(/^\d{2}-\d{3}$/, 'Format: 00-000'),
    name: z.string().min(2, 'Podaj swoje imię i nazwisko'),
    phone: z.string().min(9, 'Podaj numer telefonu'),
    email: z.email('Podaj poprawny adres e-mail'),

    // Which sides the selected shape actually has — sent by the form from the
    // shape's CMS `sides`, so validation matches exactly the rendered inputs.
    requiredSides: z.array(z.string()).optional(),

    // Notes & photo
    notes: z.string().optional(),
    photo: z.any().optional(), // File objects, validated separately in the component

    // Consents
    consentRodo: z.boolean().refine((val) => val === true, {
      message: 'Zgoda jest wymagana',
    }),
    consentMarketing: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const required =
      data.requiredSides && data.requiredSides.length > 0
        ? data.requiredSides
        : REQUIRED_SIDES[data.shape];
    if (!required) return;

    for (const side of required) {
      const key = `side${side}` as keyof typeof data;
      const value = data[key];
      if (typeof value !== 'number' || !(value > 0)) {
        ctx.addIssue({
          code: 'custom',
          message: `Podaj długość boku ${side}`,
          path: [key],
        });
      }
    }
  });

export type TarasFormInput = z.input<typeof tarasFormSchema>;
export type TarasFormData = z.output<typeof tarasFormSchema>;
