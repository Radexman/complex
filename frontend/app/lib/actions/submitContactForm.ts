'use server';

import { z } from 'zod';

import { renderQuoteEmail, type Section } from '@/app/lib/email/renderQuoteEmail';
import { sendQuoteEmails } from '@/app/lib/email/sendQuoteEmails';
import { contactFormSchema } from '@/app/lib/validations/contactForm';

/**
 * Reconstructs a plain object from the multipart FormData so it can be validated
 * against `contactFormSchema`. Booleans compare against the `'true'` string the
 * client appends.
 */
function formDataToObject(formData: FormData) {
  return {
    name: formData.get('name') ?? '',
    phone: formData.get('phone') ?? '',
    email: formData.get('email') ?? '',
    subject: formData.get('subject') ?? '',
    message: formData.get('message') ?? '',
    consentRodo: formData.get('consentRodo') === 'true',
    consentMarketing: formData.get('consentMarketing') === 'true',
  };
}

export async function submitContactForm(formData: FormData) {
  const result = contactFormSchema.safeParse(formDataToObject(formData));

  if (!result.success) {
    return { success: false as const, errors: z.flattenError(result.error) };
  }

  const data = result.data;

  const sections: Section[] = [
    {
      title: 'Kontakt',
      rows: [
        { label: 'Imię i nazwisko', value: data.name },
        { label: 'Telefon', value: data.phone },
        { label: 'E-mail', value: data.email },
      ],
    },
    {
      title: 'Wiadomość',
      rows: [
        { label: 'Temat', value: data.subject },
        { label: 'Treść', value: data.message },
      ],
    },
    {
      title: 'Zgody',
      rows: [
        { label: 'Zgoda RODO', value: data.consentRodo },
        { label: 'Zgoda marketingowa', value: data.consentMarketing },
      ],
    },
  ];

  const email = await sendQuoteEmails({
    subject: `Formularz kontaktowy — ${data.name}`,
    html: renderQuoteEmail({ heading: 'Formularz kontaktowy', sections }),
    attachments: [],
    customer: { name: data.name, email: data.email },
    formLabel: 'formularza kontaktowego',
  });

  if (!email.ok) {
    return { success: false as const, error: email.error };
  }

  return { success: true as const };
}
