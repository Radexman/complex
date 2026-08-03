import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SendQuoteEmailsOptions } from '@/app/lib/email/sendQuoteEmails';
import { sendQuoteEmails } from '@/app/lib/email/sendQuoteEmails';
import { CONTACT_SUBJECTS } from '@/app/lib/validations/contactForm';
import { submitContactForm } from './submitContactForm';

vi.mock('@/app/lib/email/sendQuoteEmails', () => ({
  sendQuoteEmails: vi.fn(async () => ({ ok: true })),
}));

const sendMock = vi.mocked(sendQuoteEmails);

/** The options the action passed to the email layer on its last call. */
function lastEmail(): SendQuoteEmailsOptions {
  const call = sendMock.mock.calls.at(-1);
  if (!call) throw new Error('sendQuoteEmails was not called');
  return call[0];
}

interface FormValues {
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  message?: string;
  consentRodo?: string;
  consentMarketing?: string;
}

function buildFormData(values: FormValues = {}): FormData {
  const {
    name = 'Jan Kowalski',
    phone = '123456789',
    email = 'jan@example.com',
    subject = CONTACT_SUBJECTS[0],
    message = 'Chciałbym zapytać o zadaszenie tarasu.',
    consentRodo = 'true',
    consentMarketing = 'false',
  } = values;

  const formData = new FormData();
  formData.append('name', name);
  formData.append('phone', phone);
  formData.append('email', email);
  formData.append('subject', subject);
  formData.append('message', message);
  formData.append('consentRodo', consentRodo);
  formData.append('consentMarketing', consentMarketing);
  return formData;
}

beforeEach(() => {
  sendMock.mockClear();
  sendMock.mockResolvedValue({ ok: true });
});

describe('submitContactForm', () => {
  it('sends the email and reports success for a valid submission', async () => {
    const result = await submitContactForm(buildFormData());

    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('returns field errors and sends nothing when validation fails', async () => {
    const result = await submitContactForm(buildFormData({ email: 'nope', consentRodo: 'false' }));

    expect(result.success).toBe(false);
    expect(result.errors?.fieldErrors.email).toBeDefined();
    expect(result.errors?.fieldErrors.consentRodo).toBeDefined();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('lets the company reply straight to the sender', async () => {
    await submitContactForm(buildFormData({ email: 'anna@example.com', name: 'Anna Nowak' }));

    expect(lastEmail().customer).toEqual({ name: 'Anna Nowak', email: 'anna@example.com' });
  });

  it('puts the sender name in the subject line', async () => {
    await submitContactForm(buildFormData({ name: 'Anna Nowak' }));

    expect(lastEmail().subject).toBe('Formularz kontaktowy — Anna Nowak');
  });

  it('includes the subject and message body in the email', async () => {
    await submitContactForm(
      buildFormData({ subject: CONTACT_SUBJECTS[1], message: 'Pytanie o termin montażu.' }),
    );

    const { html } = lastEmail();
    expect(html).toContain(CONTACT_SUBJECTS[1]);
    expect(html).toContain('Pytanie o termin montażu.');
  });

  it('sends no attachments — the contact form has no upload', async () => {
    await submitContactForm(buildFormData());

    expect(lastEmail().attachments).toEqual([]);
  });

  it('surfaces a failed send as an error instead of reporting success', async () => {
    sendMock.mockResolvedValue({ ok: false, error: 'Nie udało się wysłać zapytania.' });

    const result = await submitContactForm(buildFormData());

    expect(result.success).toBe(false);
    expect(result.error).toBe('Nie udało się wysłać zapytania.');
  });
});
