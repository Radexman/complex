import { describe, expect, it } from 'vitest';

import { escapeHtml, formatRowValue, renderQuoteEmail } from './renderQuoteEmail';

describe('formatRowValue', () => {
  it('maps booleans to Polish', () => {
    expect(formatRowValue(true)).toBe('Tak');
    expect(formatRowValue(false)).toBe('Nie');
  });

  it('drops empty values so unused fields never reach the email', () => {
    expect(formatRowValue(undefined)).toBeNull();
    expect(formatRowValue(null)).toBeNull();
    expect(formatRowValue('')).toBeNull();
    expect(formatRowValue('   ')).toBeNull();
    expect(formatRowValue([])).toBeNull();
    expect(formatRowValue(['', ' '])).toBeNull();
  });

  it('joins arrays', () => {
    expect(formatRowValue(['A', 'B'])).toBe('A, B');
  });

  it('keeps zero out of the email but renders other numbers', () => {
    expect(formatRowValue(3.5)).toBe('3.5');
    expect(formatRowValue(0)).toBe('0');
    expect(formatRowValue(Number.NaN)).toBeNull();
  });
});

describe('escapeHtml', () => {
  it('escapes markup in user-supplied text', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
  });
});

describe('renderQuoteEmail', () => {
  const sections = [
    {
      title: 'Taras',
      rows: [
        { label: 'Bok A [m]', value: 2 },
        { label: 'Bok B [m]', value: 1 },
        { label: 'Bok C [m]', value: undefined },
        { label: 'Usługa montażu', value: false },
        { label: 'Położenie budynku', value: ['A'] },
      ],
    },
  ];

  it('renders the supplied rows', () => {
    const html = renderQuoteEmail({ heading: 'Wycena tarasu', sections });
    expect(html).toContain('Wycena tarasu');
    expect(html).toContain('Bok A [m]');
    expect(html).toContain('>2<');
    expect(html).toContain('Nie');
  });

  it('omits rows whose value is empty', () => {
    const html = renderQuoteEmail({ heading: 'Wycena tarasu', sections });
    expect(html).not.toContain('Bok C');
    expect(html).not.toContain('undefined');
  });

  it('omits a section whose every row was dropped', () => {
    const html = renderQuoteEmail({
      heading: 'Wycena',
      sections: [{ title: 'Pusta sekcja', rows: [{ label: 'Uwagi', value: '' }] }],
    });
    expect(html).not.toContain('Pusta sekcja');
  });

  it('escapes user text and preserves its line breaks', () => {
    const html = renderQuoteEmail({
      heading: 'Wycena',
      sections: [{ title: 'Dodatkowe', rows: [{ label: 'Uwagi', value: 'a <b>\ndruga linia' }] }],
    });
    expect(html).toContain('a &lt;b&gt;<br />druga linia');
  });

  it('embeds the technical diagram when one is supplied', () => {
    const html = renderQuoteEmail({
      heading: 'Wycena',
      sections,
      diagram: { url: 'https://cdn.sanity.io/images/shape-1.png', caption: 'Kształt 1' },
    });
    expect(html).toContain('<img src="https://cdn.sanity.io/images/shape-1.png"');
    expect(html).toContain('Kształt 1');
  });

  it('has no diagram block when the form has no diagram', () => {
    expect(renderQuoteEmail({ heading: 'Wycena', sections })).not.toContain('<img');
  });

  it('renders the warning when photos were dropped', () => {
    const html = renderQuoteEmail({ heading: 'Wycena', sections, warning: 'Zdjęcia pominięte' });
    expect(html).toContain('Zdjęcia pominięte');
  });
});
