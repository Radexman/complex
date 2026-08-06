import { z } from 'zod';

import { optionalText } from './optionalText';

/**
 * How the structure stands. Split out of the old combined „rodzaj zadaszenia"
 * list at the client's request — the model and the roof filling are two
 * independent choices, and one select of seven long labels read poorly.
 */
export const CANOPY_TYPES = ['Przyścienny', 'Wolnostojący'] as const;

/** What the roof is filled with. */
export const ROOF_TYPES = [
  'Poliwęglan',
  'Szkło',
  'Lamele aluminiowe',
  'Materiał',
  'Roleta rzymska',
] as const;

/** Available frame colours. */
export const FRAME_COLORS = ['antracyt', 'czarny', 'biały'] as const;

/**
 * The optional add-ons, keyed by form field. Rendered as a checkbox group in
 * this order and logged back out under the same labels by the server action.
 */
export const EQUIPMENT_OPTIONS = [
  { name: 'equipWedgePoly', label: 'Klin boczny, poliwęglan w ramie alum. (kpl/2szt)' },
  { name: 'equipWedgeGlass', label: 'Klin boczny, szkło w ramie alum. (kpl/2szt)' },
  { name: 'equipLedLighting', label: 'Oświetlenie punktowe LED + pilot' },
  { name: 'equipPolyWallSide1', label: 'Ściana stała, poliwęglan / bok 1' },
  { name: 'equipPolyWallSide2', label: 'Ściana stała, poliwęglan / bok 2' },
  { name: 'equipPolyWallFront', label: 'Ściana stała, poliwęglan / front' },
  { name: 'equipFramelessDoorsSide1', label: 'Drzwi przesuwne, szyby bez ramek / bok 1' },
  { name: 'equipFramelessDoorsSide2', label: 'Drzwi przesuwne, szyby bez ramek / bok 2' },
  { name: 'equipFramelessDoorsFront', label: 'Drzwi przesuwne, szyby bez ramek / front' },
  { name: 'equipFramedDoorsSide1', label: 'Drzwi przesuwne, szyby w ramie / bok 1' },
  { name: 'equipFramedDoorsSide2', label: 'Drzwi przesuwne, szyby w ramie / bok 2' },
  { name: 'equipFramedDoorsFront', label: 'Drzwi przesuwne, szyby w ramie / front' },
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
  canopyType: z.string().min(1, 'Wybierz rodzaj zadaszenia'),
  roofType: z.string().min(1, 'Wybierz rodzaj dachu'),
  frameColor: z.string().min(1, 'Wybierz kolor konstrukcji'),
  width: dimension(20, 'Podaj szerokość zadaszenia', 'Maksymalna szerokość to 20 m'),
  // Capped at 6 m by the client — that is the deepest canopy they build.
  depth: dimension(6, 'Podaj głębokość zadaszenia', 'Maksymalna głębokość to 6 m'),

  // Additional equipment — all optional, any combination
  equipWedgePoly: z.boolean(),
  equipWedgeGlass: z.boolean(),
  equipLedLighting: z.boolean(),
  equipPolyWallSide1: z.boolean(),
  equipPolyWallSide2: z.boolean(),
  equipPolyWallFront: z.boolean(),
  equipFramelessDoorsSide1: z.boolean(),
  equipFramelessDoorsSide2: z.boolean(),
  equipFramelessDoorsFront: z.boolean(),
  equipFramedDoorsSide1: z.boolean(),
  equipFramedDoorsSide2: z.boolean(),
  equipFramedDoorsFront: z.boolean(),

  // Terrace blinds — free-text opening dimensions, optional
  terraceBlinds: z.string().optional(),

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
});

export type ZadaszenieFormInput = z.input<typeof zadaszenieFormSchema>;
export type ZadaszenieFormData = z.output<typeof zadaszenieFormSchema>;
