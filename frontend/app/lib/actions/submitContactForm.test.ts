import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SendQuoteEmailsOptions } from '@/app/lib/email/sendQuoteEmails';
import { sendQuoteEmails } from '@/app/lib/email/sendQuoteEmails';
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
  message?: string;
  consentRodo?: string;
  consentMarketing?: string;
}

function buildFormData(values: FormValues = {}): FormData {
  const {
    name = 'Jan Kowalski',
    phone = '123456789',
    email = 'jan@example.com',
    message = 'Chciałbym zapytać o zadaszenie tarasu.',
    consentRodo = 'true',
    consentMarketing = 'false',
  } = values;

  const formData = new FormData();
  formData.append('name', name);
  formData.append('phone', phone);
  formData.append('email', email);
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

  it('accepts a submission with no name and no phone number', async () => {
    const result = await submitContactForm(buildFormData({ name: '', phone: '' }));

    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('lets the company reply straight to the sender', async () => {
    await submitContactForm(buildFormData({ email: 'anna@example.com', name: 'Anna Nowak' }));

    expect(lastEmail().customer).toEqual({ name: 'Anna Nowak', email: 'anna@example.com' });
  });

  it('puts the sender name in the subject line', async () => {
    await submitContactForm(buildFormData({ name: 'Anna Nowak' }));

    expect(lastEmail().subject).toBe('Formularz kontaktowy — Anna Nowak');
  });

  it('falls back to the email address in the subject line when no name was given', async () => {
    await submitContactForm(buildFormData({ name: '', email: 'anna@example.com' }));

    expect(lastEmail().subject).toBe('Formularz kontaktowy — anna@example.com');
    // An empty name keeps the customer confirmation on its nameless greeting.
    expect(lastEmail().customer).toEqual({ name: '', email: 'anna@example.com' });
  });

  it('includes the message body in the email', async () => {
    await submitContactForm(buildFormData({ message: 'Pytanie o termin montażu.' }));

    expect(lastEmail().html).toContain('Pytanie o termin montażu.');
  });

  it('omits the contact rows that were left blank', async () => {
    await submitContactForm(buildFormData({ name: '', phone: '' }));

    const { html } = lastEmail();
    expect(html).not.toContain('Imię i nazwisko');
    expect(html).not.toContain('Telefon');
    expect(html).toContain('jan@example.com');
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
