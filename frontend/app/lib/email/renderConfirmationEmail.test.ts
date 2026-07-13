import { describe, expect, it } from 'vitest';

import { renderConfirmationEmail } from './renderConfirmationEmail';

describe('renderConfirmationEmail', () => {
  it('greets the customer by first name', () => {
    const html = renderConfirmationEmail({ name: 'Jan Kowalski', formLabel: 'formularza wyceny' });
    expect(html).toContain('Dzień dobry, Jan!');
    expect(html).not.toContain('Kowalski');
  });

  it('names the form the customer submitted', () => {
    const html = renderConfirmationEmail({
      name: 'Jan',
      formLabel: 'formularza wyceny tarasu',
    });
    expect(html).toContain('formularza wyceny tarasu');
  });

  it('escapes the name', () => {
    const html = renderConfirmationEmail({ name: '<b>Jan', formLabel: 'formularza' });
    expect(html).toContain('&lt;b&gt;Jan');
  });
});
