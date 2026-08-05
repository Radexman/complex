import { z } from 'zod';

import { optionalText } from './optionalText';

export const contactFormSchema = z.object({
  // Optional by client request (round 4) — visitors would not fill them in.
  name: optionalText(2, 'Podaj swoje imię i nazwisko'),
  phone: optionalText(9, 'Podaj numer telefonu'),
  // The only guaranteed way to reply now that the phone number is optional.
  email: z.email('Podaj poprawny adres e-mail'),
  message: z.string().min(10, 'Wiadomość jest za krótka — napisz przynajmniej kilka słów'),

  consentRodo: z.boolean().refine((val) => val === true, {
    message: 'Zgoda jest wymagana',
  }),
  consentMarketing: z.boolean(),
});

export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormData = z.output<typeof contactFormSchema>;
