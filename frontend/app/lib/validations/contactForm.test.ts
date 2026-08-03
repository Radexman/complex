import { describe, expect, it } from 'vitest';

import { CONTACT_SUBJECTS, contactFormSchema } from './contactForm';

interface Overrides {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  consentRodo?: unknown;
  consentMarketing?: unknown;
}

function validInput(overrides: Overrides = {}) {
  return {
    name: 'Jan Kowalski',
    phone: '123456789',
    email: 'jan@example.com',
    subject: CONTACT_SUBJECTS[0],
    message: 'Chciałbym zapytać o zadaszenie tarasu.',
    consentRodo: true,
    consentMarketing: false,
    ...overrides,
  };
}

/** The message reported for a single field, if that field failed. */
function fieldError(overrides: Overrides, field: keyof Overrides) {
  const result = contactFormSchema.safeParse(validInput(overrides));
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

describe('contactFormSchema', () => {
  it('accepts a complete submission', () => {
    const result = contactFormSchema.safeParse(validInput());
    expect(result.success).toBe(true);
  });

  it('requires a name of at least two characters', () => {
    expect(fieldError({ name: 'J' }, 'name')).toBe('Podaj swoje imię i nazwisko');
  });

  it('requires a plausible phone number', () => {
    expect(fieldError({ phone: '12345' }, 'phone')).toBe('Podaj numer telefonu');
  });

  it('rejects a malformed email', () => {
    expect(fieldError({ email: 'jan@' }, 'email')).toBe('Podaj poprawny adres e-mail');
  });

  it('rejects a subject outside the allowed list', () => {
    expect(fieldError({ subject: 'Coś zupełnie innego' }, 'subject')).toBe(
      'Wybierz temat wiadomości',
    );
  });

  it('accepts every subject the select offers', () => {
    for (const subject of CONTACT_SUBJECTS) {
      expect(contactFormSchema.safeParse(validInput({ subject })).success).toBe(true);
    }
  });

  it('rejects a message that is too short to act on', () => {
    expect(fieldError({ message: 'Cześć' }, 'message')).toBe(
      'Wiadomość jest za krótka — napisz przynajmniej kilka słów',
    );
  });

  it('requires the RODO consent', () => {
    expect(fieldError({ consentRodo: false }, 'consentRodo')).toBe('Zgoda jest wymagana');
  });

  it('does not require the marketing consent', () => {
    expect(contactFormSchema.safeParse(validInput({ consentMarketing: false })).success).toBe(true);
  });
});
