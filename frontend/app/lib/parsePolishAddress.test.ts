import { describe, expect, it } from 'vitest';

import { parsePolishAddress } from './parsePolishAddress';

describe('parsePolishAddress', () => {
  it('parses a standard "street, postal code city" address', () => {
    expect(parsePolishAddress('Kępska 12, 45-130 Opole')).toEqual({
      streetAddress: 'Kępska 12',
      postalCode: '45-130',
      addressLocality: 'Opole',
    });
  });

  it('handles a multi-word city name', () => {
    expect(parsePolishAddress('Testowa 1, 41-700 Ruda Śląska')).toEqual({
      streetAddress: 'Testowa 1',
      postalCode: '41-700',
      addressLocality: 'Ruda Śląska',
    });
  });

  it('ignores a third comma-separated segment (real live value has a room number)', () => {
    expect(parsePolishAddress('Kępska 12, 45-130 Opole, pok.20 (parter)')).toEqual({
      streetAddress: 'Kępska 12',
      postalCode: '45-130',
      addressLocality: 'Opole',
    });
  });

  it('returns null when there is no comma', () => {
    expect(parsePolishAddress('Kępska 12 45-130 Opole')).toBeNull();
  });

  it('returns null when the postal code is missing or malformed', () => {
    expect(parsePolishAddress('Kępska 12, Opole')).toBeNull();
    expect(parsePolishAddress('Kępska 12, 45130 Opole')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parsePolishAddress('')).toBeNull();
  });
});
