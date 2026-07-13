import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SendQuoteEmailsOptions } from '@/app/lib/email/sendQuoteEmails';
import { sendQuoteEmails } from '@/app/lib/email/sendQuoteEmails';
import { submitSchodyForm } from './submitSchodyForm';

vi.mock('@/app/lib/email/sendQuoteEmails', () => ({
  sendQuoteEmails: vi.fn(async () => ({ ok: true })),
}));

// Stubbed so the action's diagram lookup needs neither a Sanity project nor env vars.
vi.mock('@/sanity/lib/client', () => ({ client: { fetch: vi.fn(async () => null) } }));
vi.mock('@/sanity/lib/utils', () => ({
  urlForImage: () => ({ width: () => ({ fit: () => ({ url: () => 'https://cdn/rysunek.png' }) }) }),
}));

const sendMock = vi.mocked(sendQuoteEmails);

/** The options the action passed to the email layer on its last call. */
function lastEmail(): SendQuoteEmailsOptions {
  const call = sendMock.mock.calls.at(-1);
  if (!call) throw new Error('sendQuoteEmails was not called');
  return call[0];
}

interface FormValues {
  isInsulated?: string;
  dimA?: string;
  dimB?: string;
  dimC?: string;
  dimD?: string;
  dimE?: string;
  dimH?: string;
  dimh?: string;
  postalCode?: string;
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  consentRodo?: string;
  consentMarketing?: string;
  photos?: File[];
}

function buildFormData(values: FormValues = {}): FormData {
  const {
    isInsulated = 'tak',
    dimA = '100',
    dimB = '250',
    dimC = '30',
    dimD = '320',
    dimE = '70',
    dimH = '290',
    dimh = '260',
    postalCode = '44-100',
    name = 'Jan Kowalski',
    phone = '123456789',
    email = 'jan@example.com',
    notes,
    consentRodo = 'true',
    consentMarketing = 'false',
    photos = [],
  } = values;

  const formData = new FormData();
  formData.append('isInsulated', isInsulated);
  formData.append('dimA', dimA);
  formData.append('dimB', dimB);
  formData.append('dimC', dimC);
  formData.append('dimD', dimD);
  formData.append('dimE', dimE);
  formData.append('dimH', dimH);
  formData.append('dimh', dimh);
  formData.append('postalCode', postalCode);
  formData.append('name', name);
  formData.append('phone', phone);
  formData.append('email', email);
  if (notes !== undefined) formData.append('notes', notes);
  formData.append('consentRodo', consentRodo);
  formData.append('consentMarketing', consentMarketing);
  for (const photo of photos) {
    formData.append('photo', photo);
  }
  return formData;
}

beforeEach(() => {
  sendMock.mockResolvedValue({ ok: true });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('submitSchodyForm', () => {
  it('returns success and sends the quote email for a valid submission', async () => {
    const result = await submitSchodyForm(buildFormData());

    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(lastEmail().subject).toContain('Jan Kowalski');
    expect(lastEmail().customer).toEqual({ name: 'Jan Kowalski', email: 'jan@example.com' });
  });

  it('sends every dimension under its diagram label', async () => {
    await submitSchodyForm(buildFormData({ dimA: '120', dimH: '295', dimh: '265' }));
    const { html } = lastEmail();

    expect(html).toContain('A — szerokość otworu [cm]');
    expect(html).toContain('>120<');
    // H and h are distinct measurements — both must survive the round-trip.
    expect(html).toContain('>295<');
    expect(html).toContain('>265<');
  });

  it('passes the insulation answer through', async () => {
    await submitSchodyForm(buildFormData({ isInsulated: 'nie' }));
    expect(lastEmail().html).toContain('nie');
  });

  it('fails and returns field errors when the dimensions are missing', async () => {
    const result = await submitSchodyForm(buildFormData({ dimA: '', dimh: '' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.dimA).toBeDefined();
      expect(result.errors?.fieldErrors.dimh).toBeDefined();
      expect(result.errors?.fieldErrors.dimH).toBeUndefined();
    }
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('fails when the insulation answer is missing', async () => {
    const formData = buildFormData();
    formData.delete('isInsulated');
    const result = await submitSchodyForm(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.isInsulated).toBeDefined();
    }
  });

  it('fails when the RODO consent is not accepted', async () => {
    const result = await submitSchodyForm(buildFormData({ consentRodo: 'false' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.consentRodo).toBeDefined();
    }
  });

  it('fails on an invalid postal code', async () => {
    const result = await submitSchodyForm(buildFormData({ postalCode: '44100' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.postalCode).toBeDefined();
    }
  });

  it('attaches the uploaded photos and lists them in the email', async () => {
    const photo = new File(['x'], 'schody.jpg', { type: 'image/jpeg' });
    await submitSchodyForm(buildFormData({ photos: [photo] }));

    expect(lastEmail().attachments).toEqual([expect.objectContaining({ filename: 'schody.jpg' })]);
    expect(lastEmail().html).toContain('schody.jpg');
  });

  it('surfaces a failed send as an error instead of a silent success', async () => {
    sendMock.mockResolvedValue({ ok: false, error: 'Nie udało się wysłać zapytania.' });
    const result = await submitSchodyForm(buildFormData());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Nie udało się wysłać zapytania.');
    }
  });
});
