# Wysyłka wycen mailem (Resend)

Replace the four quotation forms' `console.log` placeholder with real transactional email via
**Resend**. Each submission sends **two** emails:

1. **Lead email → the company** (`QUOTE_TO_EMAIL`) — an HTML table of the submission, with the
   customer's photos attached and, where the form has one, the technical diagram they measured
   against (Taras shape, Schody diagram).
2. **Confirmation email → the customer** (`data.email`) — a short „dziękujemy, odezwiemy się"
   note. Plain, no attachments.

Submission stays on the existing **server actions** (`app/lib/actions/submit*Form.ts`) — no
`/api/quote` route (the spec's route only earns its keep for webhooks / non-web clients).

## Formatting rules (the point of the feature)

The current console output dumps raw values (`C: undefined`, `Montaż: false`). The email must:

- **Omit empty rows entirely** — `undefined` / `null` / `''` / `[]` never render. Shape 1 shows
  only sides A and B.
- **Map booleans to Polish** — `true` → „Tak", `false` → „Nie".
- **Join arrays** — `['A','B']` → „A, B".
- **Escape HTML** — free-text `notes` and `name` are user input and go into markup.
- Render as an **HTML table with inline styles** (email clients drop `<style>` blocks and classes).

## Architecture

`app/lib/email/`:

| File                         | Role                                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `renderQuoteEmail.ts`        | Pure. `Section[] → HTML string`. Owns the omit/boolean/array/escape rules. Unit-tested.                            |
| `renderConfirmationEmail.ts` | Pure. Customer-facing „dziękujemy" HTML. Unit-tested.                                                              |
| `attachments.ts`             | Pure-ish. `File[] → Resend attachments` (Buffer content), with a total-size cap. Unit-tested.                      |
| `sendQuoteEmails.ts`         | The only module that touches the network. Sends the lead email + the confirmation. Returns a result, never throws. |

Each action then describes **its own data** as `Section[]` and calls `sendQuoteEmails(...)`. The
four actions share zero formatting logic.

`replyTo` on the lead email is set to the customer's address, so the company can just hit Reply.

## Diagrams

Do **not** trust a client-sent image URL. In the action, re-fetch the form's Sanity config
(`tarasFormConfig` / `schodyFormConfig`) with `client.fetch`, pick the matching shape, and build the
URL with `urlForImage`. Sanity's CDN is public, so:

- embed it in the HTML body as `<img src="https://cdn.sanity.io/…">`, **and**
- pass it to Resend as a remote attachment (`{ path: url }`) so the diagram survives a mail client
  that blocks remote images.

Zadaszenie and Żaluzje have no diagram — those sections are simply absent.

## Photos

`attachments: [{ filename, content: Buffer }]`. Resend caps attachments at **40 MB after base64
encoding**; the dropzone allows 3 × 10 MB. Cap the total at **20 MB raw** in `attachments.ts` — over
that, drop the photos and note it in the email body rather than failing the whole send (the lead
matters more than the photos).

## Failure handling

The Resend SDK returns `{ data, error }` (it does not throw). A send failure returns
`{ success: false, error: <Polish message> }` from the action, and the form renders an inline error
by the submit button instead of the success panel — a silently-lost lead is worse than an error.
The four form components currently ignore a non-success result; they need an error state.

## Environment

```bash
RESEND_API_KEY=re_...
QUOTE_FROM_EMAIL="Complex <onboarding@resend.dev>"   # test sender until ccomplex.pl is verified
QUOTE_TO_EMAIL=...                                    # company inbox (dev: the developer's own)
```

All server-only. Read lazily inside `sendQuoteEmails` so a missing key doesn't break `next build`.

**Testing caveat:** with the `onboarding@resend.dev` sender, Resend only delivers to the address
that owns the API key account. So during testing the customer confirmation also lands in the
developer's inbox. It starts working for real customers once the client verifies `ccomplex.pl` under
Resend → Domains and `QUOTE_FROM_EMAIL` switches to an address on it.
