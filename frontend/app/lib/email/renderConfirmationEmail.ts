import { escapeHtml } from '@/app/lib/email/renderQuoteEmail';

const ACCENT = '#4CAF50';
const MUTED = '#6b6b6b';

export interface ConfirmationEmailOptions {
  /** The customer's name, as typed in the form. */
  name: string;
  /** Which quotation they submitted, e.g. „wyceny tarasu" (reads inside a sentence). */
  formLabel: string;
}

/** The „dziękujemy, odezwiemy się" note sent back to the person who filled the form. */
export function renderConfirmationEmail({ name, formLabel }: ConfirmationEmailOptions): string {
  const firstName = name.trim().split(/\s+/)[0] ?? '';
  const greeting = firstName ? `Dzień dobry, ${firstName}!` : 'Dzień dobry!';

  return `<!doctype html>
<html lang="pl">
  <body style="margin:0;padding:24px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border-radius:8px;">
      <h1 style="margin:0;font-size:22px;color:#111111;">${escapeHtml(greeting)}</h1>
      <p style="margin:16px 0 0;color:#111111;font-size:15px;line-height:1.6;">
        Dziękujemy za przesłanie ${escapeHtml(formLabel)}. Otrzymaliśmy Twoje zgłoszenie i już się nim zajmujemy.
      </p>
      <p style="margin:16px 0 0;color:#111111;font-size:15px;line-height:1.6;">
        Skontaktujemy się z Tobą w ciągu <strong>24 godzin roboczych</strong> — telefonicznie lub mailowo — aby omówić szczegóły i przygotować wycenę.
      </p>
      <p style="margin:24px 0 0;padding-top:24px;border-top:1px solid #e5e5e5;color:${MUTED};font-size:13px;line-height:1.6;">
        Masz pytanie w międzyczasie? Napisz na
        <a href="mailto:biuro@ccomplex.pl" style="color:${ACCENT};">biuro@ccomplex.pl</a>
        lub zadzwoń: <a href="tel:+48661242507" style="color:${ACCENT};">+48 661 242 507</a>.
      </p>
      <p style="margin:16px 0 0;color:${MUTED};font-size:13px;">Zespół CComplex — zadaszenia i tarasy</p>
    </div>
  </body>
</html>`;
}
