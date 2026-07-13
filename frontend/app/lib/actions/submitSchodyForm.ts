'use server';

import { z } from 'zod';
import { SCHODY_DIMENSIONS, schodyFormSchema } from '@/app/lib/validations/schodyForm';

/**
 * Reconstructs a plain object from the multipart FormData so it can be validated
 * against `schodyFormSchema`. Booleans compare against the `'true'` string the
 * client appends; the dimension inputs stay as strings (the schema coerces).
 */
function formDataToObject(formData: FormData) {
  return {
    isInsulated: formData.get('isInsulated') ?? undefined,
    dimA: formData.get('dimA') ?? undefined,
    dimB: formData.get('dimB') ?? undefined,
    dimC: formData.get('dimC') ?? undefined,
    dimD: formData.get('dimD') ?? undefined,
    dimE: formData.get('dimE') ?? undefined,
    dimH: formData.get('dimH') ?? undefined,
    dimh: formData.get('dimh') ?? undefined,
    postalCode: formData.get('postalCode') ?? '',
    name: formData.get('name') ?? '',
    phone: formData.get('phone') ?? '',
    email: formData.get('email') ?? '',
    notes: formData.get('notes') ?? undefined,
    consentRodo: formData.get('consentRodo') === 'true',
    consentMarketing: formData.get('consentMarketing') === 'true',
  };
}

export async function submitSchodyForm(formData: FormData) {
  const result = schodyFormSchema.safeParse(formDataToObject(formData));

  if (!result.success) {
    return { success: false as const, errors: z.flattenError(result.error) };
  }

  const data = result.data;
  const photos = formData.getAll('photo').filter((f): f is File => f instanceof File);
  const dimensions = Object.fromEntries(
    SCHODY_DIMENSIONS.map((dim) => [dim.logLabel, data[dim.name]]),
  );

  // TODO: Replace with Resend HTML email (future spec)
  console.log('=== FORMULARZ WYCENY SCHODÓW ===');
  console.log('Budynek ocieplony:', data.isInsulated);
  console.log('Wymiary:', dimensions);
  console.log('Kontakt:', { name: data.name, phone: data.phone, email: data.email });
  console.log('Kod pocztowy:', data.postalCode);
  console.log('Uwagi:', data.notes);
  console.log(
    'Zdjęcia:',
    photos.map((f) => `${f.name} (${Math.round(f.size / 1024)} KB)`),
  );
  console.log('Zgody:', { rodo: data.consentRodo, marketing: data.consentMarketing });
  console.log('================================');

  return { success: true as const };
}
