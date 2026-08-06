import { describe, expect, it } from 'vitest';

import {
  CANOPY_TYPES,
  EQUIPMENT_OPTIONS,
  FRAME_COLORS,
  ROOF_TYPES,
  zadaszenieFormSchema,
} from './zadaszenieForm';

type RawInput = Record<string, unknown>;

const noEquipment = Object.fromEntries(
  EQUIPMENT_OPTIONS.map((option) => [option.name, false]),
) as RawInput;

const validBase: RawInput = {
  canopyType: CANOPY_TYPES[0],
  roofType: ROOF_TYPES[0],
  frameColor: 'antracyt',
  width: '4',
  depth: '2.5',
  ...noEquipment,
  equipLedLighting: true,
  postalCode: '44-100',
  name: 'Jan Kowalski',
  phone: '123456789',
  email: 'jan@example.com',
  installationService: false,
  consentRodo: true,
};

/** Collect the dotted field paths of all validation issues. */
function issuePaths(input: RawInput): string[] {
  const result = zadaszenieFormSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join('.'));
}

describe('option lists', () => {
  it('splits the canopy model and the roof filling into two lists', () => {
    expect(CANOPY_TYPES).toEqual(['Przyścienny', 'Wolnostojący']);
    expect(ROOF_TYPES).toEqual([
      'Poliwęglan',
      'Szkło',
      'Lamele aluminiowe',
      'Materiał',
      'Roleta rzymska',
    ]);
  });

  it('offers three frame colours', () => {
    expect(FRAME_COLORS).toEqual(['antracyt', 'czarny', 'biały']);
  });

  it('lists the twelve equipment add-ons, each matching a schema field', () => {
    expect(EQUIPMENT_OPTIONS).toHaveLength(12);
    const result = zadaszenieFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      for (const option of EQUIPMENT_OPTIONS) {
        expect(typeof result.data[option.name]).toBe('boolean');
      }
    }
  });
});

describe('zadaszenieFormSchema — happy path', () => {
  it('accepts a complete submission and coerces the dimensions to numbers', () => {
    const result = zadaszenieFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.width).toBe(4);
      expect(result.data.depth).toBe(2.5);
    }
  });

  it('accepts optional terrace blinds and notes', () => {
    const result = zadaszenieFormSchema.safeParse({
      ...validBase,
      terraceBlinds: '250 x 220',
      notes: 'Narożnik budynku',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a submission with no equipment selected', () => {
    expect(zadaszenieFormSchema.safeParse({ ...validBase, ...noEquipment }).success).toBe(true);
  });

  it('drops the marketing consent — only the RODO consent survives', () => {
    const result = zadaszenieFormSchema.safeParse({ ...validBase, consentMarketing: true });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty('consentMarketing');
  });
});

describe('zadaszenieFormSchema — dimensions', () => {
  it('requires a width and a depth', () => {
    const paths = issuePaths({ ...validBase, width: '', depth: '' });
    expect(paths).toEqual(expect.arrayContaining(['width', 'depth']));
  });

  it('rejects zero or negative dimensions', () => {
    expect(issuePaths({ ...validBase, width: '0' })).toContain('width');
    expect(issuePaths({ ...validBase, depth: '-1' })).toContain('depth');
  });

  it('caps the width at 20 m and the depth at 6 m', () => {
    expect(issuePaths({ ...validBase, width: '21' })).toContain('width');
    expect(issuePaths({ ...validBase, depth: '6.5' })).toContain('depth');
    expect(zadaszenieFormSchema.safeParse({ ...validBase, width: '20', depth: '6' }).success).toBe(
      true,
    );
  });
});

describe('zadaszenieFormSchema — field validation', () => {
  it('requires a canopy type, a roof type and a frame colour', () => {
    const paths = issuePaths({ ...validBase, canopyType: '', roofType: '', frameColor: '' });
    expect(paths).toEqual(expect.arrayContaining(['canopyType', 'roofType', 'frameColor']));
  });

  it('enforces the 00-000 postal-code format', () => {
    expect(issuePaths({ ...validBase, postalCode: '44100' })).toContain('postalCode');
    expect(issuePaths({ ...validBase, postalCode: '4-100' })).toContain('postalCode');
    expect(zadaszenieFormSchema.safeParse({ ...validBase, postalCode: '00-000' }).success).toBe(
      true,
    );
  });

  it('rejects an invalid email', () => {
    expect(issuePaths({ ...validBase, email: 'not-an-email' })).toContain('email');
  });

  it('accepts a submission with no name and no phone number', () => {
    const result = zadaszenieFormSchema.safeParse({ ...validBase, name: '', phone: '' });

    expect(result.success).toBe(true);
    // Blank optional fields arrive as absent, not as empty strings.
    expect(result.data?.name).toBeUndefined();
    expect(result.data?.phone).toBeUndefined();
  });

  it('still rejects a too-short name that was typed', () => {
    expect(issuePaths({ ...validBase, name: 'J' })).toContain('name');
  });

  it('still rejects a too-short phone number that was typed', () => {
    expect(issuePaths({ ...validBase, phone: '123' })).toContain('phone');
  });

  it('requires the RODO consent to be true', () => {
    expect(issuePaths({ ...validBase, consentRodo: false })).toContain('consentRodo');
  });
});
