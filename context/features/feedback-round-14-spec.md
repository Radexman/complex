# Client Feedback — Round 14 (formularze, zdjęcia, e-maile, telefon, logo, cookies)

> **Source:** the client's printed checklist (2 pages, 13.11.2026) with handwritten notes, and her
> WhatsApp messages of 12–13.11.2026.
> All visible copy is **Polish**; all identifiers stay **English**.

> Handwritten on the checklist: _„konwersje / nie akceptuje ⇒ ja ciągle wysyłam formularz → więc
> powinno liczyć? (problemy z konfiguracją?)”_
> WhatsApp: _„powinien być jeszcze nr telefonu — zawsze widoczny […] Może w formie »kółeczka«, które
> się przesuwa, albo w menu u góry”_; _„w nowym LOGO nie widać, co pisze pod COMPLEX — może powinniśmy
> LOGO nieco zwiększyć?”_; _„Proszę ustawić adres biuro@ccomplex.pl jako klikalny link we wszystkich
> miejscach […] odnośnik ma prowadzić do mailto:biuro@ccomplex.pl”_; plus her AI assistant's
> instructions for a Cookiebot banner through GTM.

---

## Status

Not started. Audited against the code and production on 13.11.2026. This document is not the
implementation.

The work splits into two parts:

- **Part A:** changes in code (and two small panel changes), done in this repo.
- **Part B:** the cookie banner. That is set up in Cookiebot and Google Tag Manager, not in code;
  step-by-step instructions are in
  [feedback-round-14-cookies-guide.md](feedback-round-14-cookies-guide.md).

---

## Overview

| #   | Checklist item                                  | Audit result                                              | Where                     | Priority |
| --- | ----------------------------------------------- | --------------------------------------------------------- | ------------------------- | -------- |
| A1  | 7: „niektóre zdj. nie przechodzą”               | ❌ **Real bug: uploads over ~1 MB fail**                   | Code                      | **P0**   |
| A2  | 9: „Materia” → „Materiał”                       | ✅ Confirmed by the client (open since Round 12)           | Code                      | P1       |
| A3  | 10: WhatsApp hint at the photo upload           | New text                                                  | Code                      | P1       |
| A4  | 11: thank-you pages                             | Remove the shown e-mail; show steps 02–06                 | Code                      | P1       |
| A5  | Customer confirmation e-mail                    | New text                                                  | Code                      | P1       |
| A6  | 8: e-mail sometimes a table, sometimes „rozrzucony tekst” | No plain-text version is sent                   | Code                      | P1       |
| A7  | Phone always visible                            | Only at the bottom of the page today                      | Code                      | P1       |
| A8  | Logo: text under COMPLEX unreadable             | ❌ Uploaded with wide empty margins                        | Studio + code             | P1       |
| A9  | biuro@ccomplex.pl clickable everywhere          | ✅ Already `mailto:` everywhere checked                    | —                         | Done?    |
| A10 | 4, 5: sender „Complex” → „CComplex”             | Set by an environment variable, not code                  | Vercel                    | P1       |
| —   | 2: admin, 3: logo access                        | ✅ Ticked „ok” by the client                               | —                         | Done     |
| —   | Handwritten note on conversions                 | Explanation, no change                                    | —                         | Info     |
| B   | 1: cookie banner                                | ❌ Missing (known since Round 13)                          | Cookiebot + GTM           | **P0**   |

---

## A1. Photos over ~1 MB fail (P0)

> _„np. zdjęcie 260 kb przeszło, ale 5,6 MB nie przeszło (a powinno być do 10 MB)”_

### Root cause

The quotation forms send photos through a **Server Action** (`submitZadaszenieForm` etc., `'use
server'`). Two limits apply, and the form promises neither:

1. **Next.js:** Server Action request bodies are capped at **1 MB by default**
   (`experimental.serverActions.bodySizeLimit`, not set in this repo). The limit counts the whole
   multipart body, so every photo plus the form fields share 1 MB.
2. **Vercel:** function request bodies are capped at **4.5 MB**, and this can't be configured.

The dropzone ([FormFileDropzone.tsx](frontend/app/components/forms/shared/FormFileDropzone.tsx))
accepts up to 3 files of **10 MB each** and says „max. 10 MB • do 3 zdjęć”. A typical phone photo is
2–6 MB, so **most real photos fail today**, not just large ones.

### Fix

1. **Compress photos in the browser before sending.** Resize to a longest edge of about 2000 px and
   re-encode as JPEG (quality ~0.8), using `createImageBitmap` + canvas (`OffscreenCanvas` where
   available). A 5–6 MB phone photo usually ends up around 0.3–0.8 MB, which is plenty for a quote.
   Keep PNG/WebP files that are already small as they are.
2. **Raise the Server Action limit to `'4mb'`** in `next.config.ts`, safely below Vercel's 4.5 MB
   including multipart overhead.
3. **Check the total before submitting.** If the compressed photos still exceed the budget (about
   3.5 MB total), show a friendly Polish error near the dropzone instead of a failed submission, and
   point to the WhatsApp alternative (A3).
4. **Update the dropzone text** so it doesn't promise 10 MB per file. The user may still pick large
   photos; the copy should say they will be reduced automatically.

Put the resize-target calculation (dimensions, quality, budget check) in a small helper in
`app/lib/` with Vitest tests; the canvas part stays in the client component.

**Verify:** on a local `next start` and after deploy, submit a form with three 5–6 MB phone photos
and confirm the e-mail arrives with all three attachments. Also test one PNG screenshot and one
small photo.

**Alternative (not recommended now):** direct uploads to storage (e.g. Vercel Blob client uploads)
bypass the 4.5 MB limit entirely, but add a storage service, tokens and cleanup for little gain.

---

## A2. „Materia” → „Materiał”

The client confirms the missing „ł” (open question since Round 12). Change the `ROOF_TYPES` value in
[zadaszenieForm.ts](frontend/app/lib/validations/zadaszenieForm.ts) to
„Materiał (pergole ekonomiczne)” and update `zadaszenieForm.test.ts`.

---

## A3. WhatsApp hint at the photo upload

Add this text under the dropzone:

> „Nie możesz dodać zdjęć? Wyślij je do nas przez WhatsApp na numer **661 242 507**. W wiadomości
> podaj **adres e-mail** wpisany w formularzu.”

The client asked for it on `/wycena/zadaszenie`. Since the upload problem (A1) affects every form
using the shared `FormFileDropzone`, **add it in the shared component**, so all quotation forms with
photos get it. Make the number a WhatsApp link (`https://wa.me/48661242507`, the link the footer
already uses), opening in a new tab.

---

## A4. Thank-you pages

Pages: `/wycena/{zadaszenie,taras,zaluzje,schody}/przeslany-formularz` and `/dziekujemy-kontakt`,
all rendered by [FormSuccessState.tsx](frontend/app/components/forms/shared/FormSuccessState.tsx).

1. **Don't show the submitted e-mail address.** The client tested with `info@ccomplex.pl`, and the
   page read „Skontaktujemy się z Tobą na adres info@ccomplex.pl…”, which looked like the company
   address. New text:
   - Quotation forms: „Dziękujemy! Twoje zapytanie zostało przyjęte. Skontaktujemy się z Tobą
     mailowo lub telefonicznie w ciągu **3 dni roboczych**.”
   - Contact form: „Dziękujemy za wiadomość! Odpowiemy na podany przez Ciebie adres e-mail
     najszybciej, jak to możliwe.”

   `submittedEmail` stays in use for the guard that bounces direct visits, just not displayed.
2. **„Co dalej? Oto kolejne kroki:” shows steps 02 to 06.** Today it shows three steps
   (`steps.slice(1, 4)`, steps 2–4). Change it to every step after the first (`steps.slice(1)`), and
   change the heading to „Co dalej? Oto kolejne kroki:”. Check the layout with five steps on mobile.

The headings („Zapytanie o zadaszenie wysłane!” etc.) stay as they are.

---

## A5. Customer confirmation e-mail

[renderConfirmationEmail.ts](frontend/app/lib/email/renderConfirmationEmail.ts), sent after every
quotation form. The client's new text:

> **Dzień dobry, {imię}!**
>
> Dziękujemy za przesłanie zapytania. Twoje zgłoszenie dotarło do nas.
>
> W ciągu **3 dni roboczych** prześlemy wstępną wycenę na adres e-mail podany w formularzu. Jeśli
> będziemy potrzebować dodatkowych informacji, skontaktujemy się z Tobą telefonicznie lub mailowo.
>
> Jeśli masz dodatkowe pytania, napisz na biuro@ccomplex.pl lub zadzwoń: +48 661 242 507.
>
> Pozdrawiamy,
> **Zespół CComplex**
> Zadaszenia i tarasy

Notes:

- Her draft reads „Dzień dobry,!”, which looks like the current greeting with the name left out.
  Keep the first name when present („Dzień dobry, Jan!”) and fall back to „Dzień dobry!”.
- „Zadaszenia i taras” in her draft is read as a typo for „Zadaszenia i tarasy”.
- She listed zadaszenie, schody and żaluzje; the same template also serves the taras form, so all
  four change together.
- Keep the `mailto:` and `tel:` links. Update the existing tests for this renderer.

---

## A6. E-mail sometimes a table, sometimes „rozrzucony tekst”

The lead e-mail ([renderQuoteEmail.ts](frontend/app/lib/email/renderQuoteEmail.ts)) is an HTML
table, and [sendQuoteEmails.ts](frontend/app/lib/email/sendQuoteEmails.ts) sends **only `html`**.
Mail apps, previews and notifications that show the plain-text part then get text derived from the
table layout, which reads as scattered words.

**Fix:** send an explicit `text` version alongside `html` for both e-mails: one „Etykieta: wartość”
line per field, sections separated by blank lines, and the list of attachments. Build it next to
`renderQuoteEmail` from the same rows, with tests.

**To confirm the cause:** ask the client for a screenshot of a „scattered” e-mail and which app
showed it (phone mail app, webmail, Outlook). If it turns out to be something else, adjust before
implementing.

---

## A7. Phone number always visible

> _„może w formie »kółeczka«, które się przesuwa, albo w menu u góry”_

The phone number appears only in the contact section near the bottom of the page and in the footer.

**Recommended:** a floating round call button (the client's first suggestion), bottom-right, on all
pages:

- `tel:` link with the number from the CMS footer (`contactPhone`, „+48 661 242 507”), with a
  `lucide-react` `Phone` icon, brand green, and an accessible name, e.g. „Zadzwoń: +48 661 242 507”.
- On desktop it may show the number as text next to the icon; on mobile, the icon only.
- Must not cover the cookie banner (Part B) or form buttons: position above the banner, and check
  the forms' sticky elements and the announcement banner.

**Alternative:** the number as a link in the top navbar (desktop) plus the floating button on
mobile only. Pick one before implementing; the floating button covers both screen sizes with one
component.

---

## A8. Logo: text under COMPLEX unreadable

The new logo is uploaded in Studio (Navbar and Footer) as a **1000×452 PNG with wide transparent
margins**; the visible logo is only **789×306** of it. The navbar renders the image at 60 px high
(`h-15`), so the visible logo is only about 40 px tall, and the line „Zadaszenia i tarasy” is about
7 px. The Round 13 spec warned about this.

**Fix:**

1. **Upload the trimmed file** (prepared:
   [ccomplex-logo-2026-11-trimmed.png](assets/ccomplex-logo-2026-11-trimmed.png), 789×306) in Studio
   → Nawigacja → logo and Stopka → logo. With no code change, the visible logo grows by about half.
2. **Then, if still too small**, raise the navbar logo height from `h-15` to `h-16`/`h-18` on desktop
   in [Navbar.tsx](frontend/app/components/layout/Navbar.tsx), keeping mobile as is, and check the
   hero clearance (`pt-28`) and the announcement banner.
3. Check the Organization JSON-LD logo (it reads the footer logo) after the upload.

---

## A9. biuro@ccomplex.pl clickable everywhere

Checked on 13.11.2026 in the code and on the live home page, offer page, FAQ, „O nas”, privacy
policy and quotation form: every visible `biuro@ccomplex.pl` is already a `mailto:` link (footer,
the contact section, the FAQ CTA, and the confirmation e-mail).

**No change planned.** Ask the client where she saw a non-clickable address (a screenshot is
enough). If it's inside CMS text (Portable Text), the editor can add a link there, or we add
automatic e-mail linking in the renderer.

---

## A10. Sender name „Complex” → „CComplex” (Vercel, not code)

The sender shown in both e-mails comes from the `QUOTE_FROM_EMAIL` environment variable. Change it
in **Vercel → Settings → Environment Variables (Production)** to:

```
CComplex <wycena@send.ccomplex.pl>
```

Then redeploy. Also update `frontend/.env.example`, which still shows `Complex <onboarding@resend.dev>`.

---

## Handwritten note: „ja ciągle wysyłam formularz → więc powinno liczyć”

Not a bug, but worth explaining to the client:

- Google Ads counts a conversion **only after a click on an ad**. Submitting a form after opening the
  site directly, or from a bookmark, never counts. With all campaigns paused, Ads correctly shows 0.
- After the cookie banner (Part B) is live, visitors who **reject** cookies are not measured
  directly; Google only estimates (models) them. Her own tests with cookies rejected won't show up.
- The proper test remains: a running campaign, a click on her own ad, a form marked „TEST”, then
  check Ads after 1–2 days (Round 13).

---

## B. Cookie banner

Checklist item 1: a banner on the first visit, to accept or adjust. Known gap since Round 13: no
banner, no Consent Mode, and the advertising cookie `_gcl_au` is set on the first visit.

**Approach:** Cookiebot (the client's choice, via her AI assistant) through the existing GTM
container `GTM-NWZ9GM5`, with Google Consent Mode v2. **No code change.** The full procedure is in
[feedback-round-14-cookies-guide.md](feedback-round-14-cookies-guide.md).

Corrections to the client's draft banner text, applied in the guide:

- It says „w naszym **sklepie internetowym**”: the site is not a shop.
- It offers only „Ustawienia cookie” and „Akceptuj wszystkie”. Rejecting should be as easy as
  accepting, so add „Odrzuć wszystkie” (Cookiebot's default layouts include it).

Also needed: the privacy policy (`/polityka-prywatnosci`, editable in Studio) should name Cookiebot,
Google Tag Manager, Google Ads and, once added, Google Analytics. That text is for the client or her
lawyer to approve.

---

## Tests and verification

- Vitest: the A1 compression helper, `zadaszenieForm.test.ts` (A2), the confirmation e-mail
  renderer (A5), the plain-text lead e-mail (A6).
- Lint, type-check, `npm test`, `next build`.
- Browser on a local `next start`: three large photos submit (A1); hint and link (A3); thank-you
  pages for a quotation form and the contact form (A4); the floating call button on desktop and
  mobile, not covering forms (A7); the logo after the Studio upload (A8).
- After deploy: one real submission per form type, checking both e-mails in a phone mail app and in
  webmail (A5, A6, A10).

---

## Questions for the client

1. A screenshot of an e-mail with „scattered text”, and which app showed it (A6).
2. Where did she see a non-clickable `biuro@ccomplex.pl` (A9)?
3. Floating call button on every page, or the number in the top menu (A7)?
4. Should the WhatsApp hint (A3) appear on all quotation forms? (Recommended: yes.)
