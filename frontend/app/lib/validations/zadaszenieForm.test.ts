import { describe, expect, it } from 'vitest';

import {
  EQUIPMENT_OPTIONS,
  FRAME_COLORS,
  ROOF_TYPES,
  zadaszenieFormSchema,
} from './zadaszenieForm';

type RawInput = Record<string, unknown>;

const validBase: RawInput = {
  roofType: ROOF_TYPES[0],
  frameColor: 'antracyt',
  width: '4',
  depth: '2.5',
  equipTriangleSide: false,
  equipLedLighting: true,
  equipPolyWallFixedRight: false,
  equipPolyWallFixedLeft: false,
  equipGlasslessDoorsSlidingRight: false,
  equipGlasslessDoorsSlidingLeft: false,
  equipGlasslessDoorsSlidingFront: false,
  postalCode: '44-100',
  name: 'Jan Kowalski',
  phone: '123456789',
  email: 'jan@example.com',
  installationService: false,
  consentRodo: true,
  consentMarketing: false,
};

/** Collect the dotted field paths of all validation issues. */
function issuePaths(input: RawInput): string[] {
  const result = zadaszenieFormSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join('.'));
}

describe('option lists', () => {
  it('offers the seven roof models and three frame colours', () => {
    expect(ROOF_TYPES).toHaveLength(7);
    expect(FRAME_COLORS).toEqual(['antracyt', 'czarny', 'biały krem']);
  });

  it('lists the seven equipment add-ons, each matching a schema field', () => {
    expect(EQUIPMENT_OPTIONS).toHaveLength(7);
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
    const noEquipment = { ...validBase, equipLedLighting: false };
    expect(zadaszenieFormSchema.safeParse(noEquipment).success).toBe(true);
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

  it('caps the width at 20 m and the depth at 10 m', () => {
    expect(issuePaths({ ...validBase, width: '21' })).toContain('width');
    expect(issuePaths({ ...validBase, depth: '11' })).toContain('depth');
    expect(zadaszenieFormSchema.safeParse({ ...validBase, width: '20', depth: '10' }).success).toBe(
      true,
    );
  });
});

describe('zadaszenieFormSchema — field validation', () => {
  it('requires a roof type and a frame colour', () => {
    const paths = issuePaths({ ...validBase, roofType: '', frameColor: '' });
    expect(paths).toEqual(expect.arrayContaining(['roofType', 'frameColor']));
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

  it('rejects a too-short name', () => {
    expect(issuePaths({ ...validBase, name: 'J' })).toContain('name');
  });

  it('rejects a too-short phone number', () => {
    expect(issuePaths({ ...validBase, phone: '123' })).toContain('phone');
  });

  it('requires the RODO consent to be true', () => {
    expect(issuePaths({ ...validBase, consentRodo: false })).toContain('consentRodo');
  });
});
