import { escapeHtml } from '@/app/lib/email/renderQuoteEmail';

const ACCENT = '#4CAF50';
const MUTED = '#6b6b6b';

export interface ConfirmationEmailOptions {
  /** The customer's name, as typed in the form. */
  name: string;
  /** Which quotation they submitted, e.g. „wyceny tarasu" (reads inside a sentence). */
  formLabel: string;
}

function greeting(name: string): string {
  const firstName = name.trim().split(/\s+/)[0] ?? '';
  return firstName ? `Dzień dobry, ${firstName}!` : 'Dzień dobry!';
}

/** The „dziękujemy, odezwiemy się" note sent back to the person who filled the form. */
export function renderConfirmationEmail({ name }: ConfirmationEmailOptions): string {
  return `<!doctype html>
<html lang="pl">
  <body style="margin:0;padding:24px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border-radius:8px;">
      <h1 style="margin:0;font-size:22px;color:#111111;">${escapeHtml(greeting(name))}</h1>
      <p style="margin:16px 0 0;color:#111111;font-size:15px;line-height:1.6;">
        Dziękujemy za przesłanie zapytania. Twoje zgłoszenie dotarło do nas.
      </p>
      <p style="margin:16px 0 0;color:#111111;font-size:15px;line-height:1.6;">
        W ciągu <strong>3 dni roboczych</strong> prześlemy wstępną wycenę na adres e-mail podany w formularzu. Jeśli będziemy potrzebować dodatkowych informacji, skontaktujemy się z Tobą telefonicznie lub mailowo.
      </p>
      <p style="margin:16px 0 0;color:#111111;font-size:15px;line-height:1.6;">
        Jeśli masz dodatkowe pytania, napisz na
        <a href="mailto:biuro@ccomplex.pl" style="color:${ACCENT};">biuro@ccomplex.pl</a>
        lub zadzwoń: <a href="tel:+48661242507" style="color:${ACCENT};">+48 661 242 507</a>.
      </p>
      <p style="margin:24px 0 0;padding-top:24px;border-top:1px solid #e5e5e5;color:#111111;font-size:15px;line-height:1.6;">
        Pozdrawiamy,<br />
        <strong>Zespół CComplex</strong><br />
        <span style="color:${MUTED};">Zadaszenia i tarasy</span>
      </p>
    </div>
  </body>
</html>`;
}

/** Plain-text version of the same note, for mail apps that show the text part. */
export function renderConfirmationEmailText({ name }: ConfirmationEmailOptions): string {
  return [
    greeting(name),
    '',
    'Dziękujemy za przesłanie zapytania. Twoje zgłoszenie dotarło do nas.',
    '',
    'W ciągu 3 dni roboczych prześlemy wstępną wycenę na adres e-mail podany w formularzu. Jeśli będziemy potrzebować dodatkowych informacji, skontaktujemy się z Tobą telefonicznie lub mailowo.',
    '',
    'Jeśli masz dodatkowe pytania, napisz na biuro@ccomplex.pl lub zadzwoń: +48 661 242 507.',
    '',
    'Pozdrawiamy,',
    'Zespół CComplex',
    'Zadaszenia i tarasy',
  ].join('\n');
}
