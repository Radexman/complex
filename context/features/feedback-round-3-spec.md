# Client Feedback — Round 3 (nav, contact modal, Przed i po, VAT, region notice)

Eight items from the client's third feedback pass. All decisions below were confirmed with the user
up front; where an assumption was made instead, it is marked **⚠️ assumption**.

All visible copy is Polish; all identifiers English. Every new block is CMS-managed with image
upload where images are involved.

---

## 1 — Navbar CTA „Darmowa wycena" becomes a quotation-forms dropdown

The green CTA keeps its look (accent background, black text) and gains a chevron; clicking opens the
**same 4 quotation forms** currently listed under „Formularze wycen".

- Reuses the existing `NavDropdown` machinery but with the button styled as the CTA, so the panel
  behaviour (outside pointerdown, Escape, close-on-select) is unchanged.
- **On an offer page**, that offer's own form is pulled to the top of the list and labelled
  „sugerowany" — preserving today's `OFFER_FORM_HREFS` shortcut at the cost of one click.
- `navbar.ctaButton.label` still drives the label. `navbar.ctaButton.href` becomes unused for the
  dropdown; leave the field in place (harmless, and it still feeds nothing else) — **⚠️ assumption:**
  no schema change here.
- Mobile drawer: the bottom CTA becomes an accordion listing the same 4 forms.

## 2 — „Formularze wycen" → „Formularz kontaktowy" (modal, **not** a subpage)

The „Formularze wycen" dropdown is removed from the navbar (its links now live behind the CTA from
item 1) and replaced by a **„Formularz kontaktowy"** button that opens an **Ark UI `Dialog` modal**
over the current page. No new route — the client explicitly said „nie podstrona".

New files, mirroring the four quotation forms:

```
frontend/app/lib/validations/contactForm.ts     ← Zod schema
frontend/app/lib/actions/submitContactForm.ts   ← 'use server' action
frontend/app/components/forms/ContactForm.tsx   ← the form body ('use client')
frontend/app/components/forms/ContactFormDialog.tsx ← Ark Dialog wrapper
```

- Fields: `name`, `phone`, `email`, `subject` (select), `message` (textarea), `consentRodo`
  (required), `consentMarketing` (optional) — all built from `components/forms/shared/`.
- Submission reuses `app/lib/email/` (`sendQuoteEmails` pattern): an HTML lead to `QUOTE_TO_EMAIL`
  with `replyTo` = the customer, plus the customer confirmation. **⚠️ assumption:** reuse the
  existing `QUOTE_FROM_EMAIL`/`QUOTE_TO_EMAIL` env vars rather than adding contact-specific ones.
- Success is shown **inside the modal** via the existing `FormSuccessState` (`formType: 'kontakt'`
  is already baked into it and currently unused). No thank-you route — the GA-countable-URL pattern
  from `/wycena/*/przeslany-formularz` does not apply to a modal. ⚠️ Worth telling the client that
  contact-form submissions will therefore **not** be countable in GA the way quotation forms are.
- The `contact-page-spec.md` in `context/features/` describes a full `/kontakt` **page**; it is
  superseded by this decision and used only as a copy/field reference.

## 3 — „Kontakt" link uses the home-page contact block

`/kontakt` **does not exist** — today's navbar and footer „Kontakt" links 404. Point both at
**`/#kontakt`** and add `id="kontakt"` (plus `scroll-mt-20` to clear the fixed navbar) to
`ContactShowroom`.

> ⚠️ `/o-nas` in the navbar and footer is **also a 404** (there is an untracked `about-us-spec.md`
> for it). Out of scope for this round — flagged, not fixed.

## 4 — Oferta → „Tarasy" expanded by default

`DropdownGroup` (desktop) and `MobileNavGroup` (drawer) both take an `defaultExpanded` prop;
the „Tarasy" entry in `OFERTA_ITEMS` sets it. Everything else stays collapsed.

## 5 — New home section „Przed i po"

A before/after image comparison slider, placed **after `FeaturedProjectsSection`**, before
`ProcessTimeline`.

**Implementation — no daisyUI.** daisyUI's `diff` component is pure CSS (`diff-item-1`/`diff-item-2`
+ a `resize: horizontal; overflow: hidden` resizer), but installing the plugin drags in its whole
theme/colour layer alongside this project's Tailwind v4 `@theme` tokens, and its resize grip is a
browser corner handle that behaves poorly on touch. We build the same layout natively as
`components/ui/BeforeAfterSlider.tsx` (~60 lines): absolutely-stacked images, the „after" clipped by
a percentage width, a draggable accent handle (pointer events, so mouse + touch), and
`role="slider"` + arrow-key support for keyboard users.

**Sanity — new `beforeAfterSection` fixed-id singleton** (Studio entry „Sekcja Przed i po",
`TransferIcon`), matching the repo's singleton precedent:

| Field         | Type                        | Notes                                   |
| ------------- | --------------------------- | --------------------------------------- |
| `eyebrow`     | string                      | Polish `initialValue`                   |
| `headline`    | string (required)           |                                         |
| `subheadline` | text                        |                                         |
| `items[]`     | array of `beforeAfterItem`  | min 1; each is one project              |

`beforeAfterItem` (inline object): `title` (required), `location`, `beforeImage` (image, hotspot,
required `alt`), `afterImage` (image, hotspot, required `alt`).

Rendering: one slider at a time; when `items.length > 1` a thumbnail/tab row underneath switches
project (Ark `Tabs`, same pattern as `ProjectsGrid`). With a single item the picker is hidden — which
is why the array shape is used even though the client asked for one pair.

Wire into `app/page.tsx` via `beforeAfterQuery`, guarded `{beforeAfter && …}`. Presentation
`locations` → home.

## 6 — Showroom map popup shows the footer address

The popup hardcodes „Kępska 12, 45-130 Opole"; the footer says
**„Kępska 12, 45-130 Opole, pok.20 (parter)"**. Rather than hardcoding the longer string, make it
CMS-driven:

- Add `mapAddress` (string) to the `bottomCtaSection` singleton, seeded with the footer's full
  string, and pass it from `ContactShowroom` into `ShowroomMap` as a prop (with the current string
  as the fallback so nothing breaks before seeding).
- Kept **separate** from `showroomAddress` on purpose: that field labels the outdoor exposition,
  which is not the same thing as the office room number.
- Coordinates and the Google-directions URL stay hardcoded (they already are). The postal code was
  corrected to 45-130 on the current branch.

## 7 — Prominent service-area notice

Today „Usługi montażowe wykonujemy na terenie województw śląskiego i opolskiego" appears only as
small grey print at the bottom of the four forms and the success panel. The client wants it
**prominent wherever contact is mentioned** → render it in the shared **`ContactShowroom`** block,
which appears on the home page **and** at the bottom of all 8 offer pages.

- New fields on `bottomCtaSection`: `serviceAreaLabel` (string) + `serviceAreaDescription` (text),
  with Polish `initialValue`s.
- New `components/ui/ServiceAreaNotice.tsx` — an accent-bordered callout (`MapPin`, same visual
  weight as the existing „Biuro" block) placed directly above the phone/e-mail buttons.
- The existing small-print lines in the four forms and `FormSuccessState` stay as they are (not in
  the confirmed scope).

## 8 — VAT advantage highlight

A compact highlight explaining that letting CComplex supply the materials means **8% VAT** on the
whole job, versus **23% VAT** when the client buys materials themselves. Confirmed placement:
**home page** + **every offer page**.

- New `components/sections/VatHighlight.tsx`, driven by a new **`vatHighlightSection` fixed-id
  singleton** (Studio entry „Sekcja VAT", `CreditCardIcon`).
- Fields: `eyebrow`, `headline` (required), `description`, `rates[]` (exactly 2 inline `vatRate`
  objects: `rate` e.g. „8%", `label`, `description`, `isAdvantage` boolean to style the good one in
  accent and the other muted), `footnote`, optional `ctaLabel` + `ctaHref`.
- Layout: two rate cards side by side (accent-bordered 8% vs graphite 23%) with the headline above
  and the footnote below — deliberately small, one band, not a full section.
- **Home placement:** directly after the new „Przed i po" section — **⚠️ assumption**.
  **Offer placement:** between `OfferTechSpecs` and `OfferFormCta` (i.e. right before the
  quotation CTA) — **⚠️ assumption**.
- ⚠️ **Copy must not over-promise.** The 8% rate applies to residential construction under the
  statutory limits, not unconditionally; the existing `techSpecs` copy already hedges with „może
  obowiązywać". The `footnote` field exists for exactly that and must be seeded with a hedge. The
  client should sign off on the final wording.

---

## Cross-cutting work

- **TypeGen:** two new singletons + new fields on `bottomCtaSection` → `npm run sanity:typegen`
  from `frontend/` after the schema edits; both workspaces' `sanity.types.ts` regenerated.
- **Studio:** register the new types in `schemaTypes/index.ts`, add structure entries, add
  Presentation `locations`.
- **Seed + publish** the two new singletons and the new `bottomCtaSection` fields (text only; the
  client uploads the before/after photos).
- **Studio redeploy** (`npm run deploy` from `studio/`) is required before the client can see or
  edit any of the new fields.
- **Tests:** the contact-form Zod schema and server action are new server-side units → Vitest
  coverage, matching the four quotation forms. The visual components are presentational → no tests.
- **Verify in-browser** (Playwright): nav dropdown + modal, the slider drag on desktop and touch
  widths, and 0 console errors.
