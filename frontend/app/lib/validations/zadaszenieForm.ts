import { z } from 'zod';

/** Roof models offered, in the order the client lists them. */
export const ROOF_TYPES = [
  'Dach stały poliwęglan, model przyścienny, ALUM /wym. standardowe i na wymiar',
  'Dach stały poliwęglan, model wolnostojący, ALUM /wym. standardowe i na wymiar',
  'Dach z lameli, model przyścienny Pinela, ALUM /wym. standardowe',
  'Dach z lameli, model wolnostojący Pinela, ALUM /wym. standardowe',
  'Dach z materiałem, model przyścienny Verdeca, ALUM /wym. standardowe',
  'Dach z roletą rzymską, model przyścienny Ekonomiczny, ALUM /wym. standardowe',
  'Dach z roletą rzymską, model wolnostojący Ekonomiczny, ALUM /wym. standardowe',
] as const;

/** Available frame colours. */
export const FRAME_COLORS = ['antracyt', 'czarny', 'biały krem'] as const;

/**
 * The optional add-ons, keyed by form field. Rendered as a checkbox group in
 * this order and logged back out under the same labels by the server action.
 */
export const EQUIPMENT_OPTIONS = [
  { name: 'equipTriangleSide', label: 'Trójkąt boczny, poliwęglan (kpl/2szt)' },
  { name: 'equipLedLighting', label: 'Oświetlenie punktowe LED + pilot' },
  { name: 'equipPolyWallFixedRight', label: 'Poliwęglan, ściana stała / prawa strona' },
  { name: 'equipPolyWallFixedLeft', label: 'Poliwęglan, ściana stała / lewa strona' },
  {
    name: 'equipGlasslessDoorsSlidingRight',
    label: 'Szyby bezramowe, drzwi przesuwne / prawa strona',
  },
  {
    name: 'equipGlasslessDoorsSlidingLeft',
    label: 'Szyby bezramowe, drzwi przesuwne / lewa strona',
  },
  { name: 'equipGlasslessDoorsSlidingFront', label: 'Szyby bezramowe, drzwi przesuwne / front' },
] as const;

export type EquipmentField = (typeof EQUIPMENT_OPTIONS)[number]['name'];

/**
 * A dimension input. Empty strings (untouched inputs) become `undefined` so the
 * required-field message wins over a coercion error; present values are coerced
 * to a number and range-checked.
 */
function dimension(max: number, requiredMessage: string, maxMessage: string) {
  return z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number({ error: requiredMessage }).positive(requiredMessage).max(max, maxMessage),
  );
}

export const zadaszenieFormSchema = z.object({
  // Product config
  roofType: z.string().min(1, 'Wybierz rodzaj zadaszenia'),
  frameColor: z.string().min(1, 'Wybierz kolor konstrukcji'),
  width: dimension(20, 'Podaj szerokość zadaszenia', 'Maksymalna szerokość to 20 m'),
  depth: dimension(10, 'Podaj głębokość zadaszenia', 'Maksymalna głębokość to 10 m'),

  // Additional equipment — all optional, any combination
  equipTriangleSide: z.boolean(),
  equipLedLighting: z.boolean(),
  equipPolyWallFixedRight: z.boolean(),
  equipPolyWallFixedLeft: z.boolean(),
  equipGlasslessDoorsSlidingRight: z.boolean(),
  equipGlasslessDoorsSlidingLeft: z.boolean(),
  equipGlasslessDoorsSlidingFront: z.boolean(),

  // Terrace blinds — free-text opening dimensions, optional
  terraceBlinds: z.string().optional(),

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

export type ZadaszenieFormInput = z.input<typeof zadaszenieFormSchema>;
export type ZadaszenieFormData = z.output<typeof zadaszenieFormSchema>;
