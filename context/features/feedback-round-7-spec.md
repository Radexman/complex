# Client Feedback — Round 7 (drop Elewacje, uniform tiles, Kontakt swap, form copy editability, GA thank-you pages)

Nine items distilled from a redlined screenshot PDF (`12.08.26.pdf`, sent 12.08.2026) plus a
14.08.2026 WhatsApp follow-up about Google Ads conversion tracking. Three other PDFs
(`pełne.pdf`, `komorowe.pdf`, `tarasy kompozytowe.pdf`) were the client's own draft wireframes for
splitting Tarasy kompozytowe into komorowe/pełne subpages — **superseded**, she explicitly reversed
that direction in the same WhatsApp thread (*"ostatecznie - nie robimy zakładek do strony
zadaszenia i tarasy - poradze sobie"*, 14.08). Not in scope; do not build them.

Decisions below were confirmed with the user up front (see the four recommended options chosen);
assumptions are marked **⚠️ assumption**.

All visible copy is Polish; all identifiers English.

---

## Client's feedback (paraphrased from the PDF + WhatsApp)

> 1. Realizacje: usuwamy 2 kategorie z filtrów — schody i elewacje (nie mam realizacji w tych
>    kategoriach do pokazania).
> 2–4. "Zobacz całą ofertę", "Bezpłatna wycena", "Nasze realizacje" nie przekierowują u mnie.
> 5. Kontakt: "obszar działania" ma nie być zielony — zwykłe czarne tło. Ma się rzucać w oczy że
>    mają umawiać wizytę — ten zielony pasek jak w obszarze działania dać do "BIURO".
> 6. Oferta: mniejsze, jednakowej wielkości kafelki (moje zdjęcia nie są dobrej jakości).
>    Usuwamy Elewacje z siatki.
> 7. Elewacje — ściągamy całkowicie (z menu, ze wszystkiego).
> 8. Brak możliwości zmiany tekstu we wszystkich formularzach wyceny.
> 9. Sekcja "Jak to działa" na podstronach oferty — przenieść na dół, przed Kontakt.
> 10. Galerie na podstronach oferty — mniejsze kafelki (x3 lub max4), plus tekst pod galerią
>     (chce napisać coś o Facebooku) i przycisk w stylu strony głównej — też nieedytowalny.
> 11. (WhatsApp, 14.08) Każdy formularz — w tym formularz kontaktowy — musi przekierowywać po
>     wysłaniu na własny, osobny adres URL, żeby Google Ads mógł liczyć konwersje per kampania.

---

## 0 — Verify first: the three "not redirecting" CTAs (items #2–4)

*"Zobacz całą ofertę"* (`OfferSection.tsx` → `/oferta`), *"Bezpłatna wycena"* (hero →
`/wycena/zadaszenie`), *"Nasze realizacje"* (hero → `/realizacje`) are all already wired correctly
per prior feature history — no bug expected in the code. Most likely a stale hosted-Studio bundle
or a CDN/browser cache on her end (this repo has hit that exact failure mode repeatedly — see
history entries from 2026-06-15 through 2026-07-28).

**Action: check in a real browser against the live deploy before touching any code.** If all three
work, tell her directly (likely a cache issue on her machine) and redeploy Studio (`npm run
deploy` from `studio/`) as routine hygiene since this round touches schema anyway. Only write code
if a genuine bug reproduces.

---

## 1 — Remove "Elewacje kompozytowe" completely

Full removal, not a soft hide — confirmed twice (§1's struck-out table, §7's explicit "z menu — ze
wszystkiego").

### Files

| File | Change |
| --- | --- |
| `studio/src/schemaTypes/documents/project.ts:15` | remove the `Elewacje kompozytowe` entry from `PROJECT_CATEGORIES` |
| `studio/src/schemaTypes/objects/offerCard.ts:22` | remove the `Elewacje kompozytowe` entry from `OFFER_SLUGS` |
| `frontend/app/lib/categories.ts` | remove the `'elewacje-kompozytowe'` entry from `CATEGORY_LABELS` |
| `frontend/app/components/layout/Navbar.tsx:34` | remove the Elewacje entry from `OFERTA_ITEMS` |
| `frontend/app/components/layout/Footer.tsx:39` | remove the Elewacje entry from `OFERTA_LINKS` |
| `frontend/next.config.ts` | add a permanent redirect `/oferta/elewacje-kompozytowe` → `/oferta`, same pattern as the existing `zaluzje-tarasowe` → `akcesoria-do-zadaszen` redirect |

### Content (Sanity, published)

- Unpublish (or delete) the `elewacje-kompozytowe` `service` document — its dynamic route
  `/oferta/elewacje-kompozytowe` then 404s without the code redirect above.
- Any published `project` documents categorized `elewacje-kompozytowe` need to be recategorized or
  unpublished — audit first (`client.fetch` count by category), don't guess. ⚠️ **Confirm with the
  client** whether those realizations should be deleted, hidden, or recategorized (e.g. under
  Zadaszenia tarasowe if the actual job included one).
- `sitemap.ts`'s offer-slugs query is driven live off published `service` docs, so it self-corrects
  once the document is unpublished — no code change needed there.

### TypeGen

Both schema edits regenerate the `ProjectCategory` / offer-slug union types
(`cd frontend && npm run sanity:typegen`) — `CATEGORY_LABELS`'s `Record<ProjectCategory, string>`
will fail to compile until its own entry is dropped too, so do the frontend edit in the same pass.

---

## 2 — Realizacje filter tabs: drop Schody + Elewacje

**Schody stays a real offer/product** (form, nav entry, `/oferta/schody-modulowe` — all untouched).
Only its Realizacje *filter tab* goes, because there's nothing to show under it yet. This is why it
can't just piggyback on Elewacje's removal from `CATEGORY_LABELS` above — schody-modulowe must
still resolve a label everywhere else (`OfferGallery`'s "Galeria — {categoryLabel}" header on that
offer page, the category badge on any future schody project card).

- `frontend/app/lib/categories.ts`: `CATEGORY_ORDER` currently `= Object.keys(CATEGORY_LABELS)` and
  is consumed only by `ProjectsGrid.tsx:140` for the tab list. Split it: keep `CATEGORY_LABELS` as
  the full label map (6 entries after Elewacje's removal above, schody-modulowe included), and add
  a new `REALIZACJE_TAB_CATEGORIES` — the same list minus `'schody-modulowe'` — for `ProjectsGrid`
  to map its tabs from instead of `CATEGORY_ORDER`.
- `frontend/app/components/sections/ProjectsGrid.tsx:140`: swap the `CATEGORY_ORDER.map(...)` tab
  loop to use `REALIZACJE_TAB_CATEGORIES`. Tab count goes from 8 → 6 (Wszystkie + 5 categories).

---

## 3 — `/oferta` grid: uniform tiles, no hero/banner

`frontend/app/components/offer/OfferIndexGrid.tsx` currently sizes cards via `bentoSpan()` (2×2
hero + trailing full-width banner + squares) — built for exactly 7 cards with zero empty cells. At
6 cards (post-Elewacje) that math no longer holds cleanly, and the client's own ask is simpler than
what's there: **"najlepiej wszystkie takiej samej wielkości"** — she wants every card the same size
regardless of card count, both because her photos are inconsistent quality and because it removes
the "does this still tile cleanly" maintenance burden every time a service is added/removed.

- Delete `bentoSpan()`, `SPAN_CLASSES`, `TITLE_CLASSES` entirely.
- Replace the grid with a plain uniform layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, every
  `ServiceCard` the same `aspect-4/3` (or `aspect-video` — pick one, apply everywhere), same title
  size, no `priority`-only-on-hero special case (⚠️ **assumption**: give the first-rendered card
  `priority` instead, since it's still the most likely LCP element).
- The stretched-link pattern (`after:absolute after:inset-0` on the title anchor), the hover action
  buttons, and the `isNew` badge are unaffected — those already work per-card, independent of span.
- **Content — new order** (`service.order` field, published): Zadaszenia tarasowe, Tarasy
  kompozytowe, Tarasy drewniane, Tarasy gresowe, Akcesoria do zadaszeń, Schody modułowe (6 cards).

---

## 4 — Kontakt section: swap the green accent from "Obszar działania" to "Biuro"

Two components inside `ContactShowroom.tsx`, both already touch green — swap which one is
*prominent*, don't just add/remove color blindly:

- **`frontend/app/components/ui/ServiceAreaNotice.tsx:19`** ("Obszar działania") currently:
  `border-l-4 border-accent bg-accent/10`, icon `text-accent`. This is the bold, eye-catching
  treatment — remove it. New: plain dark card, no accent border/background (e.g. `bg-bg-surface`,
  `border border-graphite`), icon goes muted (`text-silver`).
- **`frontend/app/components/sections/ContactShowroom.tsx:126-138`** ("Biuro" block) currently:
  `border border-accent/30 bg-accent/10` — a subtler accent than ServiceAreaNotice's. Promote it to
  the exact bold treatment ServiceAreaNotice is losing: `border-l-4 border-accent bg-accent/10`
  (`CalendarClock` icon stays `text-accent`).

No schema change — both blocks already read from CMS fields (`serviceAreaLabel`/
`serviceAreaDescription`, `officeLabel`/`officeDescription`); this is styling only.

---

## 5 — `ProcessTimeline` relocation on offer subpages

`frontend/app/components/offer/OfferPage.tsx:58` currently renders `<ProcessTimeline>` between
`OfferBenefits` and `OfferGallery`. Move it to immediately before `ContactShowroom` — i.e. after
the `OfferFormCta` block (line 76-84), right before the `contact &&` block (line 85). New
composition: Hero → Benefits → Gallery → Brands → TechSpecs → VatHighlight → FormCta →
**ProcessTimeline** → Contact.

One-line move in `OfferPage.tsx` — no schema/query change (still `processTimeline &&
<ProcessTimeline data={processTimeline} />`).

---

## 6 — Offer-page gallery: smaller tiles + Facebook note + "see selected" CTA

`frontend/app/components/offer/OfferGallery.tsx`:

- **Fewer/smaller columns.** Current grid is `grid-cols-2 md:grid-cols-3` with a 2×2 hero cell
  (`bentoClass`, lines 23-25, 128). Client wants 3, max 4 per row and no hero cell (same "hide weak
  photo quality with uniform small tiles" reasoning as items #2 and #6). Drop `bentoClass`/
  `SPAN_CLASSES`-equivalent, use a flat `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` with every cell
  `aspect-square`.
- **New optional CMS text field below the gallery.** She wants to write something referencing
  Facebook (a link to the page, presumably) but hasn't drafted the copy yet. Add an optional
  `galleryFooterNote` (or similar) — ⚠️ **assumption**: a simple `text` field is enough (no rich
  text/links needed unless she wants a clickable Facebook URL, in which case make it two fields:
  `galleryFooterText` + optional `facebookUrl`). Render only when populated; leave empty until she
  fills it in — don't invent copy.
- **New CTA button under the gallery.** There is currently **no** button in `OfferGallery` at all
  (verified — only `FeaturedProjectsSection.tsx:158` has a "Zobacz wszystkie realizacje" link, on
  the *home* page). The client's screenshot shows one under "Galeria — {category}", so this is a
  net-new addition, not a fix to something broken. Add a button styled like the homepage's ("Zobacz
  wybrane realizacje" — "selected", not "all", since this gallery is already filtered by category),
  linking to `/realizacje`. ⚠️ **assumption**: deep-linking to `/realizacje` pre-filtered by
  category is out of scope here — `ProjectsGrid` filters via local component state, not a URL
  param, so a category-scoped link would need new plumbing. Link to plain `/realizacje` unless the
  client asks for the filtered version.
- Her *"tez nie umiem zmienić"* about this button (and about the home page's "Zobacz wszystkie
  realizacje") is the same hardcoded-copy complaint as item #8 below — see that section for the
  scope decision (header/description only; button labels stay hardcoded static Polish copy this
  round, not CMS fields, to keep scope contained).

---

## 7 — CMS-editable quotation-form intro copy

**Scope: header title + description only** (confirmed) — not submit fine-print, not success-screen
copy. All four hardcoded today, verified in each `page.tsx`:

| Route | File | Hardcoded strings |
| --- | --- | --- |
| `/wycena/taras` | `frontend/app/wycena/taras/page.tsx:25,28` | "Formularz Wyceny Tarasu" / "Wypełnij poniższy formularz…" |
| `/wycena/zadaszenie` | `frontend/app/wycena/zadaszenie/page.tsx:20,23` | same pattern |
| `/wycena/zaluzje` | `frontend/app/wycena/zaluzje/page.tsx:20,23` | same pattern |
| `/wycena/schody` | `frontend/app/wycena/schody/page.tsx:24,27` | same pattern |

`taras` and `schody` already have a per-form Sanity singleton (`tarasFormConfig`,
`schodyFormConfig` — both currently diagram-only, see `studio/src/schemaTypes/objects/
schodyFormConfig.ts`). `zadaszenie` and `zaluzje` have **no Sanity document at all** today (pure
code, confirmed — no `sanityFetch` call in either page).

- Add `title` (string) and `description` (text) fields to `tarasFormConfig` and `schodyFormConfig`,
  each with the current hardcoded string as its Studio `initialValue` (doesn't backfill the
  existing published singletons — seed them explicitly after schema deploy).
- Create two new fixed-id singletons, `zadaszenieFormConfig` and `zaluzjeFormConfig`, matching the
  same shape (`title` + `description` only — no diagram, they don't have one). Register in
  `schemaTypes/index.ts`, add structure entries, wire Presentation `locations`/`mainDocuments` for
  `/wycena/zadaszenie` and `/wycena/zaluzje`, same as the `taras`/`schody` precedent.
- Each `page.tsx` fetches its config via `sanityFetch` and renders `config?.title ?? '<current
  hardcoded fallback>'` / same for description — in-component fallback so the page never breaks
  before she fills the field in.
- **TypeGen + Studio redeploy required** (new singletons + fields).

---

## 8 — Google Ads: distinct thank-you URL per form (WhatsApp, 14.08)

**The 4 quotation forms already satisfy this** — `/wycena/{taras,zadaszenie,zaluzje,schody}/
przeslany-formularz` shipped 2026-07-28, each a genuinely distinct, GA-trackable URL. **No code
change** — confirmed decision: don't rename these to her literal `/dziekujemy-wycena-*/` paths, GA
doesn't care about the exact string, only that the URL is unique per form. Verify in-browser
against the live deploy (folds into item #0's verification pass) and explain this to her directly —
she may be testing against a stale deploy, or generalizing from the one form that's actually
missing this (below).

**The real gap: the contact form.** It's a modal (`ContactFormDialog.tsx`, deliberate Round 3
decision — *"nie podstrona"*) with no URL at all; submitting it just swaps in `FormSuccessState`
inline (`ContactForm.tsx:70`). Confirmed approach: **keep the modal for fill-out**, but on a
successful submit, navigate to a new `/dziekujemy-kontakt` page instead of rendering the success
state inline — closes the modal in transit.

This reuses the exact infrastructure already built for the quotation forms — `FormType` in
`frontend/app/lib/formSubmissionSession.ts:16` already includes `'kontakt'` (built ahead of need),
and `FormSuccessState` already has a `kontakt` variant (baked in since 2026-07-27, never had a
caller until now).

### New route

`frontend/app/dziekujemy-kontakt/page.tsx`, modeled directly on
`frontend/app/wycena/taras/przeslany-formularz/page.tsx`:

```tsx
import type { Metadata } from 'next';
import ThankYouPageContent from '@/app/components/forms/shared/ThankYouPageContent';

export const metadata: Metadata = {
  title: 'Wiadomość wysłana — Complex',
  robots: { index: false, follow: false },
};

export default function DziekujemyKontaktPage() {
  return <ThankYouPageContent formType="kontakt" formHref="/" />;
}
```

`formHref="/"` — a direct/bookmarked visit with no submission record redirects home (there is no
dedicated `/kontakt` page to send them back to; the form only exists as a modal).

### `ContactForm.tsx` change

- On successful submit: call `markFormSubmitted('kontakt', data.email)` (same call the four
  quotation forms make), then `router.push('/dziekujemy-kontakt')` instead of rendering
  `<FormSuccessState formType="kontakt" …>` inline (line 70 goes away).
- The dialog needs to actually close during this navigation — `ContactFormDialog` is controlled
  from `Navbar`; thread an `onSuccess` callback down (`ContactForm` → `ContactFormDialog` →
  `Navbar`'s `setContactOpen(false)`) so the modal unmounts as the route changes, rather than
  sitting open over the new page.

### Not needed

- `/dziekujemy-kontakt` follows the existing `noindex` + sitemap-exclusion pattern the four
  `przeslany-formularz` pages already use — nothing new to configure there.

---

## Cross-cutting work

- **TypeGen:** items #1 (category unions), #7 (two new singletons + fields on two existing ones) →
  `cd frontend && npm run sanity:typegen`.
- **Studio redeploy required** — `npm run deploy` from `studio/`. Without it the client can't see
  the new form-config fields, can't fill in the Facebook gallery note, and (per item #0) may still
  be looking at a stale bundle that's the actual cause of the "not redirecting" complaints.
- **Content work the client owns after this ships:** fill in `zadaszenieFormConfig`/
  `zaluzjeFormConfig`/`tarasFormConfig`/`schodyFormConfig` title+description (safe to leave the
  seeded hardcoded-text default as-is if she has no changes), the Facebook gallery note, and decide
  what happens to any `elewacje-kompozytowe` realizations.
- **Tests:** nothing in this round touches `app/actions/` or `app/lib/` in a way that needs new
  Vitest coverage except possibly `formSubmissionSession` (already tested, `'kontakt'` was already
  a valid `FormType`) — no new unit-testable surface expected. Everything else is presentational/
  schema.

## Verification checklist

- `npm test`, `npm run type-check` (both workspaces), `npm run lint`, clean `next build` after
  `rm -rf .next` — `/oferta`, all remaining offer slugs, and the new `/dziekujemy-kontakt` route
  prerender as expected (the latter static or dynamic depending on how Next treats the guard).
- In-browser (Playwright/Chromium), 0 console errors/warnings:
  - the three CTAs from item #0 actually navigate on the live/dev deploy;
  - `/realizacje` shows exactly 6 tabs (Wszystkie + 5), no Schody/Elewacje;
  - `/oferta` shows 6 uniform-sized cards, no Elewacje, old `/oferta/elewacje-kompozytowe` 308s;
  - Kontakt block: "Obszar działania" plain, "Biuro" carries the green left-border accent;
  - each offer subpage: ProcessTimeline renders directly above the Contact block, not between
    Benefits/Gallery;
  - all four `/wycena/[type]` pages render their CMS title/description (fallback text if unseeded);
  - contact modal: submitting closes the modal and lands on `/dziekujemy-kontakt` with the echoed
    e-mail; a direct visit to `/dziekujemy-kontakt` redirects to `/`; the four existing
    `przeslany-formularz` pages are unaffected.
- ⚠️ Do **not** drive a real contact-form send if it would e-mail the dev inbox through Resend
  outside a controlled test — same standing caveat as every prior round.

## Out of scope / still open

- Exact Facebook-note copy — hers to write.
- Whether the `/realizacje` category-scoped deep link from the offer-gallery CTA is worth building
  — flagged, not requested explicitly.
- Disposition of any existing `elewacje-kompozytowe`-categorized realizations — needs a client
  decision (delete / recategorize / unpublish).
- `/o-nas` 404 status and the żaluzje/Akcesoria naming mismatch — pre-existing open items from
  earlier rounds, untouched here.
