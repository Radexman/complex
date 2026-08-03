import { z } from 'zod';

/**
 * Subject options for the general contact form. Exported as the single source of
 * truth so the select and the server-side validation can't drift apart.
 */
export const CONTACT_SUBJECTS = [
  'Zapytanie ogólne o ofertę',
  'Zadaszenia tarasowe',
  'Tarasy (kompozyt, gres, drewno)',
  'Akcesoria do zadaszeń',
  'Schody modułowe',
  'Elewacje kompozytowe',
  'Pytanie o realizację / projekt',
  'Inne',
] as const;

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Podaj swoje imię i nazwisko'),
  phone: z.string().min(9, 'Podaj numer telefonu'),
  email: z.email('Podaj poprawny adres e-mail'),
  subject: z.enum(CONTACT_SUBJECTS, { error: 'Wybierz temat wiadomości' }),
  message: z.string().min(10, 'Wiadomość jest za krótka — napisz przynajmniej kilka słów'),

  consentRodo: z.boolean().refine((val) => val === true, {
    message: 'Zgoda jest wymagana',
  }),
  consentMarketing: z.boolean(),
});

export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormData = z.output<typeof contactFormSchema>;
