import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SendQuoteEmailsOptions } from '@/app/lib/email/sendQuoteEmails';
import { sendQuoteEmails } from '@/app/lib/email/sendQuoteEmails';
import { submitZadaszenieForm } from './submitZadaszenieForm';
import { ROOF_TYPES } from '@/app/lib/validations/zadaszenieForm';

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
  roofType?: string;
  frameColor?: string;
  width?: string;
  depth?: string;
  equipment?: string[];
  terraceBlinds?: string;
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
    roofType = ROOF_TYPES[0],
    frameColor = 'antracyt',
    width = '4',
    depth = '2.5',
    equipment = [],
    terraceBlinds,
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
  formData.append('roofType', roofType);
  formData.append('frameColor', frameColor);
  formData.append('width', width);
  formData.append('depth', depth);
  for (const field of equipment) {
    formData.append(field, 'true');
  }
  if (terraceBlinds !== undefined) formData.append('terraceBlinds', terraceBlinds);
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

describe('submitZadaszenieForm', () => {
  it('returns success and sends the quote email for a valid submission', async () => {
    const result = await submitZadaszenieForm(buildFormData());

    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(lastEmail().subject).toContain('Jan Kowalski');
    expect(lastEmail().customer).toEqual({ name: 'Jan Kowalski', email: 'jan@example.com' });
  });

  it('coerces the dimension strings to numbers', async () => {
    await submitZadaszenieForm(buildFormData({ width: '5.5', depth: '3' }));
    const { html } = lastEmail();

    expect(html).toContain('>5.5<');
    expect(html).toContain('>3<');
  });

  it('lists only the selected equipment, by label', async () => {
    await submitZadaszenieForm(
      buildFormData({ equipment: ['equipLedLighting', 'equipGlasslessDoorsSlidingFront'] }),
    );
    const { html } = lastEmail();

    expect(html).toContain('Oświetlenie punktowe LED + pilot');
    expect(html).toContain('Szyby bezramowe, drzwi przesuwne / front');
    expect(html).not.toContain('Trójkąt boczny');
  });

  it('omits the equipment row entirely when nothing is selected', async () => {
    await submitZadaszenieForm(buildFormData());
    expect(lastEmail().html).not.toContain('Wyposażenie dodatkowe');
  });

  it('renders the installationService boolean as Polish', async () => {
    await submitZadaszenieForm(buildFormData({ installationService: 'false' }));
    expect(lastEmail().html).toContain('Nie');
  });

  it('fails and returns field errors when the dimensions are missing', async () => {
    const result = await submitZadaszenieForm(buildFormData({ width: '', depth: '' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.width).toBeDefined();
      expect(result.errors?.fieldErrors.depth).toBeDefined();
    }
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('fails when the width exceeds 20 m', async () => {
    const result = await submitZadaszenieForm(buildFormData({ width: '25' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.width).toBeDefined();
    }
  });

  it('fails when the RODO consent is not accepted', async () => {
    const result = await submitZadaszenieForm(buildFormData({ consentRodo: 'false' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.consentRodo).toBeDefined();
    }
  });

  it('fails on an invalid postal code', async () => {
    const result = await submitZadaszenieForm(buildFormData({ postalCode: '44100' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.fieldErrors.postalCode).toBeDefined();
    }
  });

  it('attaches the uploaded photos and lists them in the email', async () => {
    const photo = new File(['x'], 'taras.jpg', { type: 'image/jpeg' });
    await submitZadaszenieForm(buildFormData({ photos: [photo] }));

    expect(lastEmail().attachments).toEqual([expect.objectContaining({ filename: 'taras.jpg' })]);
    expect(lastEmail().html).toContain('taras.jpg');
  });

  it('surfaces a failed send as an error instead of a silent success', async () => {
    sendMock.mockResolvedValue({ ok: false, error: 'Nie udało się wysłać zapytania.' });
    const result = await submitZadaszenieForm(buildFormData());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Nie udało się wysłać zapytania.');
    }
  });
});
