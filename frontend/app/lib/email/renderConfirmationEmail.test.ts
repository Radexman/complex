import { describe, expect, it } from 'vitest';

import { renderConfirmationEmail, renderConfirmationEmailText } from './renderConfirmationEmail';

describe('renderConfirmationEmail', () => {
  it('greets the customer by first name', () => {
    const html = renderConfirmationEmail({ name: 'Jan Kowalski', formLabel: 'formularza wyceny' });
    expect(html).toContain('Dzień dobry, Jan!');
    expect(html).not.toContain('Kowalski');
  });

  it('falls back to a plain greeting without a name', () => {
    const html = renderConfirmationEmail({ name: '  ', formLabel: 'formularza wyceny' });
    expect(html).toContain('Dzień dobry!');
  });

  it("uses the client's wording and signature", () => {
    const html = renderConfirmationEmail({ name: 'Jan', formLabel: 'formularza wyceny tarasu' });
    expect(html).toContain('Twoje zgłoszenie dotarło do nas.');
    expect(html).toContain('prześlemy wstępną wycenę na adres e-mail podany w formularzu');
    expect(html).toContain('Zespół CComplex');
    expect(html).toContain('Zadaszenia i tarasy');
  });

  it('links the company e-mail and phone', () => {
    const html = renderConfirmationEmail({ name: 'Jan', formLabel: 'formularza' });
    expect(html).toContain('href="mailto:biuro@ccomplex.pl"');
    expect(html).toContain('href="tel:+48661242507"');
  });

  it('escapes the name', () => {
    const html = renderConfirmationEmail({ name: '<b>Jan', formLabel: 'formularza' });
    expect(html).toContain('&lt;b&gt;Jan');
  });
});

describe('renderConfirmationEmailText', () => {
  it('has the same message without markup', () => {
    const text = renderConfirmationEmailText({ name: 'Jan Kowalski', formLabel: 'formularza' });
    expect(text.startsWith('Dzień dobry, Jan!')).toBe(true);
    expect(text).toContain('biuro@ccomplex.pl');
    expect(text).toContain('+48 661 242 507');
    expect(text).not.toMatch(/<[a-z]/i);
  });
});
