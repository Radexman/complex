import { afterEach, describe, expect, it, vi } from 'vitest';

import { submitZaluzjeForm } from './submitZaluzjeForm';

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

afterEach(() => {
  vi.restoreAllMocks();
});

describe('submitZaluzjeForm', () => {
  it('returns success for a valid submission', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await submitZaluzjeForm(buildFormData());
    expect(result.success).toBe(true);
    expect(logSpy).toHaveBeenCalled();
  });

  it('coerces the dimension strings to numbers', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await submitZaluzjeForm(buildFormData({ openingHeight: '180', openingWidth: '300' }));
    expect(logSpy).toHaveBeenCalledWith('Wymiary otworu:', { wysokość: 180, szerokość: 300 });
  });

  it('coerces the installationService "true" string to a boolean', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await submitZaluzjeForm(buildFormData({ installationService: 'false' }));
    expect(logSpy).toHaveBeenCalledWith('Montaż:', false);
  });

  it('fails and returns field errors when the dimensions are missing', async () => {
    const result = await submitZaluzjeForm(buildFormData({ openingHeight: '', openingWidth: '' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.openingHeight).toBeDefined();
      expect(result.errors.fieldErrors.openingWidth).toBeDefined();
    }
  });

  it('fails when the height exceeds 500 cm', async () => {
    const result = await submitZaluzjeForm(buildFormData({ openingHeight: '600' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.openingHeight).toBeDefined();
    }
  });

  it('fails when the width exceeds 1000 cm', async () => {
    const result = await submitZaluzjeForm(buildFormData({ openingWidth: '1200' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.openingWidth).toBeDefined();
    }
  });

  it('fails when the RODO consent is not accepted', async () => {
    const result = await submitZaluzjeForm(buildFormData({ consentRodo: 'false' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.consentRodo).toBeDefined();
    }
  });

  it('fails on an invalid postal code', async () => {
    const result = await submitZaluzjeForm(buildFormData({ postalCode: '44100' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.postalCode).toBeDefined();
    }
  });

  it('logs attached photo metadata', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const photo = new File(['x'], 'okno.jpg', { type: 'image/jpeg' });
    await submitZaluzjeForm(buildFormData({ photos: [photo] }));
    expect(logSpy).toHaveBeenCalledWith(
      'Zdjęcia:',
      expect.arrayContaining([expect.stringContaining('okno.jpg')]),
    );
  });
});
