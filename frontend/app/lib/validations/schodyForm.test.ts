import { describe, expect, it } from 'vitest';

import { SCHODY_DIMENSIONS, schodyFormSchema } from './schodyForm';

type RawInput = Record<string, unknown>;

const validBase: RawInput = {
  isInsulated: 'tak',
  dimA: '100',
  dimB: '250',
  dimC: '30',
  dimD: '320',
  dimE: '70',
  dimH: '290',
  dimh: '260',
  postalCode: '44-100',
  name: 'Jan Kowalski',
  phone: '123456789',
  email: 'jan@example.com',
  consentRodo: true,
  consentMarketing: false,
};

/** Collect the dotted field paths of all validation issues. */
function issuePaths(input: RawInput): string[] {
  const result = schodyFormSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join('.'));
}

describe('schodyFormSchema — happy path', () => {
  it('accepts a complete submission and coerces the dimensions to numbers', () => {
    const result = schodyFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dimA).toBe(100);
      expect(result.data.dimH).toBe(290);
      expect(result.data.dimh).toBe(260);
    }
  });

  it('accepts optional notes', () => {
    const result = schodyFormSchema.safeParse({ ...validBase, notes: 'Schody zewnętrzne' });
    expect(result.success).toBe(true);
  });
});

describe('schodyFormSchema — dimensions', () => {
  it('requires every one of the seven dimensions', () => {
    const blank = Object.fromEntries(SCHODY_DIMENSIONS.map((dim) => [dim.name, '']));
    const paths = issuePaths({ ...validBase, ...blank });
    expect(paths).toEqual(expect.arrayContaining(SCHODY_DIMENSIONS.map((dim) => dim.name)));
  });

  it('keeps dimH and dimh as two distinct fields', () => {
    expect(issuePaths({ ...validBase, dimH: '' })).toEqual(['dimH']);
    expect(issuePaths({ ...validBase, dimh: '' })).toEqual(['dimh']);
  });

  it('rejects zero or negative dimensions', () => {
    expect(issuePaths({ ...validBase, dimA: '0' })).toContain('dimA');
    expect(issuePaths({ ...validBase, dimD: '-1' })).toContain('dimD');
  });
});

describe('schodyFormSchema — field validation', () => {
  it('requires the insulation answer to be tak or nie', () => {
    expect(issuePaths({ ...validBase, isInsulated: undefined })).toContain('isInsulated');
    expect(issuePaths({ ...validBase, isInsulated: 'moze' })).toContain('isInsulated');
    expect(schodyFormSchema.safeParse({ ...validBase, isInsulated: 'nie' }).success).toBe(true);
  });

  it('enforces the 00-000 postal-code format', () => {
    expect(issuePaths({ ...validBase, postalCode: '44100' })).toContain('postalCode');
    expect(issuePaths({ ...validBase, postalCode: '4-100' })).toContain('postalCode');
    expect(schodyFormSchema.safeParse({ ...validBase, postalCode: '00-000' }).success).toBe(true);
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
