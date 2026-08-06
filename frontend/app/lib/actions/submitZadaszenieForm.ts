'use server';

import { z } from 'zod';

import { photosToAttachments } from '@/app/lib/email/attachments';
import { renderQuoteEmail, type Section } from '@/app/lib/email/renderQuoteEmail';
import { sendQuoteEmails } from '@/app/lib/email/sendQuoteEmails';
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
    canopyType: formData.get('canopyType') ?? '',
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
  };
}

export async function submitZadaszenieForm(formData: FormData) {
  const result = zadaszenieFormSchema.safeParse(formDataToObject(formData));

  if (!result.success) {
    return { success: false as const, errors: z.flattenError(result.error) };
  }

  const data = result.data;
  const photos = formData.getAll('photo').filter((f): f is File => f instanceof File);
  const { attachments, skipped, filenames } = await photosToAttachments(photos);

  // Sent as Polish labels rather than twelve booleans — it reads as a shopping list.
  const equipment = EQUIPMENT_OPTIONS.filter((option) => data[option.name]).map(
    (option) => option.label,
  );

  const sections: Section[] = [
    {
      title: 'Zadaszenie',
      rows: [
        { label: 'Rodzaj zadaszenia', value: data.canopyType },
        { label: 'Rodzaj dachu', value: data.roofType },
        { label: 'Kolor konstrukcji', value: data.frameColor },
        { label: 'Szerokość [m]', value: data.width },
        { label: 'Głębokość [m]', value: data.depth },
        { label: 'Wyposażenie dodatkowe', value: equipment },
        { label: 'Żaluzje tarasowe', value: data.terraceBlinds },
        { label: 'Usługa montażu', value: data.installationService },
      ],
    },
    {
      title: 'Kontakt',
      rows: [
        { label: 'Imię i nazwisko', value: data.name },
        { label: 'Telefon', value: data.phone },
        { label: 'E-mail', value: data.email },
        { label: 'Kod pocztowy', value: data.postalCode },
      ],
    },
    {
      title: 'Dodatkowe',
      rows: [
        { label: 'Uwagi', value: data.notes },
        { label: 'Zdjęcia', value: filenames },
        { label: 'Zgoda RODO', value: data.consentRodo },
      ],
    },
  ];

  const email = await sendQuoteEmails({
    // The name is optional, so the address identifies the sender when it's absent.
    subject: `Wycena zadaszenia — ${data.name ?? data.email}`,
    html: renderQuoteEmail({
      heading: 'Formularz wyceny zadaszenia',
      sections,
      warning: skipped
        ? 'Zdjęcia przekroczyły limit załączników i nie zostały dołączone — poproś klienta o przesłanie ich mailem.'
        : undefined,
    }),
    attachments,
    // `renderConfirmationEmail` degrades to a nameless „Dzień dobry!" on an empty string.
    customer: { name: data.name ?? '', email: data.email },
    formLabel: 'formularza wyceny zadaszenia',
  });

  if (!email.ok) {
    return { success: false as const, error: email.error };
  }

  return { success: true as const };
}
