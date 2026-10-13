# Client Feedback — Round 11 (SEO podstron, kolor banera, korekty formularzy wycen)

> **Source:** client feedback message, 13.10.2026.
> All visible copy is **Polish**; all identifiers stay **English**.

> _„We will need SEO inputs just like on the main page for each subpage of this project, this should
> look like Ustawienia / SEO on the main page in Sanity Studio, we will need ability to add color to
> the promotion banner in the studio, add couple popular colors selection in studio. On the offer
> subpages we need to get rid of ''Prowadzi do'' This is not needed. On wycena/taras we change the
> text of checkbox should be ''Zaznacz, jeśli wycena ma obejmować montaż'', next in the contact form
> change the name of company to CComplex, on wycena/zaluzje there should be 3 sections for ''Podaj
> wymiary otworu do zabudowy'' So each ''otwór'' should have dedicated height and width in cm. The
> remaining 2 should be optional. On wycena/zadaszenie first input ''Wybierz rodzaj zadaszenia'' we
> will need to change the from Przysienny -> przyscienne. On input ''wybierz rodzaj dachu'' change
> materia to ''pergole ekonomiczne'' and on roleta rzymska we need name (Roleta rzymska Deponti
> Verdeca) in Wyposażenie dodatkowe change utterage from ściana staa to zabudowa stała. Drzwi
> przesuwne, szyby bez ramek / bok 1 needs to be Zabudowa szklana przesuwna bezramowa - bok1, bok2,
> front. Drzwi przesuwne -> zabudowa szklana przesuwna ramowa - bok 1, bok 2, front. add to
> wyposażenie dodatkowe option markizy pddachowe, Pionowa roleta (pergole ekonomiczne) - bok 1,
> Pionowa roleta (pergole ekonomiczne) - bok 2, Pionowa roleta (pergole ekonomiczne) - front.
> Next on the Żaluzje tarasowe add (jeśli otworów jest kilka podaj wysokość i szerokość każdego
> z nich osobno)”_

---

## Status

Not started. This document reads the request against the current code. It is not the
implementation.

---

## Overview

| #   | Item                                                         | Where it lives                                  | Needs deploy?             | Difficulty  |
| --- | ------------------------------------------------------------ | ----------------------------------------------- | ------------------------- | ----------- |
| 1   | Pola SEO dla każdej podstrony (jak „Ustawienia / SEO”)       | Schema (nowy obiekt + singleton) + metadata     | yes + **Studio redeploy** | **largest** |
| 2   | Wybór koloru banera ogłoszeń                                 | `announcementBanner` schema + `AnnouncementBanner` | yes + **Studio redeploy** | small       |
| 3   | Usunięcie „Prowadzi do: …” z podstron oferty                 | `OfferFormCta.tsx`                              | yes                       | trivial     |
| 4   | `/wycena/taras` — nowy tekst pod checkboxem montażu          | `TarasForm.tsx`                                 | yes                       | trivial     |
| 5   | Formularz kontaktowy — „Complex” → „CComplex”                | `ContactForm.tsx`                               | yes                       | trivial     |
| 6   | `/wycena/zaluzje` — 3 otwory (1 wymagany, 2 opcjonalne)      | schema Zod + form + server action + e-mail      | yes                       | medium      |
| 7   | `/wycena/zadaszenie` — zmiany nazw opcji + 4 nowe wyposażenia | `zadaszenieForm.ts` + form + action + testy     | yes                       | small–medium |
| 8   | `/wycena/zadaszenie` — podpowiedź przy „Żaluzje tarasowe”    | `ZadaszenieForm.tsx`                            | yes                       | trivial     |

Items 3–8 are fixed copy in code, so each one needs a deploy. Items 1–2 change the schema, so the
Studio must also be redeployed (`npm run deploy` from `studio/`). Until then the editor cannot see
the new fields.

---

## 1. Pola SEO dla każdej podstrony

> _„SEO inputs just like on the main page for each subpage … should look like Ustawienia / SEO”_

### Current state

The **„Ustawienia / SEO”** singleton
([settings.tsx](studio/src/schemaTypes/singletons/settings.tsx)) holds `title`, `description`
(Portable Text) and `ogImage` (with `alt` and `metadataBase`). The root
[layout.tsx:27-56](frontend/app/layout.tsx#L27-L56) uses it as the default for the whole site and
as the title template `%s | {title}`.

Subpage SEO is managed in different ways today:

| Route                                  | Where metadata comes from today                                | CMS?           |
| -------------------------------------- | -------------------------------------------------------------- | -------------- |
| `/`                                    | `settings` (layout)                                            | ✅ full        |
| `/oferta/[slug]` (6 usług)             | `service.title` + `service.seoDescription`, OG = `heroImage`   | ⚠️ opis only   |
| `/faq`                                 | `faqPage.seoTitle` + `faqPage.seoDescription`                  | ⚠️ no OG       |
| `/polityka-prywatnosci`                | `legalPage.seoDescription`                                     | ⚠️ opis only   |
| `/o-nas`                               | hardcoded `metadata` in `page.tsx` (`aboutPage` exists)        | ❌             |
| `/oferta`                              | hardcoded `metadata`                                           | ❌             |
| `/realizacje`                          | hardcoded `metadata`                                           | ❌             |
| `/tarasy`                              | hardcoded `metadata`                                           | ❌             |
| `/wycena`                              | hardcoded `metadata`                                           | ❌             |
| `/wycena/{taras,zadaszenie,zaluzje,schody}` | hardcoded `metadata`                                      | ❌             |
| `…/przeslany-formularz`, `/dziekujemy-kontakt` | hardcoded, `noindex`                                   | — out of scope |

The thank-you pages stay out of scope. They are `noindex` (Round 10) and only open after a
real submission, so SEO fields would do nothing there.

### Proposed implementation

1. **New reusable object `seo`** (`studio/src/schemaTypes/objects/seo.ts`, icon `SearchIcon`)
   that mirrors „Ustawienia / SEO”:
   - `title` — „Tytuł strony (SEO)”, string, max ~60 znaków (warning, not an error)
   - `description` — „Opis strony (SEO)”, **text** (not Portable Text), max ~160 znaków (warning)
   - `ogImage` — „Obraz Open Graph”, image + `alt` (required when an image is set, same pattern as
     `settings`)
   - `noIndex` is **not** added. Nobody asked for it.

   All fields are optional. An empty field falls back to the current value (hardcoded or the
   document's own). Nothing changes on the live site until the editor fills something in.
2. **Pages that already have their own document** get a `seo` field in an **„SEO” group**
   (the `faqPage` pattern): `service`, `aboutPage`, `faqPage`, `legalPage`.
3. **Static pages with no document of their own** (`/oferta`, `/realizacje`, `/tarasy`,
   `/wycena`, 4 × `/wycena/[type]`) get a **new singleton „SEO podstron”** (`pageSeo`, fixed id,
   icon `SearchIcon`). It has one `seo` field per route, grouped „Oferta” / „Realizacje” /
   „Tarasy” / „Wyceny”, and sits in the structure next to „Ustawienia / SEO”.
   - Alternative: a document collection keyed by path. **Not recommended.** An editor could create
     a document for a route that doesn't exist, or a duplicate. A fixed field list cannot drift
     away from the real routes.
4. **Frontend:** a small helper `buildSeoMetadata(seo, fallback)` in `frontend/app/lib/` that
   merges a `seo` object with the fallbacks into a Next.js `Metadata`. Unit test it with Vitest
   (pure function, within the test scope). Every `page.tsx` from the table moves from
   `export const metadata` to `generateMetadata` with `sanityFetch({ …, stega: false })`.
5. **Existing fields** `service.seoDescription`, `faqPage.seoTitle/seoDescription`,
   `legalPage.seoDescription` already have content. Recommendation: **read the new `seo.*` first
   and fall back to the old field.** No data migration and no hidden fields in this round. Merging
   them into one field (migration + removal) would be a separate, conscious step.
6. Regenerate types (`npm run sanity:typegen`) and add queries through `defineQuery`.

### ⚠️ Found along the way: the brand is doubled in titles

The layout sets the template `%s | {settings.title}`, but subpages already append the brand
themselves (`${service.title} — Complex`, `'Realizacje — Complex'`, …). So the real `<title>`
is **„Realizacje — Complex | Complex”**. Moving to CMS titles fixes this naturally: `seo.title`
and the fallbacks should hold **only the page name**, and the template adds the brand. Fix it in
this round, since we are touching all of these files anyway.

---

## 2. Kolor banera ogłoszeń

> _„ability to add color to the promotion banner in the studio, add couple popular colors selection”_

### Current state

[AnnouncementBanner.tsx:68](frontend/app/components/layout/AnnouncementBanner.tsx#L68) has a
fixed glass strip: `bg-white/4 backdrop-blur-xl`, a green icon and a green outlined CTA pill.
The schema ([announcementBanner.ts](studio/src/schemaTypes/objects/announcementBanner.ts)) has no
color field.

### Proposed implementation

- New field `color` — „Kolor banera”, `string` with `options.list` + `layout: 'radio'` (a list of
  presets, **not** a hex picker). This is what the client asked for („couple popular colors”), and
  it keeps the coding standard: **no inline styles**. A free hex would need `style={{…}}`.
- Presets (proposed, to confirm):

  | value      | Studio label             | Feel                                  |
  | ---------- | ------------------------ | ------------------------------------- |
  | `brand`    | Zielony (kolor marki)    | today's look — **default**            |
  | `red`      | Czerwony                 | sale / last days                      |
  | `orange`   | Pomarańczowy             | promotion                             |
  | `yellow`   | Żółty                    | notice (dark text!)                   |
  | `blue`     | Niebieski                | information                           |
  | `graphite` | Grafitowy (neutralny)    | discreet                              |

- In the component: a `BANNER_THEMES` map `value → { bar, icon, cta }` with **full Tailwind class
  literals**. Tailwind v4 only sees classes it can find in the source, so `bg-${color}-600` won't
  work.
- `stegaClean(color)` before the lookup (Visual Editing adds invisible characters). An unknown or
  empty value falls back to `brand`. The existing document has no `color`, because `initialValue`
  doesn't backfill (same as every singleton so far). With this fallback the live banner looks
  exactly as it does today until someone picks a color.
- Contrast: every preset needs readable text and CTA colors (yellow → black text). Check
  AA (4.5:1) for the text and the `· do {data}` date.
- `AnnouncementBar.tsx` passes the new prop through. Add `color` to `announcementBannerQuery` and
  regenerate types.

---

## 3. Usunięcie „Prowadzi do: …”

> _„On the offer subpages we need to get rid of ''Prowadzi do''”_

[OfferFormCta.tsx:62-67](frontend/app/components/offer/OfferFormCta.tsx#L62-L67) — remove the
`<span>` with the `FileText` icon from `FormCtaButton`. This removes it under **both** buttons
(primary and secondary on „Akcesoria do zadaszeń”, from Round 10).

Clean up after it: the `FORM_LABELS` map and the `FileText` import are only used there, so remove
them (no unused code). Update the component's doc comment too, since it describes that line. The
`<div className="flex flex-col items-center gap-2">` wrapper around one `Link` becomes redundant
and can collapse.

---

## 4. `/wycena/taras` — tekst checkboxa montażu

[TarasForm.tsx:231](frontend/app/components/forms/TarasForm.tsx#L231):
`helperText="Zaznacz jeśli chcesz wycenić montaż wraz z materiałem"` →
**„Zaznacz, jeśli wycena ma obejmować montaż.”**

This is the exact wording already used in `ZaluzjeForm.tsx:157`, so both forms now match
(with the period, as on żaluzje). The checkbox label „Usługa montażu” stays.

> Note: `ZadaszenieForm.tsx:232` still says „…wraz z zadaszeniem”. The client didn't mention it,
> so we **leave it**. We can offer the same change.

---

## 5. Formularz kontaktowy — „CComplex”

[ContactForm.tsx:126](frontend/app/components/forms/ContactForm.tsx#L126) — the RODO consent says
„…przez **Complex sp. z o.o.** w celu…” → **„CComplex sp. z o.o.”**

⚠️ This is the data controller's name in a legal consent, so it must match the **registered
company name**. The same „Complex sp. z o.o.” also appears in the description of `/o-nas`
(`o-nas/page.tsx:16`) and probably in the privacy policy (CMS). The brand in e-mails and on
`/oferta` is already „CComplex”. We change only what was asked (the contact form) and ask one
question: is the KRS name „CComplex sp. z o.o.”? If yes, update the other places too.

---

## 6. `/wycena/zaluzje` — trzy otwory

> _„3 sections for ''Podaj wymiary otworu do zabudowy'' … each otwór should have dedicated height
> and width in cm. The remaining 2 should be optional.”_

### Current state

One opening: `openingHeight` (max 300) + `openingWidth` (max 1000), both required
([zaluzjeForm.ts:19-20](frontend/app/lib/validations/zaluzjeForm.ts#L19-L20)), in the left column of
[ZaluzjeForm.tsx:83-112](frontend/app/components/forms/ZaluzjeForm.tsx#L83-L112).

### Proposed implementation

- **Schema:** keep `openingHeight`/`openingWidth` as **Otwór 1** (required). Same field names, so
  e-mails, tests and the action change as little as possible. Add `opening2Height`,
  `opening2Width`, `opening3Height`, `opening3Width`, all optional (`''` → `undefined`, same
  limits 300/1000).
- **Pair rule:** for an optional opening, both or neither. If someone enters only the width of
  opening 2, show an error under the empty field („Podaj wysokość otworu 2”). Do this with
  `superRefine` on the object, with `path` pointing at the right field. Silently dropping half an
  opening would be a lead with incomplete data.
- **UI:** three subgroups headed „Otwór 1 \*”, „Otwór 2 (opcjonalnie)”, „Otwór 3 (opcjonalnie)”,
  each with Wysokość [cm] / Szerokość [cm]. On desktop the two inputs of one opening can sit side
  by side (`grid-cols-2`), so the left column doesn't grow three times taller than the right one.
  The heading „Podaj wymiary otworu do zabudowy (szerokość × wysokość) w cm” stays above the
  groups. The `*` moves to „Otwór 1”.
- **Server action** (`submitZaluzjeForm.ts`): extend `formDataToObject` and `onSubmit` (append only
  when a value exists). The e-mail lists rows „Otwór 1 — wysokość/szerokość [cm]”, and opening
  2/3 rows only when filled in. `renderQuoteEmail` probably already skips empty values, so check
  that.
- **Tests:** Vitest for the schema (one opening OK; half an optional opening → error on the right
  field; 3 openings OK; limits) and for the action (opening 2/3 rows appear in the e-mail only
  when filled in).

---

## 7. `/wycena/zadaszenie` — opcje i wyposażenie dodatkowe

All labels live in one place,
[zadaszenieForm.ts](frontend/app/lib/validations/zadaszenieForm.ts). The form, the server action
and the e-mail all read from there.

### 7a. „Wybierz rodzaj zadaszenia” (`CANOPY_TYPES`)

| Today         | Becomes          |
| ------------- | ---------------- |
| `Przyścienny` | **Przyścienne**  |
| `Wolnostojący`| **Wolnostojące** ⚠️ |

The client only mentioned the first one. With „Przyścienne” and „Wolnostojący” side by side, the
grammatical form would differ between the two options, so we apply **both** and mention it when
handing over (smoothing out, not a blocking question).

### 7b. „Wybierz rodzaj dachu” (`ROOF_TYPES`)

| Today            | Becomes                              |
| ---------------- | ------------------------------------ |
| `Materiał`       | **Pergole ekonomiczne**              |
| `Roleta rzymska` | **Roleta rzymska Deponti Verdeca**   |

### 7c. „Wyposażenie dodatkowe” (`EQUIPMENT_OPTIONS`) — final list in order

| #   | Field (`name`)               | Label                                                    | Change      |
| --- | ---------------------------- | -------------------------------------------------------- | ----------- |
| 1   | `equipWedgePoly`             | Klin boczny, poliwęglan w ramie alum. (kpl/2szt)         | —           |
| 2   | `equipWedgeGlass`            | Klin boczny, szkło w ramie alum. (kpl/2szt)              | —           |
| 3   | `equipLedLighting`           | Oświetlenie punktowe LED + pilot                         | —           |
| 4   | `equipPolyWallSide1`         | Zabudowa stała, poliwęglan / bok 1                       | renamed     |
| 5   | `equipPolyWallSide2`         | Zabudowa stała, poliwęglan / bok 2                       | renamed     |
| 6   | `equipPolyWallFront`         | Zabudowa stała, poliwęglan / front                       | renamed     |
| 7   | `equipFramelessDoorsSide1`   | Zabudowa szklana przesuwna bezramowa / bok 1             | renamed     |
| 8   | `equipFramelessDoorsSide2`   | Zabudowa szklana przesuwna bezramowa / bok 2             | renamed     |
| 9   | `equipFramelessDoorsFront`   | Zabudowa szklana przesuwna bezramowa / front             | renamed     |
| 10  | `equipFramedDoorsSide1`      | Zabudowa szklana przesuwna ramowa / bok 1                | renamed     |
| 11  | `equipFramedDoorsSide2`      | Zabudowa szklana przesuwna ramowa / bok 2                | renamed     |
| 12  | `equipFramedDoorsFront`      | Zabudowa szklana przesuwna ramowa / front                | renamed     |
| 13  | `equipUnderRoofAwning`       | Markizy podachowe                                        | **new**     |
| 14  | `equipVerticalBlindSide1`    | Pionowa roleta (pergole ekonomiczne) / bok 1             | **new**     |
| 15  | `equipVerticalBlindSide2`    | Pionowa roleta (pergole ekonomiczne) / bok 2             | **new**     |
| 16  | `equipVerticalBlindFront`    | Pionowa roleta (pergole ekonomiczne) / front             | **new**     |

- „markizy pddachowe” in the message is a typo, so the label is **„Markizy podachowe”**.
- We write „/ bok 1” with a slash, as the other items in the list do today. The client wrote
  „- bok1”, but that's how she noted it, not a request to change the separator.
- **Field names (`name`) stay** for the renamed items. They are internal identifiers, invisible to
  the user, and the e-mail is built from `label`. Renaming them would only add churn in the
  schema, `defaultValues`, `formDataToObject` and the tests.
- New fields: add `z.boolean()` to the schema, `false` in the form's `defaultValues`, and the line
  in `formDataToObject` in `submitZadaszenieForm.ts`. Check whether the action iterates over
  `EQUIPMENT_OPTIONS` (then nothing extra is needed) or lists the fields by hand.
- **Tests to update** (they assert the old labels):
  `zadaszenieForm.test.ts:42-48` (`CANOPY_TYPES`/`ROOF_TYPES`) and
  `submitZadaszenieForm.test.ts:108-124` (`'Wolnostojący'`, `'Drzwi przesuwne, szyby w ramie / front'`).
  Add an assertion that a new item (e.g. „Markizy podachowe”) reaches the e-mail.

---

## 8. „Żaluzje tarasowe” — podpowiedź o wielu otworach

> _„on the Żaluzje tarasowe add (jeśli otworów jest kilka podaj wysokość i szerokość każdego z nich
> osobno)”_

This is the free-text field „Żaluzje tarasowe” in the **canopy** form
([ZadaszenieForm.tsx:177-185](frontend/app/components/forms/ZadaszenieForm.tsx#L177-L185)), not the
`/wycena/zaluzje` page, which gets separate fields for 3 openings in item 6.

`helperText` → **„Podaj wymiary otworu do zabudowy: szerokość x wysokość [cm] (jeśli otworów jest
kilka, podaj wysokość i szerokość każdego z nich osobno)”**

Raising `rows` from 2 to 3 makes room for several openings. Optional placeholder:
„np. 250 x 220, 180 x 220”.

---

## Pytania do klientki (zebrane)

1. **Kolory banera:** is the proposed set of 6 presets OK (green, red, orange, yellow, blue,
   graphite)? Should the banner be **filled** with the color, or keep the glass look with only a
   colored accent?
2. **CComplex:** is the registered company name **„CComplex sp. z o.o.”**? If yes, should we also
   fix `/o-nas` and the privacy policy?
3. Informational, no answer needed: „Wolnostojący” → „Wolnostojące” for grammatical consistency
   with „Przyścienne”.

---

## Zakres testów

- `type-check` (both workspaces), `lint`, **Vitest**: new tests for `buildSeoMetadata`, the
  `zaluzjeForm` schema (3 openings, pair rule) and the `submitZaluzjeForm` action. Update
  `zadaszenieForm` / `submitZadaszenieForm` tests to the new labels and fields. Run a clean
  `next build` after `rm -rf .next`. All routes still prerender as before. Moving to
  `generateMetadata` must not make static pages dynamic.
- After `npm run sanity:typegen`, the Studio shows „SEO podstron”, an „SEO” group on `service` /
  `aboutPage` / `faqPage` / `legalPage`, and „Kolor banera” on the banner.
- In the browser:
  - `<title>` without the doubled brand on every route from the table in item 1. An empty `seo`
    gives the same text as today (minus the duplicate). A filled one overrides it, OG included.
  - Banner in each preset: contrast, CTA hover, no color → looks like today.
  - Oferta: no „Prowadzi do” under either button (also on „Akcesoria do zadaszeń”).
  - `/wycena/zaluzje`: submit with 1 opening, with 3 openings, and with half an opening → error.
    The e-mail shows only the filled-in openings.
  - `/wycena/zadaszenie`: new labels, 16 checkboxes, the new items reach the e-mail.
  - 0 console errors, no horizontal scroll at 390 px.
- **Studio redeploy** (`npm run deploy` from `studio/`), or the client won't see items 1–2.

## Poza zakresem

- SEO for the thank-you pages (`noindex`, item 1).
- A free hex picker for the banner (coding standard: no inline styles).
- Merging the old fields `seoDescription`/`seoTitle` into the new `seo` object (separate migration).
- The montaż-checkbox wording on `/wycena/zadaszenie` (not requested, item 4).
