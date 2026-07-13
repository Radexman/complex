/**
 * Renders a quotation submission as an HTML email for the company inbox.
 *
 * Shared by all four `/wycena/[type]` forms: each server action describes its own
 * submission as `Section[]` and this module owns every formatting rule, so the
 * forms can't drift from each other.
 */

export type RowValue = string | number | boolean | undefined | null | readonly string[];

export interface Row {
  label: string;
  value: RowValue;
}

export interface Section {
  title: string;
  rows: Row[];
}

export interface QuoteEmailOptions {
  /** Headline of the email, e.g. „Formularz wyceny tarasu". */
  heading: string;
  sections: Section[];
  /** Technical diagram the customer measured against (Taras shape / Schody diagram). */
  diagram?: { url: string; caption: string };
  /** Shown above the table, e.g. a note that photos exceeded the attachment limit. */
  warning?: string;
}

const ACCENT = '#4CAF50';
const BORDER = '#e5e5e5';
const MUTED = '#6b6b6b';

/**
 * Formats a value for display, or returns `null` when the row should be dropped
 * from the email entirely — empty optional fields (an unused terrace side, a
 * blank notes box) are noise in a quotation, not data.
 */
export function formatRowValue(value: RowValue): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value ? 'Tak' : 'Nie';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : null;

  if (Array.isArray(value)) {
    const items = value.map((item) => String(item).trim()).filter(Boolean);
    return items.length > 0 ? items.join(', ') : null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Preserves the line breaks an editor typed into the notes textarea. */
function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\n/g, '<br />');
}

function renderSection(section: Section): string {
  const rows = section.rows
    .map((row) => ({ label: row.label, value: formatRowValue(row.value) }))
    .filter((row): row is { label: string; value: string } => row.value !== null);

  // A section whose every row was dropped has nothing to say — skip its header too.
  if (rows.length === 0) return '';

  const cells = rows
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:14px;width:40%;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};color:#111111;font-size:14px;font-weight:600;vertical-align:top;">${escapeMultiline(value)}</td>
        </tr>`,
    )
    .join('');

  return `
    <h2 style="margin:32px 0 8px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:${ACCENT};">${escapeHtml(section.title)}</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border:1px solid ${BORDER};border-radius:6px;">
      <tbody>${cells}</tbody>
    </table>`;
}

export function renderQuoteEmail({
  heading,
  sections,
  diagram,
  warning,
}: QuoteEmailOptions): string {
  const body = sections.map(renderSection).join('');

  const warningBlock = warning
    ? `<p style="margin:24px 0 0;padding:12px 16px;background:#fff6e5;border-left:3px solid #e0a800;color:#7a5c00;font-size:13px;">${escapeHtml(warning)}</p>`
    : '';

  const diagramBlock = diagram
    ? `
      <h2 style="margin:32px 0 8px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:${ACCENT};">Rysunek techniczny</h2>
      <p style="margin:0 0 12px;color:${MUTED};font-size:13px;">${escapeHtml(diagram.caption)}</p>
      <img src="${escapeHtml(diagram.url)}" alt="${escapeHtml(diagram.caption)}" width="480" style="max-width:100%;border:1px solid ${BORDER};border-radius:6px;" />`
    : '';

  return `<!doctype html>
<html lang="pl">
  <body style="margin:0;padding:24px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:32px;background:#ffffff;border-radius:8px;">
      <h1 style="margin:0;font-size:22px;color:#111111;">${escapeHtml(heading)}</h1>
      <p style="margin:8px 0 0;color:${MUTED};font-size:13px;">Nowe zapytanie ze strony ccomplex.pl</p>
      ${warningBlock}
      ${body}
      ${diagramBlock}
    </div>
  </body>
</html>`;
}
