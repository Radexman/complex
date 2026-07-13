'use server';

import { z } from 'zod';
import { zaluzjeFormSchema } from '@/app/lib/validations/zaluzjeForm';

/**
 * Reconstructs a plain object from the multipart FormData so it can be validated
 * against `zaluzjeFormSchema`. Booleans compare against the `'true'` string the
 * client appends; the dimension inputs stay as strings (the schema coerces).
 */
function formDataToObject(formData: FormData) {
  return {
    openingHeight: formData.get('openingHeight') ?? undefined,
    openingWidth: formData.get('openingWidth') ?? undefined,
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

export async function submitZaluzjeForm(formData: FormData) {
  const result = zaluzjeFormSchema.safeParse(formDataToObject(formData));

  if (!result.success) {
    return { success: false as const, errors: z.flattenError(result.error) };
  }

  const data = result.data;
  const photos = formData.getAll('photo').filter((f): f is File => f instanceof File);

  // TODO: Replace with Resend HTML email (future spec)
  console.log('=== FORMULARZ WYCENY ŻALUZJI ===');
  console.log('Wymiary otworu:', { wysokość: data.openingHeight, szerokość: data.openingWidth });
  console.log('Montaż:', data.installationService);
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
