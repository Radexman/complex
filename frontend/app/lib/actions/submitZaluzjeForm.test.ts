import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SendQuoteEmailsOptions } from '@/app/lib/email/sendQuoteEmails';
import { sendQuoteEmails } from '@/app/lib/email/sendQuoteEmails';
import { submitZaluzjeForm } from './submitZaluzjeForm';

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
  openingHeight?: string;
  openingWidth?: string;
  postalCode?: string;
  name?: string;
  phone?: string;
  email?: string;
  installationService?: string;
  notes?: string;
  consentRodo?: string;
  consentMarketing?: string;
  photos?: File[];
}

function buildFormData(values: FormValues = {}): FormData {
  const {
    openingHeight = '220',
    openingWidth = '250',
    postalCode = '44-100',
    name = 'Jan Kowalski',
    phone = '123456789',
    email = 'jan@example.com',
    installationService = 'true',
    notes,
    consentRodo = 'true',
    consentMarketing = 'false',
    photos = [],
  } = values;

  const formData = new FormData();
  formData.append('openingHeight', openingHeight);
  formData.append('openingWidth', openingWidth);
  formData.append('postalCode', postalCode);
  formData.append('name', name);
  formData.append('phone', phone);
  formData.append('email', email);
  formData.append('installationService', installationService);
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

describe('submitZaluzjeForm', () => {
  it('returns success and sends the quote email for a valid submission', async () => {
    const result = await submitZaluzjeForm(buildFormData());

    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(lastEmail().subject).toContain('Jan Kowalski');
    expect(lastEmail().customer).toEqual({ name: 'Jan Kowalski', email: 'jan@example.com' });
  });

  it('coerces the dimension strings to numbers', async () => {
    await submitZaluzjeForm(buildFormData({ openingHeight: '180', openingWidth: '300' }));
    const { html } = lastEmail();

    expect(html).toContain('>180<');
    expect(html).toContain('>300<');
  });

  it('renders the installationService boolean as Polish', async () => {
    await submitZaluzjeForm(buildFormData({ installationService: 'false' }));
    expect(lastEmail().html).toContain('Nie');
  });

  it('omits the notes row when the customer left it blank', async () => {
    await submitZaluzjeForm(buildFormData());
    expect(lastEmail().html).not.toContain('Uwagi');
  });

  it('fails and returns field errors when the dimensions are missing', async () => {
    const result = await submitZaluzjeForm(buildFormData({ openingHeight: '', openingWidth: '' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.openingHeight).toBeDefined();
      expect(result.errors?.fieldErrors.openingWidth).toBeDefined();
    }
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('fails when the height exceeds 500 cm', async () => {
    const result = await submitZaluzjeForm(buildFormData({ openingHeight: '600' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.openingHeight).toBeDefined();
    }
  });

  it('fails when the width exceeds 1000 cm', async () => {
    const result = await submitZaluzjeForm(buildFormData({ openingWidth: '1200' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.openingWidth).toBeDefined();
    }
  });

  it('fails when the RODO consent is not accepted', async () => {
    const result = await submitZaluzjeForm(buildFormData({ consentRodo: 'false' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.consentRodo).toBeDefined();
    }
  });

  it('fails on an invalid postal code', async () => {
    const result = await submitZaluzjeForm(buildFormData({ postalCode: '44100' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.postalCode).toBeDefined();
    }
  });

  it('attaches the uploaded photos and lists them in the email', async () => {
    const photo = new File(['x'], 'okno.jpg', { type: 'image/jpeg' });
    await submitZaluzjeForm(buildFormData({ photos: [photo] }));

    expect(lastEmail().attachments).toEqual([expect.objectContaining({ filename: 'okno.jpg' })]);
    expect(lastEmail().html).toContain('okno.jpg');
  });

  it('surfaces a failed send as an error instead of a silent success', async () => {
    sendMock.mockResolvedValue({ ok: false, error: 'Nie udało się wysłać zapytania.' });
    const result = await submitZaluzjeForm(buildFormData());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Nie udało się wysłać zapytania.');
    }
  });
});
