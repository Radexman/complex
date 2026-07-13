'use server';

import { z } from 'zod';
import { EQUIPMENT_OPTIONS, zadaszenieFormSchema } from '@/app/lib/validations/zadaszenieForm';

/**
 * Reconstructs a plain object from the multipart FormData so it can be validated
 * against `zadaszenieFormSchema`. Booleans compare against the `'true'` string
 * the client appends; the dimension inputs stay as strings (the schema coerces).
 */
function formDataToObject(formData: FormData) {
  const equipment = Object.fromEntries(
    EQUIPMENT_OPTIONS.map((option) => [option.name, formData.get(option.name) === 'true']),
  );

  return {
    roofType: formData.get('roofType') ?? '',
    frameColor: formData.get('frameColor') ?? '',
    width: formData.get('width') ?? undefined,
    depth: formData.get('depth') ?? undefined,
    ...equipment,
    terraceBlinds: formData.get('terraceBlinds') ?? undefined,
    postalCode: formData.get('postalCode') ?? '',
    name: formData.get('name') ?? '',
    phone: formData.get('phone') ?? '',
    email: formData.get('email') ?? '',
    installationService: formData.get('installationService') === 'true',
    notes: formData.get('notes') ?? undefined,
    consentRodo: formData.get('consentRodo') === 'true',
    consentMarketing: formData.get('consentMarketing') === 'true',
  };
}

export async function submitZadaszenieForm(formData: FormData) {
  const result = zadaszenieFormSchema.safeParse(formDataToObject(formData));

  if (!result.success) {
    return { success: false as const, errors: z.flattenError(result.error) };
  }

  const data = result.data;
  const photos = formData.getAll('photo').filter((f): f is File => f instanceof File);
  const equipment = EQUIPMENT_OPTIONS.filter((option) => data[option.name]).map(
    (option) => option.label,
  );

  // TODO: Replace with Resend HTML email (future spec)
  console.log('=== FORMULARZ WYCENY ZADASZENIA ===');
  console.log('Rodzaj zadaszenia:', data.roofType);
  console.log('Kolor konstrukcji:', data.frameColor);
  console.log('Wymiary:', { szerokość: data.width, głębokość: data.depth });
  console.log('Wyposażenie dodatkowe:', equipment);
  console.log('Żaluzje tarasowe:', data.terraceBlinds);
  console.log('Montaż:', data.installationService);
  console.log('Kontakt:', { name: data.name, phone: data.phone, email: data.email });
  console.log('Kod pocztowy:', data.postalCode);
  console.log('Uwagi:', data.notes);
  console.log(
    'Zdjęcia:',
    photos.map((f) => `${f.name} (${Math.round(f.size / 1024)} KB)`),
  );
  console.log('Zgody:', { rodo: data.consentRodo, marketing: data.consentMarketing });
  console.log('===================================');

  return { success: true as const };
}
