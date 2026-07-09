'use server';

import { z } from 'zod';
import { ALL_SIDES, tarasFormSchema } from '@/app/lib/validations/tarasForm';

/**
 * Reconstructs a plain object from the multipart FormData so it can be validated
 * against `tarasFormSchema`. Array fields use `getAll`, booleans compare against
 * the `'true'` string the client appends, and dimension inputs stay as strings
 * (the schema coerces them).
 */
function formDataToObject(formData: FormData) {
  const dimensions = Object.fromEntries(
    ALL_SIDES.map((side) => [`side${side}`, formData.get(`side${side}`) ?? undefined]),
  );

  return {
    shape: formData.get('shape') ?? undefined,
    ...dimensions,
    requiredSides: formData.getAll('requiredSides').map(String),
    buildingPosition: formData.getAll('buildingPosition').map(String),
    material: formData.get('material') ?? '',
    installationService: formData.get('installationService') === 'true',
    postalCode: formData.get('postalCode') ?? '',
    name: formData.get('name') ?? '',
    phone: formData.get('phone') ?? '',
    email: formData.get('email') ?? '',
    notes: formData.get('notes') ?? undefined,
    consentRodo: formData.get('consentRodo') === 'true',
    consentMarketing: formData.get('consentMarketing') === 'true',
  };
}

export async function submitTarasForm(formData: FormData) {
  const result = tarasFormSchema.safeParse(formDataToObject(formData));

  if (!result.success) {
    return { success: false as const, errors: z.flattenError(result.error) };
  }

  const data = result.data;
  const photos = formData.getAll('photo').filter((f): f is File => f instanceof File);

  // TODO: Replace with Resend HTML email (future spec)
  console.log('=== FORMULARZ WYCENY TARASU ===');
  console.log('Kształt:', data.shape);
  console.log('Wymiary:', {
    A: data.sideA,
    B: data.sideB,
    C: data.sideC,
    D: data.sideD,
    E: data.sideE,
    F: data.sideF,
    G: data.sideG,
    H: data.sideH,
  });
  console.log('Położenie budynku:', data.buildingPosition);
  console.log('Materiał:', data.material);
  console.log('Montaż:', data.installationService);
  console.log('Kontakt:', { name: data.name, phone: data.phone, email: data.email });
  console.log('Kod pocztowy:', data.postalCode);
  console.log('Uwagi:', data.notes);
  console.log(
    'Zdjęcia:',
    photos.map((f) => `${f.name} (${Math.round(f.size / 1024)} KB)`),
  );
  console.log('Zgody:', { rodo: data.consentRodo, marketing: data.consentMarketing });
  console.log('===============================');

  return { success: true as const };
}
