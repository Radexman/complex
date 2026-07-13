import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SendQuoteEmailsOptions } from '@/app/lib/email/sendQuoteEmails';
import { sendQuoteEmails } from '@/app/lib/email/sendQuoteEmails';
import { submitTarasForm } from './submitTarasForm';

vi.mock('@/app/lib/email/sendQuoteEmails', () => ({
  sendQuoteEmails: vi.fn(async () => ({ ok: true })),
}));

// Stubbed so the action's diagram lookup needs neither a Sanity project nor env vars.
vi.mock('@/sanity/lib/client', () => ({ client: { fetch: vi.fn(async () => null) } }));
vi.mock('@/sanity/lib/utils', () => ({
  urlForImage: () => ({ width: () => ({ fit: () => ({ url: () => 'https://cdn/shape.png' }) }) }),
}));

const sendMock = vi.mocked(sendQuoteEmails);

/** The options the action passed to the email layer on its last call. */
function lastEmail(): SendQuoteEmailsOptions {
  const call = sendMock.mock.calls.at(-1);
  if (!call) throw new Error('sendQuoteEmails was not called');
  return call[0];
}

interface FormValues {
  shape?: string;
  sides?: Record<string, string>;
  requiredSides?: string[];
  buildingPosition?: string[];
  material?: string;
  installationService?: string;
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
    shape = '1',
    sides = { A: '3', B: '4' },
    requiredSides = ['A', 'B'],
    buildingPosition = ['A', 'B'],
    material = 'Kompozyt Komorowy',
    installationService = 'true',
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
  formData.append('shape', shape);
  for (const [side, value] of Object.entries(sides)) {
    formData.append(`side${side}`, value);
  }
  for (const side of requiredSides) {
    formData.append('requiredSides', side);
  }
  for (const position of buildingPosition) {
    formData.append('buildingPosition', position);
  }
  formData.append('material', material);
  formData.append('installationService', installationService);
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

describe('submitTarasForm', () => {
  it('returns success and sends the quote email for a valid submission', async () => {
    const result = await submitTarasForm(buildFormData());

    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(lastEmail().subject).toContain('Jan Kowalski');
    expect(lastEmail().customer).toEqual({ name: 'Jan Kowalski', email: 'jan@example.com' });
  });

  it('reconstructs the multi-value building position from FormData', async () => {
    await submitTarasForm(buildFormData({ buildingPosition: ['A', 'C'] }));
    expect(lastEmail().html).toContain('A, C');
  });

  it('renders the installationService boolean as Polish', async () => {
    await submitTarasForm(buildFormData({ installationService: 'true' }));
    expect(lastEmail().html).toContain('Tak');
  });

  it('treats a non-"true" installationService value as false', async () => {
    await submitTarasForm(buildFormData({ installationService: 'false' }));
    expect(lastEmail().html).toContain('Nie');
  });

  it('leaves the sides the selected shape does not use out of the email', async () => {
    await submitTarasForm(buildFormData({ shape: '1', sides: { A: '3', B: '4' } }));
    const { html } = lastEmail();

    expect(html).toContain('Bok A');
    expect(html).toContain('Bok B');
    expect(html).not.toContain('Bok C');
    expect(html).not.toContain('undefined');
  });

  it('attaches the uploaded photos and lists them in the email', async () => {
    const photo = new File(['x'], 'ogrod.jpg', { type: 'image/jpeg' });
    await submitTarasForm(buildFormData({ photos: [photo] }));

    expect(lastEmail().attachments).toEqual([expect.objectContaining({ filename: 'ogrod.jpg' })]);
    expect(lastEmail().html).toContain('ogrod.jpg');
  });

  it('fails and returns field errors when a required side is missing', async () => {
    const result = await submitTarasForm(
      buildFormData({ sides: { A: '3' }, requiredSides: ['A', 'B'] }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.sideB).toBeDefined();
    }
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('fails when the RODO consent is not accepted', async () => {
    const result = await submitTarasForm(buildFormData({ consentRodo: 'false' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.consentRodo).toBeDefined();
    }
  });

  it('fails on an invalid postal code', async () => {
    const result = await submitTarasForm(buildFormData({ postalCode: '44100' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.postalCode).toBeDefined();
    }
  });

  it('surfaces a failed send as an error instead of a silent success', async () => {
    sendMock.mockResolvedValue({ ok: false, error: 'Nie udało się wysłać zapytania.' });
    const result = await submitTarasForm(buildFormData());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Nie udało się wysłać zapytania.');
    }
  });
});
