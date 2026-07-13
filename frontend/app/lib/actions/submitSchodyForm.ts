'use server';

import { z } from 'zod';

import { photosToAttachments } from '@/app/lib/email/attachments';
import { renderQuoteEmail, type Section } from '@/app/lib/email/renderQuoteEmail';
import { sendQuoteEmails } from '@/app/lib/email/sendQuoteEmails';
import { SCHODY_DIMENSIONS, schodyFormSchema } from '@/app/lib/validations/schodyForm';
import { client } from '@/sanity/lib/client';
import { schodyFormConfigQuery } from '@/sanity/lib/queries';
import { urlForImage } from '@/sanity/lib/utils';

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

/** The measurement diagram the customer's dimensions refer to, straight from the CMS. */
async function resolveDiagram() {
  const config = await client.fetch(schodyFormConfigQuery);
  if (!config?.diagram?.asset) return undefined;

  const url = urlForImage(config.diagram).width(600).fit('max').url();
  if (!url) return undefined;

  return { url, caption: 'Rysunek, do którego odnoszą się wymiary poniżej' };
}

export async function submitSchodyForm(formData: FormData) {
  const result = schodyFormSchema.safeParse(formDataToObject(formData));

  if (!result.success) {
    return { success: false as const, errors: z.flattenError(result.error) };
  }

  const data = result.data;
  const photos = formData.getAll('photo').filter((f): f is File => f instanceof File);
  const { attachments, skipped, filenames } = await photosToAttachments(photos);
  const diagram = await resolveDiagram();

  const sections: Section[] = [
    {
      title: 'Schody',
      rows: [
        { label: 'Budynek ocieplony', value: data.isInsulated },
        ...SCHODY_DIMENSIONS.map((dim) => ({
          label: `${dim.logLabel} [cm]`,
          value: data[dim.name],
        })),
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
        { label: 'Zgoda marketingowa', value: data.consentMarketing },
      ],
    },
  ];

  const email = await sendQuoteEmails({
    subject: `Wycena schodów — ${data.name}`,
    html: renderQuoteEmail({
      heading: 'Formularz wyceny schodów',
      sections,
      diagram,
      warning: skipped
        ? 'Zdjęcia przekroczyły limit załączników i nie zostały dołączone — poproś klienta o przesłanie ich mailem.'
        : undefined,
    }),
    attachments: diagram
      ? [...attachments, { filename: 'rysunek-schodow.png', path: diagram.url }]
      : attachments,
    customer: { name: data.name, email: data.email },
    formLabel: 'formularza wyceny schodów',
  });

  if (!email.ok) {
    return { success: false as const, error: email.error };
  }

  return { success: true as const };
}
