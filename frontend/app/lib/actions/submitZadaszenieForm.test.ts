import { afterEach, describe, expect, it, vi } from 'vitest';

import { submitZadaszenieForm } from './submitZadaszenieForm';
import { ROOF_TYPES } from '@/app/lib/validations/zadaszenieForm';

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

afterEach(() => {
  vi.restoreAllMocks();
});

describe('submitZadaszenieForm', () => {
  it('returns success for a valid submission', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await submitZadaszenieForm(buildFormData());
    expect(result.success).toBe(true);
    expect(logSpy).toHaveBeenCalled();
  });

  it('coerces the dimension strings to numbers', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await submitZadaszenieForm(buildFormData({ width: '5.5', depth: '3' }));
    expect(logSpy).toHaveBeenCalledWith('Wymiary:', { szerokość: 5.5, głębokość: 3 });
  });

  it('logs only the selected equipment, by label', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await submitZadaszenieForm(
      buildFormData({ equipment: ['equipLedLighting', 'equipGlasslessDoorsSlidingFront'] }),
    );
    expect(logSpy).toHaveBeenCalledWith('Wyposażenie dodatkowe:', [
      'Oświetlenie punktowe LED + pilot',
      'Szyby bezramowe, drzwi przesuwne / front',
    ]);
  });

  it('logs an empty equipment list when nothing is selected', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await submitZadaszenieForm(buildFormData());
    expect(logSpy).toHaveBeenCalledWith('Wyposażenie dodatkowe:', []);
  });

  it('coerces the installationService "true" string to a boolean', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await submitZadaszenieForm(buildFormData({ installationService: 'false' }));
    expect(logSpy).toHaveBeenCalledWith('Montaż:', false);
  });

  it('fails and returns field errors when the dimensions are missing', async () => {
    const result = await submitZadaszenieForm(buildFormData({ width: '', depth: '' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.width).toBeDefined();
      expect(result.errors.fieldErrors.depth).toBeDefined();
    }
  });

  it('fails when the width exceeds 20 m', async () => {
    const result = await submitZadaszenieForm(buildFormData({ width: '25' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.width).toBeDefined();
    }
  });

  it('fails when the RODO consent is not accepted', async () => {
    const result = await submitZadaszenieForm(buildFormData({ consentRodo: 'false' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.consentRodo).toBeDefined();
    }
  });

  it('fails on an invalid postal code', async () => {
    const result = await submitZadaszenieForm(buildFormData({ postalCode: '44100' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.postalCode).toBeDefined();
    }
  });

  it('logs attached photo metadata', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const photo = new File(['x'], 'taras.jpg', { type: 'image/jpeg' });
    await submitZadaszenieForm(buildFormData({ photos: [photo] }));
    expect(logSpy).toHaveBeenCalledWith(
      'Zdjęcia:',
      expect.arrayContaining([expect.stringContaining('taras.jpg')]),
    );
  });
});
