import { afterEach, describe, expect, it, vi } from 'vitest';

import { submitTarasForm } from './submitTarasForm';

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

afterEach(() => {
  vi.restoreAllMocks();
});

describe('submitTarasForm', () => {
  it('returns success for a valid submission', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await submitTarasForm(buildFormData());
    expect(result.success).toBe(true);
    expect(logSpy).toHaveBeenCalled();
  });

  it('reconstructs the multi-value building position from FormData', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await submitTarasForm(buildFormData({ buildingPosition: ['A', 'C'] }));
    expect(logSpy).toHaveBeenCalledWith('Położenie budynku:', ['A', 'C']);
  });

  it('coerces the installationService "true" string to a boolean', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await submitTarasForm(buildFormData({ installationService: 'true' }));
    expect(logSpy).toHaveBeenCalledWith('Montaż:', true);
  });

  it('treats a non-"true" installationService value as false', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await submitTarasForm(buildFormData({ installationService: 'false' }));
    expect(logSpy).toHaveBeenCalledWith('Montaż:', false);
  });

  it('fails and returns field errors when a required side is missing', async () => {
    const result = await submitTarasForm(
      buildFormData({ sides: { A: '3' }, requiredSides: ['A', 'B'] }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.sideB).toBeDefined();
    }
  });

  it('fails when the RODO consent is not accepted', async () => {
    const result = await submitTarasForm(buildFormData({ consentRodo: 'false' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.consentRodo).toBeDefined();
    }
  });

  it('fails on an invalid postal code', async () => {
    const result = await submitTarasForm(buildFormData({ postalCode: '44100' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldErrors.postalCode).toBeDefined();
    }
  });

  it('logs attached photo metadata', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const photo = new File(['x'], 'ogrod.jpg', { type: 'image/jpeg' });
    await submitTarasForm(buildFormData({ photos: [photo] }));
    expect(logSpy).toHaveBeenCalledWith(
      'Zdjęcia:',
      expect.arrayContaining([expect.stringContaining('ogrod.jpg')]),
    );
  });
});
