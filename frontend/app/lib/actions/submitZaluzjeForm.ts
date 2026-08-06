'use server';

import { z } from 'zod';

import { photosToAttachments } from '@/app/lib/email/attachments';
import { renderQuoteEmail, type Section } from '@/app/lib/email/renderQuoteEmail';
import { sendQuoteEmails } from '@/app/lib/email/sendQuoteEmails';
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
  };
}

export async function submitZaluzjeForm(formData: FormData) {
  const result = zaluzjeFormSchema.safeParse(formDataToObject(formData));

  if (!result.success) {
    return { success: false as const, errors: z.flattenError(result.error) };
  }

  const data = result.data;
  const photos = formData.getAll('photo').filter((f): f is File => f instanceof File);
  const { attachments, skipped, filenames } = await photosToAttachments(photos);

  const sections: Section[] = [
    {
      title: 'Żaluzje tarasowe',
      rows: [
        { label: 'Wysokość otworu [cm]', value: data.openingHeight },
        { label: 'Szerokość otworu [cm]', value: data.openingWidth },
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
    subject: `Wycena żaluzji — ${data.name ?? data.email}`,
    html: renderQuoteEmail({
      heading: 'Formularz wyceny żaluzji',
      sections,
      warning: skipped
        ? 'Zdjęcia przekroczyły limit załączników i nie zostały dołączone — poproś klienta o przesłanie ich mailem.'
        : undefined,
    }),
    attachments,
    // `renderConfirmationEmail` degrades to a nameless „Dzień dobry!" on an empty string.
    customer: { name: data.name ?? '', email: data.email },
    formLabel: 'formularza wyceny żaluzji',
  });

  if (!email.ok) {
    return { success: false as const, error: email.error };
  }

  return { success: true as const };
}
