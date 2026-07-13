import { describe, expect, it } from 'vitest';

import { zaluzjeFormSchema } from './zaluzjeForm';

type RawInput = Record<string, unknown>;

const validBase: RawInput = {
  openingHeight: '220',
  openingWidth: '250',
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
  const result = zaluzjeFormSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join('.'));
}

describe('zaluzjeFormSchema — happy path', () => {
  it('accepts a complete submission and coerces the dimensions to numbers', () => {
    const result = zaluzjeFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.openingHeight).toBe(220);
      expect(result.data.openingWidth).toBe(250);
    }
  });

  it('accepts optional notes', () => {
    const result = zaluzjeFormSchema.safeParse({ ...validBase, notes: 'Sterowanie elektryczne' });
    expect(result.success).toBe(true);
  });
});

describe('zaluzjeFormSchema — opening dimensions', () => {
  it('requires a height and a width', () => {
    const paths = issuePaths({ ...validBase, openingHeight: '', openingWidth: '' });
    expect(paths).toEqual(expect.arrayContaining(['openingHeight', 'openingWidth']));
  });

  it('rejects zero or negative dimensions', () => {
    expect(issuePaths({ ...validBase, openingHeight: '0' })).toContain('openingHeight');
    expect(issuePaths({ ...validBase, openingWidth: '-1' })).toContain('openingWidth');
  });

  it('caps the height at 500 cm and the width at 1000 cm', () => {
    expect(issuePaths({ ...validBase, openingHeight: '501' })).toContain('openingHeight');
    expect(issuePaths({ ...validBase, openingWidth: '1001' })).toContain('openingWidth');
    expect(
      zaluzjeFormSchema.safeParse({ ...validBase, openingHeight: '500', openingWidth: '1000' })
        .success,
    ).toBe(true);
  });
});

describe('zaluzjeFormSchema — field validation', () => {
  it('enforces the 00-000 postal-code format', () => {
    expect(issuePaths({ ...validBase, postalCode: '44100' })).toContain('postalCode');
    expect(issuePaths({ ...validBase, postalCode: '4-100' })).toContain('postalCode');
    expect(zaluzjeFormSchema.safeParse({ ...validBase, postalCode: '00-000' }).success).toBe(true);
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
