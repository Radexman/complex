import { afterEach, describe, expect, it, vi } from 'vitest';

import { submitSchodyForm } from './submitSchodyForm';

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

afterEach(() => {
  vi.restoreAllMocks();
});

describe('submitSchodyForm', () => {
  it('returns success for a valid submission', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await submitSchodyForm(buildFormData());
    expect(result.success).toBe(true);
    expect(logSpy).toHaveBeenCalled();
  });

  it('logs every dimension coerced to a number under its diagram label', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await submitSchodyForm(buildFormData({ dimA: '120', dimH: '295', dimh: '265' }));
    expect(logSpy).toHaveBeenCalledWith('Wymiary:', {
      'A — szerokość otworu': 120,
      'B — głębokość otworu': 250,
      'C — grubość stropu': 30,
      'D — długość schodów': 320,
      'E — szerokość stopni': 70,
      'H — wys. od podłoża ze stropem': 295,
      'h — wys. od podłoża do stropu': 265,
    });
  });

  it('passes the insulation answer through', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await submitSchodyForm(buildFormData({ isInsulated: 'nie' }));
    expect(logSpy).toHaveBeenCalledWith('Budynek ocieplony:', 'nie');
  });

  it('fails and returns field errors when the dimensions are missing', async () => {
    const result = await submitSchodyForm(buildFormData({ dimA: '', dimh: '' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.dimA).toBeDefined();
      expect(result.errors.fieldErrors.dimh).toBeDefined();
      expect(result.errors.fieldErrors.dimH).toBeUndefined();
    }
  });

  it('fails when the insulation answer is missing', async () => {
    const formData = buildFormData();
    formData.delete('isInsulated');
    const result = await submitSchodyForm(formData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.isInsulated).toBeDefined();
    }
  });

  it('fails when the RODO consent is not accepted', async () => {
    const result = await submitSchodyForm(buildFormData({ consentRodo: 'false' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.consentRodo).toBeDefined();
    }
  });

  it('fails on an invalid postal code', async () => {
    const result = await submitSchodyForm(buildFormData({ postalCode: '44100' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.postalCode).toBeDefined();
    }
  });

  it('logs attached photo metadata', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const photo = new File(['x'], 'schody.jpg', { type: 'image/jpeg' });
    await submitSchodyForm(buildFormData({ photos: [photo] }));
    expect(logSpy).toHaveBeenCalledWith(
      'Zdjęcia:',
      expect.arrayContaining([expect.stringContaining('schody.jpg')]),
    );
  });
});
