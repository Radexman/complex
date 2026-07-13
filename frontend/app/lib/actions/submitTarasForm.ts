'use server';

import { stegaClean } from 'next-sanity';
import { z } from 'zod';

import { photosToAttachments } from '@/app/lib/email/attachments';
import { renderQuoteEmail, type Section } from '@/app/lib/email/renderQuoteEmail';
import { sendQuoteEmails } from '@/app/lib/email/sendQuoteEmails';
import { ALL_SIDES, tarasFormSchema } from '@/app/lib/validations/tarasForm';
import { client } from '@/sanity/lib/client';
import { tarasFormConfigQuery } from '@/sanity/lib/queries';
import { urlForImage } from '@/sanity/lib/utils';

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

/**
 * Resolves the diagram of the shape the customer picked, from the CMS rather than
 * from the submission — a client-supplied image URL is not something to forward
 * into an email.
 */
async function resolveShapeDiagram(shape: string) {
  const config = await client.fetch(tarasFormConfigQuery);
  const selected = config?.shapes?.find((s) => String(stegaClean(s.shapeNumber)) === shape);

  if (!selected?.image?.asset) return undefined;

  const url = urlForImage(selected.image).width(600).fit('max').url();
  if (!url) return undefined;

  const label = stegaClean(selected.label);
  return { url, caption: label ? `Kształt ${shape} — ${label}` : `Kształt ${shape}` };
}

export async function submitTarasForm(formData: FormData) {
  const result = tarasFormSchema.safeParse(formDataToObject(formData));

  if (!result.success) {
    return { success: false as const, errors: z.flattenError(result.error) };
  }

  const data = result.data;
  const photos = formData.getAll('photo').filter((f): f is File => f instanceof File);
  const { attachments, skipped, filenames } = await photosToAttachments(photos);
  const diagram = await resolveShapeDiagram(data.shape);

  const sections: Section[] = [
    {
      title: 'Taras',
      rows: [
        { label: 'Kształt', value: data.shape },
        ...ALL_SIDES.map((side) => ({
          label: `Bok ${side} [m]`,
          value: data[`side${side}` as keyof typeof data] as number | undefined,
        })),
        { label: 'Położenie budynku', value: data.buildingPosition },
        { label: 'Materiał', value: data.material },
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
        { label: 'Zgoda marketingowa', value: data.consentMarketing },
      ],
    },
  ];

  const email = await sendQuoteEmails({
    subject: `Wycena tarasu — ${data.name}`,
    html: renderQuoteEmail({
      heading: 'Formularz wyceny tarasu',
      sections,
      diagram,
      warning: skipped
        ? 'Zdjęcia przekroczyły limit załączników i nie zostały dołączone — poproś klienta o przesłanie ich mailem.'
        : undefined,
    }),
    attachments: diagram
      ? [...attachments, { filename: 'ksztalt.png', path: diagram.url }]
      : attachments,
    customer: { name: data.name, email: data.email },
    formLabel: 'formularza wyceny tarasu',
  });

  if (!email.ok) {
    return { success: false as const, error: email.error };
  }

  return { success: true as const };
}
