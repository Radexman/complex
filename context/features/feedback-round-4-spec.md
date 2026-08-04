# Client Feedback — Round 4 (contact form fields, /wycena stripes, nav forms, realizacje badge, showroom photos)

Six items from the client's fourth feedback pass, sent 2026-08-04. This round is a **direct
follow-up to Round 3** (`feedback-round-3-spec.md`) — items 1, 2, 4 and 5 all react to things that
shipped there, and two of them partially **reverse** Round 3 decisions. Where that happens it is
called out explicitly, so nobody "fixes" it back later.

Decisions below were confirmed with the user up front; assumptions are marked **⚠️ assumption**.

All visible copy is Polish; all identifiers English. Nothing here needs new copy from the client
except the photos in item 6.

---

## Client's message (verbatim, for reference)

> 1. widziałam. moje spostrzeżenia dot. zmian - formularz kontaktowy: imię i nazwisko oraz nr
>    telefonu - nieobowiązkowe (nie chcą wpisywać), temat wiadomości - nie;
> 2. „przed i po" - b. fajne ale zobaczyłam problem - sebastian zrobił zdj. z róznych stron - na
>    jednym zdj. budynek jest inny niz na drugim oraz połozenie płyt jest inne - tu jest problem;
> 3. realizacje - opis zdj. zielony - może zastosowac inny kolor;
> 4. darmowa wycena - wolałabym żeby tylko wyświetlały się formularze - ta forma wyglada jak
>    realizacje - powinny być tylko formularze / np. równe paski/kafelki tylko z opisem formularza
>    żeby nic ich nie rozpraszało + dobrze by było żeby wyświetlały się z menu górnego (tak jak
>    było) - formularze są najważniejsze na stronie;
> 5. Vat - ok;
> 6. kontakt - bede chciała wstawić zdj. wystawki.

---

## 1 — Contact form: name + phone optional, subject field removed

The modal contact form (Round 3, item 2) asks for too much. Visitors won't type a name or a phone
number, so those two stop being required; the subject select goes away entirely.

**Result:** the only required inputs become **e-mail**, **wiadomość** and the **RODO consent**.

### Files

| File | Change |
| --- | --- |
| `frontend/app/lib/validations/contactForm.ts` | `name` + `phone` optional; drop `subject` and `CONTACT_SUBJECTS` |
| `frontend/app/components/forms/ContactForm.tsx` | drop `required` on the two fields, delete the `FormSelect` block |
| `frontend/app/lib/actions/submitContactForm.ts` | drop the „Temat" row; subject-line + confirmation-name fallbacks |
| `frontend/app/lib/validations/contactForm.test.ts` | rewrite the subject cases, add optional-field cases |
| `frontend/app/lib/actions/submitContactForm.test.ts` | same |

### Validation

- `name` and `phone`: empty string → `undefined` via the repo's existing `z.preprocess` pattern (the
  one the dimension fields use), so a blank input is *absent*, not a failed `.min()`.
- **When typed, they are still validated** — `phone` keeps its `min(9, 'Podaj numer telefonu')` and
  `name` its `min(2)`. Someone entering „12" should still be told it's wrong; only leaving it blank
  is now allowed.
- `email` stays required — with the phone optional it is the **only guaranteed way to reply**.
- `message` unchanged (`min(10)`).
- `CONTACT_SUBJECTS` is deleted, not hidden. It has no other consumer.

### Server action

- The „Wiadomość" section loses its „Temat" row and keeps only „Treść".
- `renderQuoteEmail` already **drops rows whose value is empty**, so an absent name or phone simply
  disappears from the lead e-mail — no change needed in the render layer.
- Lead subject line falls back when there is no name:
  `Formularz kontaktowy — ${data.name ?? data.email}`.
- `customer.name` is passed as `data.name ?? ''` — `renderConfirmationEmail` already degrades to
  „Dzień dobry!" on an empty name, so the customer confirmation needs no change.

### Copy

- Both labels become „Imię i nazwisko (opcjonalnie)" / „Numer telefonu (opcjonalnie)", so the
  existing footnote „* Pola obowiązkowe" stays truthful.
- ⚠️ **Tell the client:** a lead can now arrive with an e-mail address and nothing else. If they
  want to keep phoning people back, the phone field is the one to argue about — this is a
  deliberate trade of lead *quality* for lead *volume*, which is what she asked for.

---

## 2 — „Przed i po": no code change

The photos don't line up (different angle, different building visible, slabs in a different
position). **The user's call: this is not a code problem** — the source images will be re-aligned in
an image editor and re-uploaded, and the existing slider stays exactly as built.

- No component, schema or layout change to `BeforeAfterSection` / `BeforeAfterSlider`.
- The one published pair (`beforeAfterSection` → „Zadaszenia tarasowe", Opole) **stays live** until
  the corrected images replace it.
- One-line Studio hint only: extend the `beforeImage` field `description` in
  `studio/src/schemaTypes/objects/beforeAfterItem.ts` to say both photos must be taken **from the
  same spot, same angle and same distance**, otherwise the slider reveals two different scenes.
  Costs nothing (the Studio is being redeployed for items 4 and 6 anyway) and prevents the next
  upload repeating this.

---

## 3 — Realizacje: the green photo caption gets another colour

On `/realizacje` each card carries a category label in accent green
(`ProjectsGrid.tsx:45`, `text-accent`). It reads as a link and competes with the green CTAs.

- Replace with a **neutral badge**: white text on a dark translucent pill
  (`bg-black/50 backdrop-blur-sm text-white/90`), keeping the existing uppercase +
  `tracking-widest` treatment. Accent green stays reserved for actions.
- ⚠️ **assumption:** the exact replacement colour is our choice — the client only said „może
  zastosować inny kolor". It is a one-line change if she wants something else.
- **Scope is the card badge only.** Deliberately left green:
  - section eyebrows („Realizacje", „Nasze realizacje", „Metamorfozy" …) — those are headings, not
    photo captions;
  - the selected filter pill on `/realizacje` — that is a control showing state;
  - `OfferGallery`'s section eyebrow on the offer pages.
- The home page's featured cards have **no** category badge (it was dropped in an earlier feedback
  round), so there is nothing to keep in sync there.

---

## 4 — „Darmowa wycena": plain form stripes + forms back in the top menu

Two halves, both reversing Round 3 decisions.

### 4a — `/wycena` becomes a list of equal stripes, no photos

Today `/wycena` is a **bento grid of photo tiles** (2×2 hero + squares + banner), which is why the
client says it „wygląda jak realizacje". It becomes four **identical full-width rows** with nothing
but the form's name and description.

```
┌──────────────────────────────────────────────────┐
│ Formularz wyceny tarasu   [Najczęściej wybierany] │  →
│ Tarasy kompozytowe, gresowe i drewniane…          │
├──────────────────────────────────────────────────┤
│ Formularz wyceny zadaszenia                       │  →
│ Zadaszenia tarasowe — wybierz model dachu…        │
├──────────────────────────────────────────────────┤
│ Formularz wyceny żaluzji                          │  →
├──────────────────────────────────────────────────┤
│ Formularz wyceny schodów                          │  →
└──────────────────────────────────────────────────┘
```

- **Rename** `frontend/app/components/wycena/WycenaIndexGrid.tsx` →
  `WycenaFormList.tsx` (it is no longer a grid) and update the import in `app/wycena/page.tsx`.
- **Delete** `bentoSpan`, `SPAN_CLASSES`, `TITLE_CLASSES`, the `next/image` import and the
  `urlForImage` call — every sizing rule goes with them. All rows are the same height by
  construction (padding + content), which is the whole point of „równe paski".
- Each row is **one `<Link>` wrapping the whole stripe**. No stretched-`::after` overlay and no
  duplicate hover button — the bug Round 3 had to fix twice cannot recur here, because there is
  exactly one anchor per row.
- Row: `border border-graphite rounded-xl p-6 md:p-7`, hover → `border-accent/60` +
  `bg-bg-surface`; left = `font-heading` title (`text-xl md:text-2xl`) over a `text-silver`
  description; right = an arrow (`ArrowRight`) that translates on hover. Container `max-w-4xl`.
- The optional `badge` („Najczęściej wybierany") stays, as a small accent pill inline with the
  title. ⚠️ **assumption:** the client objected to *photos*, not to the promotion marker — one
  small pill on one row is a recommendation, not a distraction. Trivial to drop.
- CMS header (`eyebrow` / `headline` / `subheadline`) and the array-order-drives-display rule are
  unchanged. GSAP keeps a simple staggered row reveal.

**Schema:** remove the `image` field from `studio/src/schemaTypes/objects/wycenaFormCard.ts` and
reword `wycenaPage.forms`' description — it currently says „pierwsza karta jest największa", which
stops being true. Existing image data stays in the document, orphaned and harmless.

### 4b — „Formularze wycen" returns to the navbar

Round 3 deleted the „Formularze wycen" dropdown and routed everything through the green CTA. The
client wants the forms visible in the top menu again („tak jak było"), because „formularze są
najważniejsze na stronie".

- Restore a `WYCENA_ITEMS` constant in `Navbar.tsx`, using **the footer's existing labels and
  order** so the two never drift: „Wszystkie formularze" (`/wycena`), then taras, zadaszenie,
  żaluzje, schody.
- **Desktop:** `<NavDropdown label="Formularze wycen" items={WYCENA_ITEMS} />` placed immediately
  after the Oferta dropdown. `NavDropdown` already exists and is unchanged — only the deleted
  `cta` variant is not coming back.
- **Mobile drawer:** a second `Accordion.Item value="formularze"` inside the existing
  `Accordion.Root`. It is `collapsible` single-item, so Oferta and Formularze can't both be open —
  which is the behaviour we want in a full-screen drawer.
- The green **„Darmowa wycena" CTA stays exactly as it is**, still pointing at `/wycena`. The
  dropdown is an addition, not a replacement.
- ⚠️ **Verify horizontal fit at `lg` (1024 px).** This makes six entries in the centre nav
  (Strona główna, Oferta, Formularze wycen, Realizacje, O nas, Kontakt) plus two right-hand
  actions. If they collide, shorten the label to „Formularze" — do **not** re-introduce the
  `absolute left-1/2` centring that was removed for exactly this reason.

---

## 5 — VAT: accepted, no change

The client signed off („Vat - ok"). ⚠️ The standing caveat from Round 3 still holds: the 8%/23%
copy is a **tax claim**, the `footnote` field carries the hedge, and their accountant — not the
client's eyeball — should approve the final wording.

---

## 6 — Kontakt: photo gallery of the exposition („wystawka")

The client wants to show photos of the outdoor exposition in the contact block.

**Schema** — `studio/src/schemaTypes/objects/bottomCtaSection.ts`, group `showroom`:

```ts
defineField({
  name: 'showroomGallery',
  title: 'Zdjęcia ekspozycji',
  description: 'Zdjęcia wystawki pokazywane pod mapą w sekcji kontaktu. Możesz dodać od 1 do 6.',
  type: 'array',
  group: 'showroom',
  of: [ /* image, hotspot: true, required `alt` string */ ],
  validation: (rule) => rule.max(6),
})
```

**Frontend** — `frontend/app/components/sections/ContactShowroom.tsx`:

- A thumbnail row **below the Leaflet map** in the right-hand column:
  `grid grid-cols-3 gap-2`, each `aspect-square`, `object-cover`, `rounded-lg`.
- Clicking a thumbnail opens the **existing `ProjectLightbox`** — each image is mapped into its
  `LightboxProject` shape (`_id: _key`, `title: showroomLabel ?? 'Ekspozycja'`,
  `city: showroomAddress ?? ''`, `coverImage: image`) rather than building a second lightbox.
  ⚠️ If that mapping turns awkward in practice, fall back to plain non-clickable thumbnails —
  a second full-screen dialog component is not worth it.
- **Renders nothing when the array is empty**, so the layout is byte-identical until the client
  uploads the first photo.
- `bottomCtaQuery` is a whole-document select, so **no GROQ change** — the new field flows through
  after a TypeGen regen.
- ⚠️ **`ContactShowroom` is shared.** The photos will appear on the home page **and on all 8 offer
  pages**, exactly like the showroom address already does. That is consistent, but the client
  should know that uploading a photo here changes nine pages.

---

## Cross-cutting work

- **TypeGen:** schema changes in items 2, 4a and 6 → `cd frontend && npm run sanity:typegen`
  (regenerates `frontend/sanity.types.ts` and root `sanity.schema.json`; `studio/sanity.types.ts`
  catches up via `type-check`).
- **Studio redeploy required** — `npm run deploy` from `studio/`. It ships in place via the pinned
  `appId`. Without it the client cannot upload the exposition photos, and the Studio would still
  offer the now-dead image field on the form cards.
- **No content seeding needed.** Nothing in this round adds a field the client must fill for the
  site to look right; the gallery and the corrected before/after images are hers to upload.
- **Tests:** the contact schema and action are the only unit-testable surfaces
  (`app/lib/validations/`, `app/lib/actions/`). The rewritten `/wycena` list, the navbar dropdown
  and the gallery are presentational — no component tests, per the repo's test scope.

## Verification checklist

- `npm test` (147 baseline, contact tests rewritten), `npm run type-check` (both workspaces),
  `npm run lint`, clean `next build` after `rm -rf .next` — `/wycena` must still prerender static
  and all 7 offer slugs still SSG.
- In-browser (Playwright/Chromium), 0 console errors/warnings:
  - contact modal submits with **only** e-mail + message + RODO; empty submit shows exactly
    **3** inline errors; a 3-character phone still errors.
  - `/wycena` — all four stripes measure the **same height**, no images requested, one anchor per
    row, no horizontal overflow at 390 px.
  - navbar at **1024 / 1440 / 390** — „Formularze wycen" opens, all 5 links navigate, centre nav
    does not collide with the right-hand actions at 1024.
  - `/realizacje` — badge is no longer `text-accent`, still legible over light and dark photos.
  - contact block renders identically with an empty gallery; with photos, thumbnails open the
    lightbox.
- ⚠️ Do **not** drive a real contact-form send in the browser — it e-mails the dev inbox through
  Resend. The success and failure paths stay unit-tested (Round 3 precedent).

## Out of scope / still open

- **`/o-nas` is still a 404** in both navbar and footer (an untracked `about-us-spec.md` exists).
  Flagged in Round 3, still not fixed, still not this round.
- **No GA/GTM tag exists in the repo.** The `/wycena/*/przeslany-formularz` URLs built for it are
  still uncounted, and the contact modal remains uncountable by design.
- **Three buttons still read „Darmowa wycena"** (header CTA, home CTA block, hero). The hero one
  points at `/wycena/zadaszenie` per explicit Round 3 client feedback; the other two go to
  `/wycena`. One CMS field if she ever wants them aligned.
- The **żaluzje naming mismatch** (the offer is „Akcesoria do zadaszeń", the form is still
  „Formularz wyceny żaluzji") is untouched — the form describes the physical product.
