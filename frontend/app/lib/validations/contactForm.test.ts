import { describe, expect, it } from 'vitest';

import { contactFormSchema } from './contactForm';

interface Overrides {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  message?: unknown;
  consentRodo?: unknown;
  consentMarketing?: unknown;
}

function validInput(overrides: Overrides = {}) {
  return {
    name: 'Jan Kowalski',
    phone: '123456789',
    email: 'jan@example.com',
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

  it('accepts a submission with only an email, a message and the RODO consent', () => {
    const result = contactFormSchema.safeParse(validInput({ name: '', phone: '' }));

    expect(result.success).toBe(true);
    // Blank optional fields arrive as absent, not as empty strings.
    expect(result.data?.name).toBeUndefined();
    expect(result.data?.phone).toBeUndefined();
  });

  it('treats a whitespace-only name or phone as absent', () => {
    const result = contactFormSchema.safeParse(validInput({ name: '   ', phone: '  ' }));

    expect(result.success).toBe(true);
    expect(result.data?.name).toBeUndefined();
    expect(result.data?.phone).toBeUndefined();
  });

  it('still validates a name that was typed', () => {
    expect(fieldError({ name: 'J' }, 'name')).toBe('Podaj swoje imię i nazwisko');
  });

  it('still validates a phone number that was typed', () => {
    expect(fieldError({ phone: '12345' }, 'phone')).toBe('Podaj numer telefonu');
  });

  it('rejects a malformed email', () => {
    expect(fieldError({ email: 'jan@' }, 'email')).toBe('Podaj poprawny adres e-mail');
  });

  it('requires the email — it is the only guaranteed reply channel', () => {
    expect(fieldError({ email: '' }, 'email')).toBe('Podaj poprawny adres e-mail');
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
