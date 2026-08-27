# Client Feedback — Round 8 (Tarasy Drewniane brands, Goliat link, material label cleanup, Biuro text weight, hero subheadline contrast)

Five items: four distilled from a redlined screenshot PDF (`19.08.pdf`, sent 19.08.2026), plus one
follow-up requested directly in chat (hero subheadline contrast, not in the PDF). All five are
small, independent, low-risk changes — no item touches another's files. Decisions below were
confirmed with the user up front (see the two recommended options chosen); one item needs the
client's own follow-up content, flagged **⚠️ blocked on client**.

All visible copy is Polish; all identifiers English.

---

## Client's feedback (paraphrased from the PDF)

> 1. Potrzebuję takie 3 sztuki na stronie Tarasy Drewniane (muszę opisać drewno) — [screenshot of
>    3 collapsed accordion rows in the Producenci/brands style].
> 2. W miejscu "goliatgres.pl" chciałabym, żeby było przekierowanie na stronę GOLIAT (+ wyróżnienie
>    czcionki).
> 3. Formularz wyceny tarasu — zostawiamy "Thermo Sosna" (przekreślone: "termososna"), zostawiamy
>    "Thermo Jesion" (przekreślone: "termojesion").
> 4. Tekst pod "Biuro" — też pogrubiony.
> 5. (chat follow-up, not in the PDF) The description under the main heading in the hero sections
>    on each page should be more white — better contrast.

---

## 1 — Tarasy Drewniane: 3 brand/variant entries

**Content-only — no code change.** Confirmed live (`tarasy-gresowe`'s `benefits` were checked in
the same pass, and `tarasy-drewniane`'s `brands` field was queried directly via the Sanity API):
`tarasy-drewniane` currently has `brands: null`. `OfferBrands`/`BrandItem`/`VariantGrid` (built for
the "Multiple Variants per Board Type" feature, 2026-08-19) are fully generic — driven entirely by
`service.brands`, with no per-slug special-casing anywhere in `OfferPage.tsx` or the brand
components. `OfferBrands.tsx:57` renders `null` when `brands` is empty, which is exactly why nothing
shows on that page today.

The 3 rows in her screenshot ("Tarasy kompozytowe komorowe Bruggan – Elegant Light 3D", "…Legro
Natural", "Tarasy kompozytowe pełne Bruggan – MultiColor") are **not current live content** — they
don't match anything in the dataset today. They're her visual reference for the accordion style she
wants, not literal copy to reuse.

**Confirmed approach:** this is hers to fill in directly in Studio — she creates 3 `brand` entries
under Tarasy Drewniane → Producenci (each with at least one `variant`: name, image + alt, specs;
description/manufacturer optional), the same array-editing flow she already used for Tarasy
kompozytowe. No placeholder scaffolding needed.

⚠️ **Blocked on client**: the wood descriptions themselves ("muszę opisać drewno") — hers to write,
nothing to do here until she has copy/photos ready.

**Action:** none in this codebase. If helpful, a short written walkthrough of "how to add a brand
entry" for Studio can be sent to her separately — not a code deliverable.

---

## 2 — "goliatgres.pl" → bold link to Goliat's site

Located precisely via a direct Sanity content query (not a guess): the string lives in exactly one
place, the `tarasy-gresowe` service document, `benefits[_key=="b3"].description`:

> *"Stosujemy wyłącznie płyty Goliat 2.0. Wzory: goliatgres.pl. Nie montujemy płyt powierzonych
> przez klienta."*

`benefit.description` (`studio/src/schemaTypes/documents/service.ts:202-206`) is a plain `string` —
no rich text, no link annotations, and this object is shared verbatim by **every** offer page's
"Zalety produktu" cards, rendered as inert text in `OfferBenefits.tsx:108-110`.

**Confirmed approach:** add two new optional fields to the shared `benefit` object, generic and
reusable rather than a one-off hack:

- `linkText` (string, optional) — the exact substring inside `description` to turn into a link, e.g.
  `goliatgres.pl`.
- `linkUrl` (url, optional) — the destination, e.g. `https://goliatgres.pl`.

Both empty by default on every existing benefit card (safe no-op — only this one card gets filled
in). Same shape/spirit as the existing `galleryFooterText` + `galleryFacebookUrl` precedent
(`service.ts:214-226`) — text plus an optional adjacent link, not full rich text.

### Files

| File | Change |
| --- | --- |
| `studio/src/schemaTypes/documents/service.ts:184-211` (the inline `benefit` object) | add `linkText` (string) and `linkUrl` (url, `rule.uri({scheme: ['http','https']})`), both optional, both `hidden: ({parent}) => !parent?.description` or similar so they only show once a description exists |
| `frontend/app/components/offer/OfferBenefits.tsx:108-110` | if `benefit.linkUrl` and `benefit.linkText` are both present and `benefit.description.includes(linkText)`, split the description around `linkText` and render the matched substring as `<a href={linkUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-accent underline hover:text-accent/80">`; otherwise render the description exactly as today (fallback — never breaks if the fields are unset or the text no longer matches) |

### TypeGen + content

- Schema change → `cd frontend && npm run sanity:typegen` (adds `linkText`/`linkUrl` to the
  `benefit` object type everywhere it's used).
- Studio redeploy required (`npm run deploy` from `studio/`) before she can see the new fields.
- Content: on the `tarasy-gresowe` document's `b3` benefit, set `linkText: "goliatgres.pl"` and
  `linkUrl: "https://goliatgres.pl"`.

⚠️ **Assumption:** link opens in a new tab (`target="_blank"`) since it navigates off-site to a
manufacturer's page — standard practice, but flag to the client if she'd rather it stay in-tab.

---

## 3 — Taras quotation form: drop the parenthetical from Thermo material labels

`frontend/app/components/forms/TarasForm.tsx:29-35`, `MATERIAL_OPTIONS`:

```ts
const MATERIAL_OPTIONS = [
  'Kompozyt',
  'Płyty Gresowe gr. 2 cm',
  'Thermo Jesion (Termojesion)',   // → 'Thermo Jesion'
  'Thermo Sosna (Thermososna)',    // → 'Thermo Sosna'
  'Świerk',
].map((value) => ({ value, label: value }));
```

One-line-each trim of the parenthetical duplicate spelling. Verified this is safe end-to-end:

- `material` is validated as a free `z.string().min(1, ...)` (`frontend/app/lib/validations/
  tarasForm.ts:52`) — not an enum, so there's no allow-list to update elsewhere.
- The value flows through unchanged: `TarasForm.tsx:105` → `submitTarasForm.ts:30` →
  `submitTarasForm.ts:81` (`{ label: 'Materiał', value: data.material }` in the lead email) — the
  cleaned label is what lands in the email, no separate copy to fix.
- No other file references these two literal strings (`MATERIAL_OPTIONS` is only used from this one
  component).

### Files

| File | Change |
| --- | --- |
| `frontend/app/components/forms/TarasForm.tsx:32-33` | `'Thermo Jesion (Termojesion)'` → `'Thermo Jesion'`; `'Thermo Sosna (Thermososna)'` → `'Thermo Sosna'` |

No schema/TypeGen/test impact.

---

## 4 — Kontakt: bold the text under "Biuro"

`frontend/app/components/sections/ContactShowroom.tsx:133-135` — `officeLabel` (the "Biuro" heading)
is already `font-bold`; `officeDescription` (the appointment-only note beneath it) is not:

```tsx
{officeDescription && (
  <p className="mt-1 font-body text-sm text-silver">{officeDescription}</p>
)}
```

**Change:** add `font-bold` to that `<p>`. Purely additive to the existing className — the
`text-silver` color and layout stay as-is; only weight changes, matching exactly what she asked for.

### Files

| File | Change |
| --- | --- |
| `frontend/app/components/sections/ContactShowroom.tsx:134` | add `font-bold` to `officeDescription`'s `<p>` className |

This block is fed by CMS fields (`contact.officeDescription`) but the text itself doesn't change —
styling only, same pattern as Round 7 item 4's Biuro/Obszar działania accent swap in the same file.

---

## 5 — Hero section subheadlines: lighten from silver to white

Every hero-style heading+description pairing in the app uses the same low-contrast pattern: the
`<h1>`/headline is `text-white`, but the description directly beneath it is `text-silver`
(`--color-silver: #9e9e9e`, `frontend/app/globals.css:11`) — noticeably dimmer, especially against
the dark gradient-overlaid hero photos. Found all 4 occurrences by grepping every Hero-style
component in the app (there is no shared `HeroSection` used across pages — each page composes its
own):

| Page | File | Line |
| --- | --- | --- |
| Home | `frontend/app/components/sections/HeroSection.tsx` | 98 |
| Offer subpages (`/oferta/[slug]`) | `frontend/app/components/offer/OfferHero.tsx` | 79 |
| O nas | `frontend/app/components/about/AboutHero.tsx` | 50 |
| Realizacje | `frontend/app/components/sections/ProjectsGrid.tsx` | 120-121 |

**Change:** replace `text-silver` with `text-white/80` on all four description elements — noticeably
lighter/higher-contrast than `#9e9e9e` while still reading as secondary to the fully-opaque-white
headline above it (keeps the visual hierarchy the design system establishes between headline and
subheadline, just moves the floor up).

⚠️ **Assumption:** `text-white/80` as the exact value — `/90` is the alternative if she wants it
closer to pure white; either is a one-word swap once she sees it live, no need to block on picking
the "right" number now.

**Bonus (Home hero only):** `HeroSection.tsx:98` currently reads `text-silver/110` — a leftover
opacity modifier that does nothing (Tailwind clamps alpha at 100%, and `#9e9e9e` is a solid hex with
no alpha channel to begin with, so `/110` behaves identically to no modifier at all). Worth cleaning
up to `text-white/80` in the same edit rather than carrying the dead `/110` forward.

**Not touched:** `ProjectsGrid.tsx:53`'s `text-silver` (a project card's surface-area caption) and
any other secondary/metadata text elsewhere in the app — this item is scoped to hero
headline-adjacent descriptions only, per the request. Card/table/label secondary text staying silver
is the intended hierarchy, not an oversight.

### Files

| File | Change |
| --- | --- |
| `frontend/app/components/sections/HeroSection.tsx:98` | `text-silver/110` → `text-white/80` |
| `frontend/app/components/offer/OfferHero.tsx:79` | `text-silver` → `text-white/80` |
| `frontend/app/components/about/AboutHero.tsx:50` | `text-silver` → `text-white/80` |
| `frontend/app/components/sections/ProjectsGrid.tsx:120-121` | `text-silver` → `text-white/80` |

No schema/TypeGen/test impact — pure Tailwind class swap, four files.

---

## Cross-cutting work

- **TypeGen:** item #2 only (`benefit.linkText`/`linkUrl`) → `cd frontend && npm run sanity:typegen`.
- **Studio redeploy required** — `npm run deploy` from `studio/` — for item #2's new fields to be
  visible, and generally good hygiene since this round touches schema.
- **Content work the client owns after this ships:** the 3 Tarasy Drewniane brand entries + wood
  descriptions (item #1), and confirming/filling `linkText`/`linkUrl` on the Goliat benefit card
  (item #2 — can be pre-filled by the developer during this pass instead, since the exact values are
  already known).
- **Tests:** nothing in this round touches `app/actions/` or `app/lib/` in a way that needs new
  Vitest coverage — items #2–4 are presentational/schema, item #1 is pure content.

## Verification checklist

- `npm test`, `npm run type-check` (both workspaces), `npm run lint`, clean `next build` after
  `rm -rf .next`.
- In-browser (Playwright/Chromium), 0 console errors/warnings:
  - `/oferta/tarasy-gresowe`: the "Płyty gresowe Goliat" benefit card renders "goliatgres.pl" as a
    bold, underlined link that opens `https://goliatgres.pl` in a new tab; every other benefit card
    on every other offer page still renders as plain text (no accidental linkification elsewhere);
  - `/wycena/taras`: material dropdown shows "Thermo Sosna" and "Thermo Jesion" with no parenthetical,
    and a submitted lead email shows the clean label;
  - `/kontakt` and every offer subpage's Contact block: the text under "Biuro" is visibly bold;
  - `/oferta/tarasy-drewniane`: brands section still renders nothing (null) until the client adds
    content — confirm this isn't mistaken for a bug during review;
  - Home, an offer subpage, `/o-nas`, and `/realizacje`: hero/header description text is visibly
    lighter than before and still reads as secondary to the headline above it.
- ⚠️ Do **not** drive a real quotation-form or contact-form send through Resend outside a controlled
  test — same standing caveat as every prior round.

## Out of scope / still open

- Tarasy Drewniane wood descriptions and images — hers to write and upload.
- Whether `linkText`/`linkUrl` should be exposed as a general "bold + link this benefit" feature to
  document for the client, versus just quietly used for this one card — flagged, not requested.
- Any other offer-page copy that might contain similar bare-domain mentions — this round only
  addresses the one instance she flagged (`tarasy-gresowe`'s "b3" benefit); not audited for
  copy-wide occurrences elsewhere.
