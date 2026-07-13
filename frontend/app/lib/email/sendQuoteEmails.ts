import { Resend } from 'resend';

import type { EmailAttachment } from '@/app/lib/email/attachments';
import { renderConfirmationEmail } from '@/app/lib/email/renderConfirmationEmail';

export interface SendQuoteEmailsOptions {
  /** Subject of the lead email sent to the company. */
  subject: string;
  /** The rendered lead email (see `renderQuoteEmail`). */
  html: string;
  attachments: EmailAttachment[];
  customer: { name: string; email: string };
  /** Reads inside „Dziękujemy za przesłanie …", e.g. „wyceny tarasu". */
  formLabel: string;
}

export type SendQuoteEmailsResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR =
  'Nie udało się wysłać zapytania. Spróbuj ponownie lub zadzwoń: +48 661 242 507.';

/**
 * Sends the two emails a quotation submission produces: the lead (with photos and
 * any technical diagram) to the company, and a short confirmation back to the
 * customer. Never throws — the caller turns a failed result into an inline form error.
 *
 * Env is read lazily so a missing key doesn't break `next build`.
 */
export async function sendQuoteEmails({
  subject,
  html,
  attachments,
  customer,
  formLabel,
}: SendQuoteEmailsOptions): Promise<SendQuoteEmailsResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.QUOTE_FROM_EMAIL;
  const to = process.env.QUOTE_TO_EMAIL;

  if (!apiKey || !from || !to) {
    console.error(
      '[email] Missing RESEND_API_KEY, QUOTE_FROM_EMAIL or QUOTE_TO_EMAIL — email not sent.',
    );
    return { ok: false, error: GENERIC_ERROR };
  }

  const resend = new Resend(apiKey);

  const lead = await resend.emails.send({
    from,
    to: [to],
    // Lets the company reply straight to the customer from the lead email.
    replyTo: customer.email,
    subject,
    html,
    attachments: attachments.length > 0 ? attachments : undefined,
  });

  if (lead.error) {
    console.error('[email] Lead email failed:', lead.error);
    return { ok: false, error: GENERIC_ERROR };
  }

  const confirmation = await resend.emails.send({
    from,
    to: [customer.email],
    subject: 'Dziękujemy za zapytanie — CComplex',
    html: renderConfirmationEmail({ name: customer.name, formLabel }),
  });

  // The lead is already safely in the company's inbox, so a failed confirmation is
  // logged but not surfaced — telling the customer their submission failed would be
  // a lie, and would likely make them submit again.
  if (confirmation.error) {
    console.error('[email] Confirmation email failed:', confirmation.error);
  }

  return { ok: true };
}
