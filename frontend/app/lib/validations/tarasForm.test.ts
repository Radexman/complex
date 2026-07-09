import { describe, expect, it } from 'vitest';

import { REQUIRED_SIDES, tarasFormSchema } from './tarasForm';

type RawInput = Record<string, unknown>;

const validBase: RawInput = {
  shape: '1',
  sideA: '3',
  sideB: '4',
  sideC: '5',
  buildingPosition: ['A'],
  material: 'Kompozyt Komorowy',
  installationService: false,
  postalCode: '44-100',
  name: 'Jan Kowalski',
  phone: '123456789',
  email: 'jan@example.com',
  consentRodo: true,
  consentMarketing: false,
};

/** Collect the dotted field paths of all validation issues. */
function issuePaths(input: RawInput): string[] {
  const result = tarasFormSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join('.'));
}

describe('REQUIRED_SIDES (fallback map)', () => {
  it('maps each shape to its required sides', () => {
    expect(REQUIRED_SIDES['1']).toEqual(['A', 'B']);
    expect(REQUIRED_SIDES['2']).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(REQUIRED_SIDES['3']).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    expect(REQUIRED_SIDES['4']).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
  });
});

describe('tarasFormSchema — happy path', () => {
  it('accepts a complete shape-1 submission and coerces dimensions to numbers', () => {
    const result = tarasFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sideA).toBe(3);
      expect(result.data.sideB).toBe(4);
      expect(result.data.sideC).toBe(5);
      expect(typeof result.data.sideA).toBe('number');
    }
  });

  it('accepts a full shape-3 submission with all eight sides', () => {
    const result = tarasFormSchema.safeParse({
      ...validBase,
      shape: '3',
      sideD: '2',
      sideE: '2',
      sideF: '2',
      sideG: '2',
      sideH: '2',
    });
    expect(result.success).toBe(true);
  });

  it('ignores dimensions for sides not required by the selected shape', () => {
    // Shape 1 only needs A, B, C — a stray sideD should not cause failure.
    const result = tarasFormSchema.safeParse({ ...validBase, sideD: '9' });
    expect(result.success).toBe(true);
  });
});

describe('tarasFormSchema — per-shape dimension requirements (superRefine)', () => {
  it('fails when a required side is missing for shape 1 (fallback A, B)', () => {
    const withoutB = { ...validBase };
    delete withoutB.sideB;
    expect(issuePaths(withoutB)).toContain('sideB');
  });

  it('does not require sides beyond the shape-1 fallback (no C)', () => {
    const withoutC = { ...validBase };
    delete withoutC.sideC;
    expect(issuePaths(withoutC)).not.toContain('sideC');
  });

  it('fails when a required side is an empty string', () => {
    expect(issuePaths({ ...validBase, sideA: '' })).toContain('sideA');
  });

  it('fails when a required side is zero or negative', () => {
    expect(issuePaths({ ...validBase, sideB: '0' })).toContain('sideB');
    expect(issuePaths({ ...validBase, sideB: '-2' })).toContain('sideB');
  });

  it('requires sides D–F for shape 2 (fallback)', () => {
    const paths = issuePaths({ ...validBase, shape: '2' });
    expect(paths).toEqual(expect.arrayContaining(['sideD', 'sideE', 'sideF']));
  });

  it('requires sides D–H for shape 4 (fallback)', () => {
    const paths = issuePaths({ ...validBase, shape: '4' });
    expect(paths).toEqual(expect.arrayContaining(['sideD', 'sideE', 'sideF', 'sideG', 'sideH']));
  });
});

describe('tarasFormSchema — requiredSides drives validation (CMS-defined sides)', () => {
  it('requires exactly the submitted requiredSides, overriding the fallback', () => {
    // Shape 1 fallback is A, B — but a submission declaring C, D must require those.
    const paths = issuePaths({ ...validBase, requiredSides: ['A', 'B', 'C', 'D'] });
    expect(paths).toEqual(expect.arrayContaining(['sideD']));
    expect(paths).not.toContain('sideA');
  });

  it('accepts a submission whose requiredSides are all present', () => {
    const result = tarasFormSchema.safeParse({ ...validBase, requiredSides: ['A', 'B'] });
    expect(result.success).toBe(true);
  });

  it('only requires the single side when requiredSides narrows the shape', () => {
    const onlyA: RawInput = { ...validBase, requiredSides: ['A'] };
    delete onlyA.sideB;
    expect(tarasFormSchema.safeParse(onlyA).success).toBe(true);
  });
});

describe('tarasFormSchema — field validation', () => {
  it('rejects an invalid shape value', () => {
    expect(issuePaths({ ...validBase, shape: '9' })).toContain('shape');
  });

  it('requires at least one building-position side', () => {
    expect(issuePaths({ ...validBase, buildingPosition: [] })).toContain('buildingPosition');
  });

  it('requires a material', () => {
    expect(issuePaths({ ...validBase, material: '' })).toContain('material');
  });

  it('enforces the 00-000 postal-code format', () => {
    expect(issuePaths({ ...validBase, postalCode: '44100' })).toContain('postalCode');
    expect(issuePaths({ ...validBase, postalCode: '4-100' })).toContain('postalCode');
    expect(tarasFormSchema.safeParse({ ...validBase, postalCode: '00-000' }).success).toBe(true);
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
