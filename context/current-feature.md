# Current Feature: Client Feedback Round 6 — formularz żaluzji

## Status

In Progress

## Goals

Source: redlined client PDF `form. wyceny zluzje.pdf` (legend: red = added, ~~struck~~ = delete).
Scope is **`/wycena/zaluzje` only** — 6 items remain; the rest of the PDF was already shipped in
Round 5 (see History).

- **G1 — Consolidate the dimensions header.** Delete both current lines („Podaj wymiary otworu do
  zabudowy \*" + „Podaj wymiary otworu okiennego lub drzwiowego w centymetrach") and replace with
  one: **„Podaj wymiary otworu do zabudowy (szerokość × wysokość) w cm \*"**.
  `ZaluzjeForm.tsx:84-89`.
- **G2 — Height cap 500 → 300 cm.** `zaluzjeForm.ts:19` (`dimension(500, …)` → `300`), its message
  („Maksymalna wysokość to 300 cm"), and the two assertions in `zaluzjeForm.test.ts:52-57`. Width
  stays at 1000 cm — the PDF confirms the existing value, no change.
- **G3 — Delete the „Jak mierzyć otwór?" info card** entirely (the whole glass panel,
  `ZaluzjeForm.tsx:112-121`). Struck with no replacement. The `Info` import goes with it.
- **G4 — Reword the montaż helper.** „Zaznacz jeśli chcesz wycenić montaż wraz z żaluzjami" →
  **„Zaznacz, jeśli wycena ma obejmować montaż."** `ZaluzjeForm.tsx:167`.
- **G5 — Delete the Uwagi helper.** „Określ dodatkowe wymagania: kolor, rodzaj sterowania
  (ręczne/elektryczne), ilość sztuk itp." struck with no replacement → drop the `helperText` prop.
  `ZaluzjeForm.tsx:175`.
- **G6 — Reword the photo helper.** „Dodaj zdjęcie okna lub miejsca montażu — pomoże nam
  przygotować dokładną wycenę." → **„Dodaj zdjęcie miejsca montażu, aby ułatwić przygotowanie
  dokładnej wyceny."** `ZaluzjeForm.tsx:179`.

## Notes

**Already done in Round 5 — no action, do not re-apply:** the „my" drop + 5 → 3 dni roboczych in
the page hero and the fine print; „(opcjonalnie)" removed from the Imię/Numer telefonu labels and
„(opcjonalne)" from the photo label; the reworded RODO consent with the link on „Polityką
prywatności"; the marketing consent removed outright; „na **wybranych obszarach** województw…".
Verified against the current files, not assumed.

**„Zgoda jest wymagana" is struck in the PDF but stays** — same call as Round 5. That string is the
*validation error* under an unticked RODO box, not static copy; it is almost certainly collateral
from crossing out the marketing paragraph above it. Deleting it would leave a failed submit
unexplained.

⚠️ **Ordering mismatch in G1, flagged not resolved.** The new header reads „(szerokość × wysokość)"
but the inputs render **Wysokość first, then Szerokość** — and the client left both field labels
unstruck in that order. Defaulting to: use the client's exact header string, leave the field order
alone. Swapping the inputs is one line if she meant the header to describe the order.

**„ale nie wpisujemy słowa max" (G2)** reads as: don't surface a „Max. 300 cm" hint on the field
itself. Nothing to remove — the placeholder is „np. 220" and there is no helper text. The Zod
message („Maksymalna wysokość to 300 cm") only fires on an over-range value, so it is a validation
error like „Zgoda jest wymagana" and stays.

**Scope check:** this is presentational + one schema constant. No Sanity schema or GROQ change → no
TypeGen regen, **no Studio redeploy**. No new server actions or utilities → no new test files, but
`zaluzjeForm.test.ts` needs the 300 cm update. The other three quotation forms and `ContactForm`
are out of scope — `ContactForm` remains knowingly inconsistent (Round 5 note).

## History

### Mapa strony + Client Feedback Round 5 — formularze wyceny (2026-08-06)

Two features on **one branch** (`feature/sitemap`, cut from `main`), at the user's request —
the sitemap was finished but uncommitted when the form feedback arrived, so both were carried
to the merge together as **two focused commits**. No spec file: the sitemap was defined inline,
the forms from two redlined client PDFs (`form. wyceny tarasu.pdf`, `form. wyceny
zadaszenia.pdf`) plus a WhatsApp note, loaded via `/feature load`.

**Part 1 — `/sitemap.xml`: 4 → 17 URLs, and a live bug fixed.**

- ⚠️ **Every URL was missing its scheme.** The old file used the bare `host` header as the
  base, so entries read `complex-puce.vercel.app/oferta` — **not a valid `<loc>`**. Nobody had
  noticed because the file *looked* right. Now `NEXT_PUBLIC_SITE_URL` wins when set, falling
  back to `x-forwarded-proto` + `host` (https assumed remotely, http for localhost).
- **The resolution lives in a pure `app/lib/siteUrl.ts`** rather than inline in `sitemap.ts` —
  it is the only unit-testable part (9 new tests: scheme-less config, trailing slashes, blank
  config, proxy chains, the no-context fallback). Added `NEXT_PUBLIC_SITE_URL` to `.env.example`
  as optional.
- **Missing routes added:** `/realizacje`, `/tarasy`, the four `/wycena/*` forms and the **7
  `/oferta/[slug]`** pages from Sanity. `przeslany-formularz` pages stay out — they are
  `robots: noindex` and only render after a real submission.
- **One `sitemapQuery` fetches the offer slugs plus the freshest `_updatedAt` per CMS-driven
  route**, so each `lastModified` is a real document date. The home page's date is the newest of
  its **nine** singletons; `/realizacje` also tracks `project`. Via **`client.fetch`**
  (published perspective), not `sanityFetch` — a sitemap must never surface drafts, same
  reasoning as `generateStaticParams`.
- **The four form pages deliberately carry no `lastModified`** — their content is entirely in
  code, so any date would be fiction. `lastModified` is optional; omitting beats inventing.
- ⚠️ **`/sitemap.xml` still builds as dynamic (`ƒ`)** because it reads request headers. Setting
  `NEXT_PUBLIC_SITE_URL` on Vercel makes it prerender **static** *and* pins the canonical host —
  which will matter the moment the site moves off `complex-puce.vercel.app`.
- ⚠️ **There is still no `robots.ts`**, so nothing points crawlers at the sitemap. Offered, not
  taken this round.

**Part 2 — the four quotation forms.** „These are just text changes" **did not hold**: four of
the items reach into the Zod schemas, both server actions, the lead e-mails and ~40 tests.
Flagged before starting; the user confirmed and added two decisions of their own.

- **Turnaround 5 → 3 dni robocze, „wszędzie" (user's call, wider than the PDFs):** 4 page heroes
  + their `metadata.description`, the 4 forms' fine print, `FormSuccessState` (×2),
  `renderConfirmationEmail.ts` **and `AboutCta.tsx`** outside the forms. The „my" was dropped
  from the intro sentence. **The CMS was audited too** (GROQ across `processTimeline`, `service`
  techSpecs/benefits, `bottomCtaSection`, `wycenaPage`) — it carries **no** turnaround promise;
  the single „1–5 dni roboczych" hit is install *duration* on Tarasy kompozytowe and was left,
  same call as Round 3.
- ⚠️ **The marketing consent is gone from all four forms** — user's decision („leave only
  rodo"), matching the struck-out paragraph in both PDFs. Removed from the checkbox, the Zod
  field, `defaultValues`, the `formData` append and the „Zgoda marketingowa" row in the lead
  e-mail. **Quotation leads now collect RODO only — no marketing permission is captured at
  all.** Reversible, but re-consenting the existing list is not.
- **„Zgoda jest wymagana" was deliberately KEPT** even though the PDFs strike it — that string
  is the *validation error* under an unticked RODO box, not static copy. Striking it was almost
  certainly collateral from crossing out the marketing paragraph above it; deleting it would
  leave a failed submit unexplained. Verified it still fires.
- **„(opcjonalnie)" deleted from every label** („wystarczy gwiazdki"), plus the reworded RODO
  consent (link now on „Polityką prywatności") and „na **wybranych obszarach** województw…".
- **Zadaszenie — the structural one.** The single 7-option „rodzaj zadaszenia" select became
  **two independent fields**: `canopyType` (Przyścienny / Wolnostojący) and `roofType`
  (Poliwęglan / **Szkło** / Lamele aluminiowe / Materiał / Roleta rzymska), each its own row in
  the lead e-mail. „Kolor konstrukcji **ALUM**" → „aluminiowej", „biały krem" → „biały". The
  **7 equipment booleans were replaced by 12** with new field names — the e-mail keys off
  `EQUIPMENT_OPTIONS`, so that rippled into the action and its tests by construction.
- ⚠️ **The split turns 7 real products into a 2 × 5 = 10 free cross product.** The old labels
  encoded actual models (Pinela, Verdeca, Ekonomiczny); „Wolnostojący + Materiał" had no product
  behind it, and „Szkło" is new. **Nothing in the code prevents an impossible combination** —
  raised with the user, still open with the client.
- **Depth capped at 6 m** in the schema *and* on the stepper — `FormNumberInput` gained a `max`
  prop (it only had `min`). Left **unclamped** (`clampValueOnBlur={false}` kept) so an
  out-of-range value reaches Zod and the person is told why, instead of being silently
  corrected. Width's Zod cap of 20 m stays, but no UI `max` was added — the client only
  specified a depth limit.
- **Taras:** „Położenie tarasu względem budynku" + new helper, new Uwagi/photo helpers, and a
  **`MIN_SIDE_LENGTH = 0.1`** exported from the schema and reused by `DimensionInputs` so the
  input's `min` and the validation can't drift. Applied to optional sides too. Verified the
  `superRefine` does **not** double-report: a `0.05` side shows only „Minimalna długość to
  0,1 m", not that plus „Podaj długość boku A".
- **The three other suites passed even before their fixtures were touched** — Zod strips unknown
  keys, so `consentMarketing: false` lingered as dead fixture data rather than failing. Cleaned
  out of all six files anyway, and a positive test now asserts the parsed output has **no**
  `consentMarketing` property.
- ⚠️ **`ContactForm.tsx` was left alone** — it still says „(opcjonalnie)" and still has a
  marketing consent. The client's feedback covered the *quotation* forms; widening the scope to
  a form she has not reviewed (and dropping a consent there) was not ours to decide. **The site
  is knowingly inconsistent** until that is confirmed.
- **`FormNumberInput.tsx` carried a pre-existing uncommitted edit** (default `step` 0.01 → 0.1)
  which **rode along**, since this feature genuinely edits that file — the `Footer.tsx`
  precedent from the Easy Wins round.
- **No schema/GROQ change on the Studio side** → no redeploy needed, and the client sees these
  changes as soon as `main` is deployed. Everything altered here is hardcoded, which is exactly
  why she asked („w formularzach nie mogę sama zmieniać").
- ⚠️ **The CMS `serviceAreaDescription`** (home + all 8 offer pages) still says „na terenie
  województw…" while the forms now say „na wybranych obszarach". That one **is** editor-owned —
  she can change it herself in the Studio; deliberately not patched from here.
- **Left untouched (same precedent as prior features):** the pre-existing uncommitted
  `.mcp.json`, `OfferTechSpecs.tsx` and `ProjectsGrid.tsx`, `.claude/settings.local.json`, the
  untracked `.playwright-mcp/` artifacts, and the **content-identical** `sanity.schema.json` /
  `studio/sanity.types.ts` (verified: `git diff --stat` reports *nothing* — pure CRLF drift).
  `frontend/sanity.types.ts` **was** committed, carrying only the `SitemapQueryResult` addition.
- ⚠️ **`prettier --check` flags 64 files**, including four `przeslany-formularz/page.tsx` and
  `wycena/page.tsx` that this branch never touched — the pre-existing repo-wide line-ending
  condition again. **Proved it is only that:** `npx prettier <file> | diff --strip-trailing-cr`
  against six of the touched files returned **zero** content differences. Not „fixed", since a
  64-file reformat would bury the diff.
- Verified: **171/171 Vitest** (164 baseline → +9 new, −2 replaced), `type-check` (both
  workspaces), `lint` (only the pre-existing `useCountUp` warning at `TrustSection.tsx:65`),
  clean `next build` after `rm -rf .next` — all routes prerender as before, 7 offer slugs still
  SSG. Live `sitemap.xml` fetched from the dev server: **17 absolute URLs**, real dates, no
  thank-you pages. In-browser (Playwright/Chromium) across all four forms: **0 console errors,
  0 warnings**; zadaszenie renders 3 selects with exactly the right options, 12 equipment boxes
  and `aria-valuemax="6"` on depth, and an empty submit yields **8** inline errors (**none** for
  name or phone); żaluzje **5**, schody **11**; „opcjonalnie" and „marketingow" match **nothing**
  on any of the four pages.
- **Not driven in-browser:** a real form *send* — it would e-mail the dev inbox through Resend.
  The actions' success and failure paths stay unit-tested.

### Drobne zmiany — materiały tarasu, etykieta „Nowość", opcjonalne dane kontaktowe (2026-08-05)

Three small client-requested changes, defined inline via `/feature` (no spec file). Branch
`feature/small-changes`. The third item arrived **mid-session**, after the first two were already
implemented and the „Nowość" flag had been published.

- **`/wycena/taras` materials trimmed 8 → 5.** „Bangkirai" and „Angelim Amargoso" removed; the two
  composite entries („Kompozyt Komorowy" + „Kompozyt Pełny (Premium)") collapsed into one
  **„Kompozyt"**. The list is a hardcoded `MATERIAL_OPTIONS` in `TarasForm.tsx` — `material` is
  validated as a bare `z.string().min(1)`, so **nothing else references the old strings**; only the
  two test fixtures that happened to use „Kompozyt Komorowy" needed updating.
- **„Nowość" is a CMS field, not two hardcoded slugs.** New optional `service.isNew` boolean (Hero
  group, `initialValue: false`) added to `allServicesQuery` and rendered by `OfferIndexGrid` as an
  accent pill at the card's top-left. Deliberately CMS-driven so the client can retire the label —
  or move it to a different offer — without a deploy; hardcoding `['elewacje-kompozytowe',
'schody-modulowe']` would have been fewer lines and permanently wrong. **Seeded + published** on
  the two offers; neither had a pending draft, so only the flag went live.
- **The badge is `pointer-events-none` on purpose.** It sits at `z-10`, above the card's stretched
  `after:absolute after:inset-0` link overlay — the same overlay that took two attempts to get right
  in Round 3. Without the pointer-events opt-out it would have punched a dead spot into the top-left
  corner of both cards. Hit-tested the centre of both badges: they resolve to
  `/oferta/elewacje-kompozytowe` and `/oferta/schody-modulowe`, not to the span.
- **Name and phone are now optional on all four quotation forms** — the change `/kontakt` got in
  Round 4, carried over to `/wycena/*`. The `optionalText()` helper was **private to
  `contactForm.ts`**; extracted to `app/lib/validations/optionalText.ts` and imported by all five
  schemas, so the five can't drift (the `benefitIcons.ts` precedent). An untouched input arrives as
  `''` → `undefined`; a value that *was* typed is still length-checked.
- **Three ripples the schema change forced, none of them obvious from the request:** (1) the
  `preprocess` makes the RHF *input* type `unknown`, so each `error` prop needs a
  `FieldError | undefined` cast — `TarasForm` also needed the `FieldError` type imported, the other
  three already had it; (2) `formData.append('name', data.name)` no longer type-checks, so all four
  onSubmit handlers take `?? ''`; (3) each action's subject line would have read
  „Wycena tarasu — undefined" — now falls back to the e-mail address, and `customer.name` passes
  `?? ''` so `renderConfirmationEmail` degrades to its nameless „Dzień dobry!".
- **The e-mail body layer needed no change** — `renderQuoteEmail` already drops empty rows, so an
  absent name/phone simply vanishes from the lead rather than printing a blank field.
- ⚠️ **A quotation lead can now arrive with only an e-mail address.** Same volume-over-quality trade
  the contact form made in Round 4, but these are the leads the client phones back — worth repeating
  to her.
- ⚠️ **The Studio was NOT redeployed** — the client cannot see or untick the „Nowość" checkbox until
  `npm run deploy` is run from `studio/`. The flag is published and the badge is live on the site
  either way; only the editing UI is missing. Offered, not authorised.
- ⚠️ **`prettier --check` reports 142 files, including ones untouched for months** — a pre-existing
  repo-wide condition (line endings), not caused by this work. Deliberately not „fixed", since a
  reformat of 142 files would bury the actual diff.
- **Clearing `.next` for the clean build killed the running dev server again** (they share the
  directory) — the same footgun as the offer-index session. Do the browser verification *first*,
  then clear and build.
- Verified: **155/155 Vitest** (151 baseline + 4 new „accepts a submission with no name and no
  phone" cases, one per form — the too-short-value tests were kept, retitled „still rejects…"),
  `type-check` (both workspaces), `lint` (only the pre-existing `useCountUp` warning at
  `TrustSection.tsx:65`), clean `next build` after `rm -rf .next` — `/oferta` prerenders static, all
  7 offer slugs still SSG. In-browser (Playwright/Chromium): **0 console errors and 0 warnings**;
  the badge appears on exactly 2 of 7 cards; `/wycena/taras` lists the 5 materials; all four forms
  show „(opcjonalnie)" on both labels and an empty submit yields **7 / 7 / 5 / 11** inline errors
  (taras / zadaszenie / żaluzje / schody) with **none** for name or phone; „123" in a phone field
  still errors.
- **Not driven in-browser:** a real form *send* — it would e-mail the dev inbox through Resend. The
  actions' success and failure paths stay unit-tested.
- **Left untouched (same precedent as prior features):** the pre-existing uncommitted `.mcp.json`,
  `OfferTechSpecs.tsx`, `ProjectsGrid.tsx` and `FormNumberInput.tsx`, `.claude/settings.local.json`,
  and the untracked `.playwright-mcp/` artifacts. The generated `sanity.types.ts` /
  `sanity.schema.json` **were** committed — their line-ending drift resolved itself on the regen and
  they now carry only the `isNew` change.

### Strona „O nas" — `/o-nas` (2026-08-04)

The standalone About page, which **fixes a live 404** — „O nas" has been in the Navbar and Footer
since Round 3 with no route behind it. Spec: `context/features/about-us-spec.md` (untracked since
2026-07-08, committed with the feature). Branch `feature/about-us-page`. Two decisions confirmed up
front; a third — **deleting the team section outright** — came from the user mid-session.

- **Shipped five sections, not the spec's six:** `AboutHero` → `AboutStory` → `AboutValues` →
  **`ProcessTimeline` (shared, untouched)** → `AboutCta`. Content lives in a new **`aboutPage`
  fixed-id singleton** (the `realizacjePage`/`ofertaPage` precedent — the spec's
  `siteSettings.processTimeline` assumption is long obsolete here), with `aboutStat` and
  `aboutValue` as embedded objects. Seeded + published.
- ⚠️ **`AboutTeam` and the whole `teamMember` collection were built, seeded, then removed at the
  user's request** („get rid of AboutTeam.tsx"). Because the component was the only consumer of a
  lot of scaffolding, the scope was confirmed before deleting: the component, its page wiring,
  `teamMembersQuery`, the `teamMember` schema, the „Zespół" structure entry, the Presentation
  resolver, the three `team*` fields on `aboutPage`, **and** the 2 published people (unpublished
  then drafts discarded). Verified **0 remaining references** in code and `teamMember` **absent
  from the deployed schema**. If the section is ever wanted back, it is a full rebuild, not a
  re-enable.
- **`storyBody` is a plain `text` field split on `\n{2,}`**, not Portable Text (user's call).
  Reuses the `AboutSection.description` pattern exactly and **avoids adding `@portabletext/react`**
  — the repo still has no Portable Text rendering anywhere. The three seeded paragraphs carry no
  bold/links/lists, so the richer editor would have bought nothing today.
- ⚠️ **The spec's `<div className="bg-bg-deep">` wrapper around `ProcessTimeline` is a no-op** —
  that section paints its own `bg-bg-mid` (`ProcessTimeline.tsx:116`), so a wrapper is invisible.
  The intended alternating rhythm was achieved by assigning the *surrounding* sections instead:
  Hero **deep** → Story **mid** → Values **deep** → Timeline **mid** (fixed) → Cta **deep**.
  Measured in-browser as `#0B0B0C / #111111 / #0B0B0C / #111111 / #0B0B0C`. The Cta ended up back
  on the spec's `bg-bg-deep` only *after* the team section was cut — with it, the parity flipped.
- **Icon map extracted to `app/lib/benefitIcons.ts`** (`BENEFIT_ICON_MAP`), now shared by
  `AboutValues` and `OfferBenefits` — the spec asked for a shared `iconMap.ts` that did not exist.
  Mirrors the Studio's `BENEFIT_ICONS`, so the dropdown and the lookup can't drift.
  ⚠️ **`OfferTechSpecs` still holds its own copy** (the benefit icons plus 4 extras) — deliberately
  untouched, it carries a pre-existing uncommitted edit. Worth folding in later.
- ⚠️ **`AboutStory`'s GSAP had to resolve targets via `querySelectorAll`, not selector strings.**
  The image block is conditional (absent until a photo is uploaded), and a selector matching
  nothing produces the exact „GSAP target not found" warning fixed in `TrustSection` back in July —
  it was **observed in the console** before the guard went in, not merely anticipated. The section
  also degrades deliberately: with no image the grid drops to one column and the stats become a row
  under the text, instead of leaving half the row empty.
- **The user uploaded a `storyImage` in the Studio mid-session**, so the two-column path is what's
  live; the no-image fallback only matters if it is ever cleared. Image measured 560×700 (`4/5`).
- **CTA reconciliations:** primary → **`/#kontakt`** (the spec's `/kontakt` has never existed —
  same 404 this feature is fixing); secondary → **`/wycena`**, the Round 3 chooser page, rather
  than the spec's `/wycena/zadaszenie`; and the copy says **„5 dni roboczych"**, not the spec's
  „24 godzin", matching the site-wide promise standardised in Round 3.
- **Metadata title is just „O nas"** — the layout's `%s | <site>` template appends the brand
  (verified: „O nas | CComplex | Zadaszenia i tarasy | Śląsk i Opole"). `/o-nas` added to
  `sitemap.ts`, which now lists `/`, `/oferta`, `/wycena` and `/o-nas`.
- **Studio redeployed** (`npm run deploy` from `studio/`) — in place via the pinned `appId`, same
  URL, `Deployed 1/1 schemas`. **Verified against the deployed schema via MCP**, not assumed:
  `aboutPage` live with all 10 fields and **no `team*` leftovers**, `teamMember` gone entirely.
  ⚠️ The Studio **UI** is unverified as always (Playwright isn't logged in).
- ⚠️ **Two Playwright measurement traps produced convincingly wrong readings, both times looking
  like broken animations:** (1) `globals.css` sets **`scroll-behavior: smooth`**, so a stepped
  `window.scrollTo` loop races the smooth scroll and samples mid-flight — set
  `documentElement.style.scrollBehavior = 'auto'` first. (2) GSAP is **rAF-driven and throttled in
  headless**, so a 0.6 s stagger takes far longer in wall-clock time; a sample taken 2.5 s after
  scrolling showed cards at `0.50, 0.16, 0, 0, 0, 0` — a stagger in progress, not a stuck tween.
  The tell is the descending ramp across siblings. All 21 animated elements reach ≥0.99 given a
  6 s settle.
- **No new tests** — nothing unit-testable was added (`benefitIcons.ts` is a constant lookup, same
  as the untested `processStepIcons.ts`; the sections are presentational). Suite stays at
  **151/151**.
- **Left untouched (same precedent as prior features):** the pre-existing uncommitted `.mcp.json`
  and `OfferTechSpecs.tsx`, `.claude/settings.local.json`, the untracked `.playwright-mcp/`
  artifacts, and `ProjectsGrid.tsx`, which the user began editing **during** the commit step.
  `context/features/contact-page-spec.md` disappeared from the working tree mid-session (not by us).
- Verified: **151/151 Vitest**, `type-check` (both workspaces), `lint` (only the pre-existing
  `useCountUp` warning at `TrustSection.tsx:65`), clean `next build` after `rm -rf .next` —
  `/o-nas` prerenders **static**, all 7 offer slugs still SSG. In-browser (Playwright/Chromium):
  **0 console errors and 0 warnings** on a fresh load, 5 sections in the right order with 6 value
  cards and 3 stats, **no horizontal overflow at 390 px**, and the 3 „O nas" links in the
  header/footer/drawer now resolve **200 instead of 404**.

### Client Feedback — Round 4: contact fields, `/wycena` stripes, nav forms, showroom gallery (2026-08-04)

Six items from the client's fourth feedback pass, **two of which deliberately reverse Round 3
decisions**. Spec: `context/features/feedback-round-4-spec.md` (committed with the feature). Branch
`feature/feedback-round-4`, cut from `main`. Four decisions confirmed up front; one more (nav link
brightness) added mid-session by the user.

- **#1 Contact form — name and phone optional, „Temat wiadomości" deleted.** A new `optionalText()`
  helper reuses the repo's `preprocess` pattern: an untouched input arrives as `''` and becomes
  **`undefined`**, but a value that *was* typed is still length-checked — „123" in the phone field
  still errors, clearing it removes the error (both verified in-browser). Only **e-mail, wiadomość
  and the RODO consent** remain required. `CONTACT_SUBJECTS` deleted outright (no other consumer).
  The lead subject line falls back to the **address** when there's no name. **The e-mail layer
  needed no change** — `renderQuoteEmail` already drops empty rows (so absent name/phone simply
  vanish from the lead) and `renderConfirmationEmail` already degrades to a nameless „Dzień dobry!".
  ⚠️ **A lead can now arrive with an e-mail address and nothing else** — a deliberate trade of lead
  quality for volume, at the client's request. Worth repeating back to her if they phone people back.
- **#2 „Przed i po" — no code change.** The user's call: the mismatched shots (different angle,
  different building, slabs in another position) get re-aligned in an image editor rather than
  worked around in code. ⚠️ **The bad pair is published and stays live** („Zadaszenia tarasowe",
  Opole) until the corrected images replace it. Added a Studio hint on `beforeImage` — both photos
  must come from the **same spot, angle and distance**, since the slider overlays them.
- **#3 Realizacje badge** — the accent-green category caption read as a link and competed with the
  CTAs. Now a neutral pill (`bg-black/50` + `backdrop-blur` + `text-white/90`), uppercase treatment
  kept. Scope is **the card badge only**: section eyebrows and the selected filter pill stay green
  (headings and controls, not photo captions). ⚠️ The exact colour was our choice — one line to change.
- **#4a `/wycena` — bento photo grid → four equal stripes.** `WycenaIndexGrid.tsx` renamed to
  **`WycenaFormList.tsx`**; `bentoSpan`, `SPAN_CLASSES`, `TITLE_CLASSES`, `next/image` and
  `urlForImage` all deleted. **One `<Link>` wraps each whole row**, so the stretched-`::after`
  overlay bug Round 3 had to fix twice cannot recur — measured **0 nested anchors**.
  ⚠️ **They were not equal on the first build:** the taras row came out **142 px vs 119 px** because
  its description wraps to two lines — i.e. „równe paski" would have failed on the exact complaint.
  Fixed with `min-h-36` **plus** a `line-clamp-2` on the description (either alone is insufficient);
  all four then measured **144 px** at 1440 and 768. The Studio description field now warns that
  longer copy is trimmed to two lines.
  ⚠️ **At 390 px the promoted row is still 36 px taller** — the „Najczęściej wybierany" pill wraps
  onto its own line. Left as-is: equal from `md` up, and on a phone only one stripe is visible at a
  time. Pinning it would need a magic pixel height.
  **Schema:** `wycenaFormCard.image` removed (existing image data left orphaned, harmless) and
  `wycenaPage.forms`' description reworded — it still said „pierwsza karta jest największa".
- **#4b „Formularze wycen" is back in the navbar** — Round 3 had deleted it and routed everything
  through the CTA. `WYCENA_ITEMS` mirrors **the footer's labels and order** so the two can't drift.
  Desktop: a second `NavDropdown` after Oferta (reused unchanged — only the `cta` variant stays
  deleted). Drawer: a second `Accordion.Item` in the existing single-item `Accordion.Root`, so
  Oferta and Formularze can't both be open. The green „Darmowa wycena" CTA is untouched.
  **The `lg` fit risk was real but clears:** at 1024 the centre nav has **exactly 16 px** on both
  sides — that's the flex gap itself, so the row sits at its natural width with **zero slack**. A
  longer CMS `ctaLabel` would start compressing it. Fallback (unused) was shortening to „Formularze".
- **#5 VAT** — accepted by the client, nothing to do. ⚠️ The Round 3 caveat stands: it's a tax claim
  and their accountant should sign off on the wording.
- **#6 Showroom gallery** — new optional `showroomGallery` (max 6, required `alt`) on
  `bottomCtaSection`, rendered as `aspect-square` thumbnails **under the map**, reusing
  **`ProjectLightbox`** via a mapped `LightboxProject` (`_id: _key`, title = `showroomLabel`,
  city = `showroomAddress`) rather than a second dialog. Verified by **temporarily publishing one
  photo, then removing it** (the Round 3 placeholder precedent): thumbnail rendered 144², lightbox
  opened titled „Odwiedź naszą ekspozycję" with the address beneath; afterwards `showroomGallery` is
  `null` again with **no leftover draft** and every other field intact. With an empty array the
  section is **byte-identical** to before (map wrapper: 1 child, 320 px).
  ⚠️ **`ContactShowroom` is shared** — uploading a photo changes the home page **and all 8 offer
  pages**. Called out in the field description in the Studio.
- **Brighter nav links (user request, mid-session).** Top-level links, both dropdown triggers and
  the „Formularz kontaktowy" button went `text-silver` → **`text-white/80`** (active stays full
  white), same for the drawer's top-level entries. **Sub-items deliberately stay `silver`** — inside
  a solid panel they don't need the contrast, and the difference preserves the hierarchy.
- **No GROQ change** — `bottomCtaQuery` and `wycenaPageQuery` are whole-document selects, so the new
  field flowed through on a TypeGen regen alone.
- **Studio redeployed** (`npm run deploy` from `studio/`) — in place via the pinned `appId`, same
  URL, `Deployed 1/1 schemas`. **Verified against the deployed schema via MCP**, not assumed:
  `showroomGallery` live on `bottomCtaSection`, and `image` **gone** from `wycenaFormCard`.
  ⚠️ The Studio **UI** is unverified as always (Playwright isn't logged in).
- ⚠️ **Noticed, not fixed:** `/realizacje` logs an `next/image` LCP warning for its first card image
  — the same `priority` fix `/oferta` got in the offer-index feature. Pre-existing, out of scope.
- ⚠️ **`origin/feature/feedback-round-4` already existed** (pointing at the old `main`) before this
  session, so `git branch -d` refused; the local branch was force-deleted after confirming it was
  merged into `main`. **The stale remote branch is still there** — deleting it needs the user's SSH.
- **Left untouched (same precedent as prior features):** the pre-existing uncommitted `.mcp.json`
  and `OfferTechSpecs.tsx`, `.claude/settings.local.json`, the untracked `.playwright-mcp/`
  artifacts, and the two remaining untracked specs (`about-us`, `contact-page`).
- Verified: **151/151 Vitest** (147 baseline; the contact suite grew 16 → 20 — the schema and action
  are the only unit-testable surfaces, the rest is presentational), `type-check` (both workspaces),
  `lint` (only the pre-existing `useCountUp` warning at `TrustSection.tsx:65`), clean `next build`
  after `rm -rf .next` — `/wycena` still prerenders static, all 7 offer slugs still SSG.
  In-browser (Playwright/Chromium): **0 console errors** across the session; contact modal shows
  **exactly 3** inline errors on an empty submit and has no subject select; `/wycena` stripes
  uniform with no horizontal overflow at 390; the desktop dropdown opens with all 5 links on-screen
  and the drawer accordion expands with 5 visible links.
- **Not driven in-browser:** a real contact-form *send* — it would e-mail the dev inbox through
  Resend. The success and failure paths stay unit-tested.

### Client Feedback — Round 3: nav, contact modal, Przed i po, VAT, `/wycena` (2026-08-03)

Eight items from the client's third feedback pass, plus two more added mid-session by the user.
Spec: `context/features/feedback-round-3-spec.md` (committed with the feature). Branch
`feature/feedback-round-3`, cut from **`fix/contact-copy-updates`** rather than `main` — that branch
had 2 unmerged commits touching the same `ContactShowroom.tsx`, so branching off main would have
guaranteed conflicts. Its commits rode along in the merge. Seven decisions confirmed up front
across two question rounds, then **two of them were superseded mid-session**.

- **The CTA is not a dropdown — that changed mid-session.** It was built as a forms dropdown (with
  the current offer's form sorted first, marked „sugerowany"), then the user asked for it to
  **navigate to a chooser page** instead. Shipped as a new **`/wycena`** bento page: a
  `wycenaPage` singleton + `wycenaFormCard` object, with **Formularz wyceny tarasu** as the 2×2
  hero carrying a „Najczęściej wybierany" badge. **Card order in the array drives the layout**, so
  the client promotes a different form by reordering rather than by editing code. Cards reuse the
  matching offer's `heroImage` — no new uploads needed. The `NavDropdown` `cta` variant and the
  now-dead `WYCENA_ITEMS` / `OFFER_FORM_HREFS` constants were deleted (eslint caught them).
- ⚠️ **The stretched card link never covered the card — on `/oferta` *or* `/wycena` — and the first
  verification wrongly reported that it did.** `after:absolute after:inset-0` positions against the
  nearest **positioned** ancestor, which was the `absolute inset-x-0 bottom-0` text wrapper, not the
  `relative` card. Only the bottom text strip was clickable; the image was dead. The original probe
  hit the *banner* card's centre, which happens to fall inside that strip, and Playwright's
  „stretched link intercepts pointer events" message was misread as proof. **The user reported it.**
  Fixed by making the wrapper `absolute inset-0 flex flex-col justify-end p-6` — it spans the card,
  so the `::after` does too, and content still sits at the bottom. Re-verified by probing **near the
  top edge and the centre of all 7 offer cards and all 4 quotation cards**: every point resolves to
  that card's own href, 0 nested anchors.
- **Hover action buttons on both grids** — „Dowiedz się więcej" + „Formularz wyceny" on `/oferta`
  (the second only on the 6 offers that have a form; Elewacje kompozytowe shows one), and
  „Wypełnij formularz" on `/wycena`. All are `z-10` siblings of the card link, never nested inside
  it; the duplicate-destination button is `tabIndex={-1}` so the card isn't in the tab order twice.
  Revealed on hover from `md` up, **always visible on touch widths** where there is no hover.
- **„Formularz kontaktowy" is a modal, not a subpage** (the client's „nie podstrona").
  `ContactFormDialog` is **controlled from `Navbar`** — state lifted so the mobile drawer closes
  *before* the modal opens, instead of nesting two Ark dialogs. `lazyMount` + `unmountOnExit` resets
  the form between openings. Enter/exit use **distinctly named** keyframes (the Zag presence-machine
  lesson from the mobile-drawer feature: matching names unmount instantly). `FormSuccessState` is
  reused with `steps={[]}`, which skips the process recap and keeps the confirmation modal-sized —
  the `kontakt` variant baked into it back in July finally has a caller.
  ⚠️ **Contact submissions are not GA-countable** the way quotation forms are: a modal has no URL,
  so the `/wycena/*/przeslany-formularz` pattern does not apply.
- **„Przed i po" built natively — daisyUI deliberately not installed.** Its `diff` component is pure
  CSS (`diff-item-1/2` + a `resize: horizontal` resizer, confirmed via Context7), but the plugin
  brings its own theme layer alongside this project's Tailwind v4 `@theme` tokens, and the CSS
  `resize` grip is a browser corner handle that behaves poorly on touch. `BeforeAfterSlider` uses
  **`clip-path: inset()`** to reveal the „before" layer — no DOM reads, no image squashing (a first
  attempt sized an inner wrapper from `container.current?.offsetWidth` during render, which would
  not have survived SSR). Pointer events cover mouse/touch/pen in one path; `role="slider"` +
  arrow keys for keyboard. Verified drag 25→75→90% and `ArrowLeft` 90→88.
- ⚠️ **The „Przed i po" section is live but hidden.** Seeded with header copy and **no items**: the
  dataset contains **no genuine „before" photos** — every image is a finished job, so a demo pair
  would have read as nonsense. A placeholder pair was published only long enough to verify the
  slider in-browser, then removed. The section appears the moment the client uploads one real pair.
  The array shape (rather than a single pair) means adding a second project needs no migration; the
  picker hides itself at one item.
- **VAT highlight (8% vs 23%)** — new `vatHighlightSection` singleton + `vatRate` object, rendered
  on the home page and every offer page (between `OfferTechSpecs` and `OfferFormCta`). A large
  accent arrow points **23% → 8%**; the cards are ordered standard-then-advantage **in code**
  regardless of the CMS array order, so reordering in the Studio cannot leave the arrow pointing at
  the expensive option. Falls back to a plain two-column grid if there aren't exactly two rates.
  ⚠️ **The copy is a tax claim** — the `footnote` field exists for the hedge and is seeded with one
  („wymaga spełnienia warunków ustawowych… potwierdzamy indywidualnie"), but the client's
  accountant should sign off on the final wording.
  ⚠️ **Tailwind v4 sets `rotate-*` via the standalone `rotate` property**, so
  `getComputedStyle(el).transform` reads `none` — check `.rotate` instead.
- **Prominent service-area notice** — new `serviceAreaLabel` / `serviceAreaDescription` on
  `bottomCtaSection` + a `ServiceAreaNotice` callout inside the shared `ContactShowroom`, which puts
  it on the home page **and** all 8 offer pages from one change. The old small-print lines in the
  four forms were left as they are.
- **Map popup address is CMS-driven** — new `mapAddress` field seeded with the footer's full
  „Kępska 12, 45-130 Opole, pok.20 (parter)", passed into `ShowroomMap` as a prop. Kept **separate**
  from `showroomAddress`, which labels the outdoor exposition — the office room number is not the
  same place. Coordinates stay hardcoded.
- **„Kontakt" → `/#kontakt`** in navbar and footer, with `id="kontakt"` + `scroll-mt-20` on
  `ContactShowroom`. This fixed a **live 404** — `/kontakt` has never existed. `isActivePath` now
  returns false for anchors. ⚠️ **`/o-nas` is still a 404** in both navbar and footer (an untracked
  `about-us-spec.md` exists); out of scope this round.
- **Oferta → „Tarasy" expanded by default** via a `defaultExpanded` flag on the nav item, read by
  both `DropdownGroup` (desktop) and `MobileNavGroup` (drawer).
- **„5 dni roboczych" everywhere** (user instruction). Six occurrences still said 7: the fine print
  under all four form submit buttons, `FormSuccessState`'s closing note, and the customer
  confirmation email — the last two **contradicting copy a few lines above them**. The CMS was
  audited too and was already correct; the remaining „1–5 dni roboczych" is install *duration* and
  was deliberately left.
- ⚠️ **Three buttons read „Darmowa wycena".** The header CTA and the home CTA block now both point
  at `/wycena` (the block was changed to match, since the labels are identical), but the **hero**
  button still points at `/wycena/zadaszenie` — that was explicit client feedback (#3a), so it was
  left alone. One CMS field if they want it aligned.
- **Seeded + published** `wycenaPage`, `vatHighlightSection`, `beforeAfterSection`, the new
  `bottomCtaSection` fields and `navbar.ctaButton.href`. Both edited drafts were **diffed against
  published first** — they differed only by our changes, so nothing of the client's was clobbered
  (the Part 2 lesson).
- **Studio redeployed** (`npm run deploy` from `studio/`) — in place via the pinned `appId`, same
  URL, `Deployed 1/1 schemas`. **Verified against the deployed schema via MCP**, not assumed:
  `wycenaPage` live, and `mapAddress` / `serviceAreaLabel` / `serviceAreaDescription` present on
  `bottomCtaSection`. ⚠️ The Studio **UI** is unverified as always (Playwright isn't logged in).
- ⚠️ **Playwright measurement gotchas, all of which produced false readings this session:**
  (1) **mouse position is not retained across MCP tool calls**, so a hover in one call reads as
  `:hover`-less in the next — and `dispatchEvent('mouseover')` does not trigger CSS `:hover` at all;
  verified the reveal through the sibling `group-focus-within` rule (identical specificity) instead.
  (2) `scrollIntoView` in a loop shifts later cards out of view and `elementFromPoint` then returns
  the **fixed header** — several false „none" hit-test results came from that, not from broken
  links. Use an absolute `window.scrollTo(absTop - 200)` per card.
  (3) An `opacity` sample taken immediately after `focus()` catches the transition at ~0.016; sample
  repeatedly before concluding it is stuck.
- **Left untouched (same precedent as prior features):** the pre-existing uncommitted `.mcp.json`
  and `OfferTechSpecs.tsx`, `.claude/settings.local.json`, the untracked `.playwright-mcp/`
  artifacts, and the two remaining untracked specs (`about-us`, `contact-page`). The user's
  `renderConfirmationEmail.ts` edit **was** included this time — the „5 dni" pass genuinely edits it.
- Verified: **147/147 Vitest** (131 existing + 16 new for the contact schema/action —
  `ContactForm`/`BeforeAfterSlider`/`VatHighlight` are presentational, so no component tests),
  `type-check` (both workspaces), `lint` (only the pre-existing `useCountUp` warning at
  `TrustSection.tsx:65`), clean `next build` after `rm -rf .next` — `/wycena` prerenders static, all
  7 offer slugs still SSG. In-browser (Playwright/Chromium): **0 console errors, 0 warnings**;
  `/wycena` bento measured 784² hero / 384² squares / 1184×338 banner at 1440 and a uniform 327×245
  single column at 390 with no horizontal overflow; empty contact submit produced all **6** inline
  errors; Oferta → Tarasy opens expanded; map popup reads the footer address; VAT row measured
  `222px 56px 222px` at 1440 and stacked with the arrow at `rotate: 90deg` at 390.
- **Not driven in-browser:** a real contact-form *send* — it would email the dev inbox through
  Resend. The action's success and failure paths are unit-tested instead.

### Offer Index Page `/oferta` + „Akcesoria do zadaszeń" rename (2026-07-28)

The **`/oferta`** overview — all 7 `service` docs as a bento grid of cards linking to their
subpages — plus a **client-mandated category rename** that grew out of it mid-session. Spec:
`context/features/offer-index-spec.md` (committed with the feature). Branch
`feature/offer-index-page`. Four decisions confirmed up front, one more mid-session.

- **The parent route was 404ing.** `OfferHero`'s breadcrumb („Oferta") and the home Oferta
  section's CMS `ctaHref` (**already** `/oferta`) both pointed at a page that didn't exist. This
  feature makes those live; the user also asked mid-session for an explicit **„Cała oferta"** entry,
  now first in both the Navbar Oferta dropdown and the Footer's Oferta column.
- **Bento — deliberately not the spec's map.** The spec mixes per-cell aspect ratios
  (`16/7` beside `3/4`, `21/6`), which is exactly the row-height mismatch **already reworked out of
  `OfferGallery`**, and it leaves a hole in row 3. Shipped the proven pattern instead: uniform
  `aspect-square` cells + grid spans — 2×2 hero, two squares beside it, a row of three, then a
  full-width `21/6` banner. Tiles 7 cards with **zero empty cells**. `bentoSpan(index, total)`
  generalizes it: the trailing card only goes full-width when it would otherwise sit alone on its
  row (`cellsBefore % 3 === 0`, hero counting as 4 cells).
- ⚠️ **Two competing `md:aspect-*` utilities resolve by stylesheet order, not specificity.** A base
  `md:aspect-square` silently beat the banner's `md:aspect-21/6` → the finale rendered **square
  (1184×1184)**. Caught by measuring in-browser, not by reading the class list. Fix: the `md:` ratio
  lives **only** in `SPAN_CLASSES`, never on the base. Comment records it.
- **Nested anchors avoided.** The spec wraps the quotation-form pill in its own `<Link>` *inside*
  the card `<Link>` with `stopPropagation` — invalid HTML. Card link is now a **stretched
  `after:absolute after:inset-0` overlay** on the title anchor (so the accessible name stays the
  title) with the pill as a `z-10` sibling. Measured **0 nested anchors** on all 7 cards.
- **Header is CMS-driven** via a new **`ofertaPage` fixed-id singleton** (spec had it hardcoded) —
  matches the `realizacjePage`/`tarasyPage` precedent. Structure entry „Strona Oferta",
  Presentation `mainDocuments` route + `locations`; `service`'s resolver now also lists `/oferta`.
- **New `order` number field on `service`** (`initialValue: 99` so new offers land last) seeded 1–7,
  with `allServicesQuery` ordering on `coalesce(order, 99)` and a matching Studio `orderings` entry
  so the sidebar list reads in page order.
- **Metadata title is just „Oferta"** — the layout's `%s | <site>` template appends the brand, so
  the spec's „Oferta — Complex" would double-print it (the `/tarasy` lesson). Note `/realizacje`
  still has this bug. `/oferta` added to `sitemap.ts` (which still lists **only** the root
  otherwise).
- **The category badge was dropped** (spec had it). After the rename below, the badge duplicated the
  card title **verbatim on all 7 cards** — it only ever made sense while category ≠ title.

**The rename — „Żaluzje tarasowe" → „Akcesoria do zadaszeń" (client, imperative).** Surfaced while
seeding: the client had already retitled the service and changed its slug to `akcesoria-do-zadaszen`
in the Studio, leaving **`/oferta/zaluzje-tarasowe` dead in the Navbar and Footer**. User's call was
to carry it through everywhere, so the **category value** moved too (slug === category holds for all
7 again).

- **Code:** `PROJECT_CATEGORIES`, `OFFER_SLUGS`, the `offerSection` initialValue, `categories.ts`,
  Navbar (`OFERTA_ITEMS` + the `OFFER_FORM_HREFS` key), Footer. Permanent redirect added to
  `next.config.ts` (verified **308**), second entry after the `zadaszenia-aluminiowe` one.
- **Content, published:** 7 realizations + the service doc → `akcesoria-do-zadaszen`.
- **Also finished the stalled feedback #6 migration.** Its „0 stragglers" check had missed
  **2 realizations, the service doc itself, and two `offerSlug` values** on the home Oferta cards —
  so that service was filtering its gallery on a category almost nothing had, and one home card
  linked to a 404. All patched to `zadaszenia-tarasowe`; re-verified **0 stragglers**.
- **`FeaturedProjectsSection`'s duplicate label map is gone** — consolidated onto
  `app/lib/categories.ts`. That duplication (flagged as a risk back on 2026-07-13) is precisely what
  let the two copies drift. Its pre-existing uncommitted `data-[selected]:`→`data-selected:` tidy-up
  rode along, same precedent as the Easy Wins branch.
- **The żaluzje *form* is untouched** — `/wycena/zaluzje`, „Formularz Wyceny Żaluzji" and the blinds
  add-on inside the canopy form all still say Żaluzje (they describe the physical product). ⚠️ Worth
  confirming with the client, since the offer those lead to is now called Akcesoria. Two migrated
  realizations are still *titled* „Żaluzje…" — category moved, titles left alone (they describe
  specific installed jobs).
- **Studio redeployed** (`npm run deploy` from `studio/`) — in place via the pinned `appId`, same
  URL, `Deployed 1/1 schemas`. **Verified against the deployed schema via MCP**, not assumed:
  `ofertaPage` live, `service.order` live with its `orderAsc` ordering, and **`zaluzje-tarasowe` is
  gone from both category dropdowns**. That last part was the urgent bit — a stale bundle would have
  let an editor reintroduce the value just migrated away. ⚠️ The Studio **UI** is unverified (the
  Playwright browser isn't logged in to Sanity — same limitation as prior sessions).
- ⚠️ **A stale build cache produced a false verification.** The first `next build` reused cached
  fetch results and prerendered the **old** category values (galleries 6/6 cells). Only after
  `rm -rf .next` did the build show the truth: **0** old-value occurrences, galleries **5** and **7**
  cells matching the migrated docs. Third time this repo has been bitten by `.next` staleness —
  after a content migration, **clear `.next` before trusting build output**. Deleting it also
  killed the running dev server mid-session (dev and build share the directory); it recovered and
  the replacement `next dev` exited on its own („Another next dev server is already running").
- **Verified in-browser** (Playwright/Chromium): **0 console errors, 0 warnings**; grid geometry
  measured at 1440 (hero 784², squares 384², banner 1184×338, all reveals reaching opacity 1) and at
  390 (single column, uniform 327×245, subheadlines on every card, **no horizontal overflow**);
  `/realizacje` tabs show „Akcesoria do zadaszeń"; that offer page's gallery reconnected to its 7
  projects. Added `priority` to the hero card's image after Next flagged it as the LCP element.
- **Left untouched (same precedent as prior features):** the pre-existing uncommitted `.mcp.json`,
  `OfferTechSpecs.tsx`, the user's `renderConfirmationEmail.ts` edit, the two remaining untracked
  specs (`about-us`, `contact-page`), `.claude/settings.local.json` and `.playwright-mcp/`.
- Verified: **131/131 Vitest**, `type-check` (both workspaces), `lint` (only the pre-existing
  `useCountUp` warning at `TrustSection.tsx:65`), clean `next build` — `/oferta` prerenders static,
  all 7 offer slugs still SSG. No new server actions/utilities → no new tests (the bento function is
  presentational and lives in the component, matching `OfferGallery`/`TarasyLanding`).

### Mobile Nav Drawer — full width, larger type, exit animation (2026-07-28)

The mobile navigation drawer now spans the **full viewport width**, uses a larger typeface
throughout, and **slides back out on close** instead of vanishing instantly. Defined inline via
`/feature load` (no spec file). Branch `feature/mobile-nav-drawer`. **Two files changed:**
`frontend/app/components/layout/Navbar.tsx` and `frontend/app/globals.css`. No schema, no GROQ, no
TypeGen regen, no new server actions/utilities → no new tests.

- **Full width.** `Dialog.Content`: `ml-auto … w-80 max-w-[85vw]` → `w-full`. Measured live at a
  390 px viewport: panel width **390**, `left: 0`.
- **Typography.** Top-level links + both `Accordion.ItemTrigger`s 16 → **18 px** (`py-2.5`→`py-3`);
  every sub-link — including the nested „Tarasy" group inside `MobileNavGroup` — and the drawer CTA
  14 → **16 px** (`py-2`→`py-2.5`, CTA `py-3`→`py-3.5`). Desktop nav verified **unchanged at 14 px**
  with the hamburger still hidden at `lg`. `MobileNavGroup` is drawer-only, so its restyle can't
  leak to the desktop dropdowns — the near-identical `DropdownGroup` (desktop) was left alone.
- **Why the drawer never animated out — the whole point of the feature.** Zag's presence machine
  (`node_modules/@zag-js/presence/dist/presence.machine.js`, `syncPresence`) unmounts the node
  **immediately** when the computed `animation-name` on close equals `prevAnimationName` (the one
  recorded while open); only a mismatch sends `UNMOUNT.SUSPEND` and waits for `animationend`. The old
  code applied `animate-[nav-slide-in-right_0.3s_ease-out]` **unconditionally**, so both states
  reported the same name → instant unmount. Fixed with **distinctly named** exit keyframes
  (`nav-slide-out-right`, `nav-fade-out`) applied via `data-[state=closed]:`, with the enter
  animations moved behind `data-[state=open]:`. ⚠️ **Reversing the enter animation
  (`animation-direction: reverse`) would NOT work** — the name would be unchanged and the machine
  would still unmount instantly. A comment above the keyframe records this.
- **The backdrop needed its own fix.** `Dialog.Backdrop` calls `usePresence` itself (its own machine
  + its own node ref), whereas `Dialog.Content`/`Positioner` share the root's presence context — so
  the backdrop had the identical same-name bug and got its own `nav-fade-out`. Without it the page
  would flash un-dimmed the moment the panel started sliding.
- **Traced the close frame-by-frame** rather than eyeballing it: panel `x: 0 → 12 → 62 → 137 → 232
→ 344` (of 390) while backdrop opacity ran `1.00 → 0.08`, then settled `hidden` / `display:none`
  with **nothing tabbable** (18 links present but `offsetParent === null`) — that mounted-but-hidden
  resting state is Ark's normal behavior, not a leak. Reopening animates back in (`303 → 0`), so
  `prevAnimationName` bookkeeping survives the round trip.
- ⚠️ **Dev-server gotcha worth remembering — a CSS-only edit can silently not apply.** The exit
  animation appeared dead at first: `data-state="closed"` and `animation-name:
nav-slide-out-right` were both correct, but `getAnimations()` was **empty** and `transform: none`
  — Chromium won't create an animation for an unknown keyframe name. The served CSS chunk *did*
  contain the string (Turbopack had rebuilt it for the new **utility class** from `Navbar.tsx`) but
  held only the **three old** `@keyframes` blocks from `globals.css`. **A hard reload did not fix
  it**; touching `globals.css` did. Same stale-cache family as the earlier `.next` incident. Probe
  for this with `getAnimations().length` on a throwaway element, not by grepping the chunk text —
  the class reference and the keyframe block both match a naive `includes`.
- **Self-correction during the session:** initially bumped `Dialog.Title` to `text-xl`, which made
  the long CMS brand string („CComplex - Zadaszenia Tarasowe i Tarasy") wrap into the close button.
  Reverted to `text-lg` + `pr-4` — the goal was bigger *nav links*, not the title.
- **Playwright gotcha:** `document.querySelectorAll('[data-scope="accordion"][data-part="item-trigger"]')[0]`
  matched an accordion **elsewhere on the page**, not the drawer's — scope drawer queries under
  `[data-scope="dialog"][data-part="content"]`. Also, an MCP click round-trip exceeds the 300 ms
  animation, so sampling an entrance requires triggering **and** sampling inside one `evaluate`.
- **Left untouched (same precedent as prior features):** the pre-existing uncommitted `.mcp.json`,
  `OfferTechSpecs.tsx`, `FeaturedProjectsSection.tsx`, the user's `renderConfirmationEmail.ts` edit,
  the three untracked future specs (`about-us`, `contact-page`, `offer-index`),
  `.claude/settings.local.json` and the untracked `.playwright-mcp/` artifacts. The
  `sanity.types.ts` / `sanity.schema.json` line-ending drift **resolved itself** when `type-check`
  re-ran TypeGen. Scratch screenshots were deleted.
- Verified: **131/131 Vitest**, `type-check` (both workspaces), `lint` (only the pre-existing
  `useCountUp` exhaustive-deps warning at `TrustSection.tsx:65`), `next build` — all routes
  prerender as before. **0 console errors and 0 warnings** in-browser; both nesting levels of the
  Oferta menu expand correctly at full width.

### Presentation „Blocked preview URL" — explicit `allowOrigins` (2026-07-28)

The deployed Studio's **Presentation** tool refused the preview iframe with „Blocked preview URL —
The router wants to navigate to `https://complex-puce.vercel.app/`, but the origin
`https://complex-puce.vercel.app` is not allowed." Defined inline via `/feature load` (no spec file).
Branch `fix/presentation-allow-origins`. **One file changed:** `studio/sanity.config.ts`.

- **What the error actually gates.** Presentation trusts exactly **one** origin — that allow list
  guards the Comlink (`postMessage`) channel behind click-to-edit *and* any navigation requested via
  the Studio URL's `?preview=…` param. Traced the string to
  `preview-search-param.configuration.error` in `sanity/lib/_chunks-es/PresentationToolGrantsCheck.js`
  (`useReportInvalidPreviewSearchParam`); with no `allowOrigins` configured the default list is
  `[new URLPattern(initialUrl.origin)]`, derived from **`previewUrl.initial`**.
- **Root cause — two compounding issues in one option.** The config passed
  `previewUrl: { origin: SANITY_STUDIO_PREVIEW_URL, … }` and **no `allowOrigins` at all**.
  (1) `previewUrl.origin` is **deprecated** in `sanity@5.31` (`@deprecated - use 'initial' instead`),
  and the documented default allow list comes from `initial`. (2) The origin was **build-time only**
  — `studio/.env` = `http://localhost:3000`, `studio/.env.production` = the Vercel URL — so the allow
  list flipped with whatever built the bundle and could never cover both.
- **Fix:** `origin` → `initial` (still fed by `SANITY_STUDIO_PREVIEW_URL`, so the env var keeps
  deciding which URL Presentation *opens*), plus a top-level
  `allowOrigins: ['http://localhost:*', 'https://complex-puce.vercel.app']` held in a named
  `PREVIEW_ALLOW_ORIGINS` const. **Deliberately decoupled from the env var** — trusting an origin and
  opening it are different concerns, so every build now trusts both and the list can't silently
  change. `allowOrigins` is a top-level `presentationTool` option (needs `sanity` ≥ 3.85).
- **Ruled out first, so nobody re-runs this:** *not* the accumulated stale-Studio debt from earlier
  in the day — fetched the then-live `complex.sanity.studio/static/sanity.config-BeIsjVeh.js` and it
  **did** contain the Vercel URL (as `previewUrl.origin`); and *not* version skew — `autoUpdates: true`
  resolves within `^5.31.1`, and the module CDN's `x-resolved-version` header confirmed the deployed
  Studio runs **5.31.1**, identical to local. Also noted: `complex.sanity.studio` now **302s** to the
  Dashboard-hosted app (`www.sanity.io/@or787Vn1q/studio/<appId>`), but its `/static/*` assets are
  still fetchable directly — which is what made byte-level verification of the live bundle possible.
- **Verified the matching algorithm, not just the config.** Replayed Sanity's actual check
  (`URLPattern.test(origin)` + its `hostname === '*'` insecurity rejection) against both patterns via
  the `urlpattern-polyfill`: Vercel ✔, `localhost:3000` ✔, `localhost:3333` ✔, unrelated origin ✘ —
  so neither pattern is rejected as insecure and the port wildcard resolves as intended.
- **Redeployed** (`npm run deploy` from `studio/`) — in place as before (appId pinned in
  `sanity.cli.ts` → same URL, no second studio), `Deployed 1/1 schemas`. Confirmed by **re-fetching
  the new live chunk** (`sanity.config-BhUUOhsC.js`, HTTP 200): `xE="https://complex-puce.vercel.app"`,
  `SE=["http://localhost:*","https://complex-puce.vercel.app"]`, wired as
  `previewUrl:{initial:xE}` + `allowOrigins:SE`.
- ⚠️ **Not verified: the Studio UI itself.** The Playwright browser isn't logged in to Sanity (same
  limitation as the earlier redeploy session), so the toast being gone and click-to-edit working were
  **not** observed in a browser — the evidence is the live bundle's contents plus the replayed
  matching algorithm. If it still misbehaves, a **different** message (`Preview URL origin mismatch`,
  which names a *reported* origin) would mean the frontend answers from another origin — a different
  fix. Editors should hard-reload: the old bundle may be cached and the previous toast has
  `duration: Infinity`, so it survives soft navigation.
- **When the site moves to a real domain** (e.g. `ccomplex.pl`), that origin **must** be added to
  `PREVIEW_ALLOW_ORIGINS` or Presentation will refuse to open it — flagged in a code comment above
  the const.
- **No schema change** → no TypeGen regen; **no frontend change**; no new tests (config only, nothing
  unit-testable). `tsc --noEmit` on `studio/` clean, and `sanity build` succeeds with both origins
  baked in.
- **Left untouched (same precedent as prior features):** the pre-existing uncommitted `.mcp.json`,
  `OfferTechSpecs.tsx`, `FeaturedProjectsSection.tsx`, the user's `renderConfirmationEmail.ts` edit,
  the line-ending-only `sanity.types.ts` / `sanity.schema.json` drift, the three untracked future
  specs (`about-us`, `contact-page`, `offer-index`), `.claude/settings.local.json` and the untracked
  `.playwright-mcp/` artifacts.

### GSAP Target Warnings, Logo Aspect Ratio + Hosted Studio Redeploy (2026-07-28)

Two reported issues (plus a third found mid-session), defined inline via `/feature load` (no spec
file). Branch `fix/trust-gsap-and-studio-redeploy`.

- **Issue 1 — `GSAP target [data-trust-badges] not found`, twice on every page load.**
  `TrustSection.tsx` passed GSAP three **selector strings** (`[data-trust-header]` /
  `[data-trust-card]` / `[data-trust-badges]`) in its `useGSAP` callback, but all three blocks are
  **conditionally rendered from CMS data**. The live `trustSection` singleton has **no badges**, so
  the element never existed and GSAP warned once for the `gsap.set` (:84) and once for the timeline
  `.to` (:107). Fixed by resolving each target with `scope.querySelectorAll` and tweening only what
  matched. **Also covers `[data-trust-card]`** — same latent bug, it simply has data today.
  The `useGSAP` hook runs **before** the `if (!data) return null` guard (hooks can't be conditional),
  so the fix had to live inside the callback, not in an early return.
- **Issue 2 — „Schema type for 'processTimeline' not found" in the deployed Studio.** **Not a schema
  bug** — the type was correct locally (defined, registered, structure entry present) and the
  document was published in `production`. The **hosted Studio bundle was stale**:
  `get_project_studios` showed one studio created **2026-06-15**, three weeks before `processTimeline`
  was added (2026-07-07). The old bundle still served the structure entry, so „Sekcja Proces" was
  clickable but had no schema to render a form from — hence the error and the frozen fields.
  - **This was the accumulated „hosted Studio needs a redeploy" debt** flagged in ~10 consecutive
    history entries, and it was blocking the client. **Everything** since 2026-06-15 was missing, not
    just the reported type: `project`, `featuredProjectsSection`, `realizacjePage`, `service` (all
    four field groups: Zalety / Producenci / Specyfikacja / CTA formularza), `footer`,
    `bottomCtaSection`, `tarasFormConfig`, `schodyFormConfig`, `tarasyPage`, the optional Trust
    `value`, and the 7-step timeline cap.
  - **Fixed by `npm run deploy` from `studio/`** → **https://complex.sanity.studio/**. Because
    `deployment.appId` is pinned in `sanity.cli.ts`, it **redeployed in place** — same URL, no second
    studio, no hostname prompt. Also reported `Deployed 1/1 schemas`. Verified via MCP `get_schema`:
    `processTimeline` live with its 7 steps + `ruler` icon, and **all 16 types** present.
- **Issue 3 (found mid-session, user asked for it too) — `next/image` aspect-ratio warning.**
  `Navbar.tsx` declared `width={300} height={60}` and `Footer.tsx` `width={240} height={48}` — both
  **5:1** — while the uploaded logo is **262×134 (~1.96:1)**. Next compares the rendered box against
  the ratio implied by the attributes; with `h-15 w-auto` the height matched but the width didn't,
  which is exactly its „one modified, not the other" condition.
  - Fixed with a new pure util **`app/lib/sanityImageDimensions.ts`** — `getImageDimensions()` reads
    the intrinsic size out of the Sanity asset reference (`image-<hash>-<width>x<height>-<format>`),
    `stegaClean`ed first so Visual Editing metadata can't break the parse. Both components pass real
    dimensions now, falling back to the old hardcoded pair if a ref is ever unparseable.
    **Deliberately not hardcoding the current logo's numbers** — CMS-uploaded images have no fixed
    ratio, so the warning would return with the next upload.
- **Presentation preview URL checked** (it bundles at build time, and `studio/.env` sets it to
  `localhost:3000` — which would have pointed the client's Presentation tool at a dev machine).
  **No action needed:** `studio/.env.production` overrides it with `https://complex-puce.vercel.app`,
  and the built bundle contains that with **zero** `localhost:3000` hits.
- **The `/oferta/taras/formularz-przeslany` 404** pasted alongside the GSAP output was **a hand-typed
  URL**, confirmed: the build route table lists `/wycena/*/przeslany-formularz` (segment reversed,
  and under `/wycena`, not `/oferta`) and `taras` is not a valid offer slug.
- **Verified in a real browser** (Playwright/Chromium, existing dev server on :3000): a fresh load of
  `/` with **0 console errors and 0 warnings**, header + footer logos rendered and the Trust section
  scrolled through. Instrumented the DOM to confirm the diagnosis — **badges: 0**, headers: 3,
  cards: 4 — and that all headers/cards still reach `opacity: 1`, so the reveal was not broken by the
  fix. Both logos now declare `262×134` and render at `117×60` / `94×48`, preserving the true ratio.
- **Not verified:** the hosted Studio UI itself — the Playwright browser isn't logged in to Sanity
  (it redirected to the login screen; no attempt to authenticate). The deployed-schema check via MCP
  is the evidence.
- **Commit-message gotcha:** the Bash tool is Git Bash, so the PowerShell here-string form
  `@'…'@` was passed through literally and prefixed the subject with a stray `@`. Amended using a
  heredoc-written `-F` file instead.
- **Left untouched (same precedent as prior features):** the pre-existing uncommitted `.mcp.json`,
  `OfferTechSpecs.tsx`, `FeaturedProjectsSection.tsx`, the user's `renderConfirmationEmail.ts` edit,
  the line-ending-only `sanity.types.ts` / `sanity.schema.json` drift (**verified content-identical**
  with `git diff --ignore-all-space` — zero diff), the three untracked future specs (`about-us`,
  `contact-page`, `offer-index`), `.claude/settings.local.json` and the untracked `.playwright-mcp/`
  artifacts.
- ⚠️ **Still open:** whether a Studio-redeploy step should be added to the workflow / CLAUDE.md so
  this debt stops accumulating. Any future schema change needs `npm run deploy` from `studio/` before
  the client can see it.
- Verified: **131/131 Vitest** (126 existing + 5 new for the pure dimension parser), `type-check`
  (both workspaces), `lint` (only the pre-existing `useCountUp` exhaustive-deps warning at
  `TrustSection.tsx:65`), `next build` — all routes prerender as before.

### Thank-You Subpages for Quotation Forms (2026-07-28)

Each of the four quotation forms now **navigates to its own URL** on a successful submission
(`/wycena/[type]/przeslany-formularz`) instead of swapping itself out for the inline
`FormSuccessState` panel. Reason: an inline state change isn't countable, so **Google Analytics had
no way to measure how many visitors actually complete a form**. Defined inline via `/feature load`
(no spec file). Decisions confirmed up front: nested per-form routes, `sessionStorage` for the echoed
email, and a guard against direct visits.

- **Route shape — nested per form**, four page files: `/wycena/{taras,zadaszenie,zaluzje,schody}/
przeslany-formularz`. Chosen over one shared page so GA gets a **distinct URL per product form**
  and can tell which form converts, with no query-param setup on the GA side. Segment is the
  URL-safe `przeslany-formularz` (the user's wording, diacritics stripped).
- **`app/lib/formSubmissionSession.ts` (new)** carries `formType → email` across the navigation.
  Deliberately **not** a query param — the address would land in every GA pageview URL (RODO/PII).
  **Two layers, because neither alone is enough:** a module-level `Map` that survives the client-side
  `router.push` (same JS context) and keeps working when storage is blocked (Safari private mode,
  hardened settings — property access *throws*, hence the `try/catch` around it), plus
  `sessionStorage` so a **refresh** of the thank-you page still renders. Keyed per form, so a
  `taras` submission does not unlock the `schody` confirmation.
- **Guarded.** `FormThankYouPanel` reads the record on mount; absent → `router.replace` back to the
  form. Bookmarks, shared links and crawlers therefore can't register as conversions. The pages also
  carry `robots: { index: false, follow: false }` (verified in the served HTML); `sitemap.ts` lists
  only the root, so there was nothing to exclude there.
- **The panel is client-only, by necessity — the one non-obvious call.** Reading storage in a
  `useEffect` trips this repo's **`react-hooks/set-state-in-effect` as an _error_** (not a warning),
  and `useSyncExternalStore` would **race the redirect against hydration**: the hook's internal
  effect re-reads the client snapshot *after* a sibling effect already fired with the server
  snapshot, so a legitimate submitter would get bounced back to the form. Resolved by mounting the
  panel through **`next/dynamic` with `ssr: false`** — no server render, so the guard can read
  storage in a lazy `useState` initializer with no hydration ambiguity. That's the reason for the
  three-file split: `ThankYouPageContent` (server, fetches) → `FormThankYou` (dynamic wrapper) →
  `FormThankYouPanel` (guard + panel).
- **The forms no longer need the process timeline.** With the panel gone from the form, the `steps`
  prop is dead — so all four `/wycena/*` pages **dropped their `processTimelineQuery` fetch**
  (`zaluzje`/`zadaszenie` became synchronous server components again; `taras`/`schody` lost their
  `Promise.all`). The fetch moved to the thank-you page, where the panel actually lives — one fewer
  Sanity round-trip per form page view.
- **`FormSuccessState` itself is unchanged** apart from importing its `FormType` from the new module
  instead of declaring a second copy. The `kontakt` variant stays baked in for the future contact
  page — which will need its own thank-you route when it lands.
- **New `isRedirecting` state** keeps each submit button in its „Wysyłanie…" state while the
  navigation runs, so the form can't be double-submitted in the gap between the action resolving and
  the route changing.
- **Verified in a real browser** (Playwright/Chromium, existing dev server on :3000): a real
  `/wycena/zaluzje` submission → URL became `/wycena/zaluzje/przeslany-formularz`, panel rendered
  with the echoed address and the three CMS steps (02 Wycena wstępna / 03 Pomiar / 04 Wycena
  końcowa); a **direct visit** redirected to the form; a **hard reload** of the thank-you page still
  rendered (the `sessionStorage` layer); and `/wycena/schody/przeslany-formularz` **still redirected**
  after the żaluzje submission (cross-form isolation). **0 console errors** across the session.
- ⚠️ **No GA/GTM tag exists in the repo** (`grep` for `gtag`/`dataLayer`/`GoogleAnalytics` → 0 hits).
  This feature creates the trackable URLs; installing the analytics tag is still an open job.
- **Note on the guard's tradeoff:** the record is *not* cleared after reading, so a refresh works but
  a second pageview is possible within the same session. Tied to a real submission either way.
- **Left untouched (same precedent as prior features):** the pre-existing uncommitted `.mcp.json`,
  `OfferTechSpecs.tsx`, `FeaturedProjectsSection.tsx`, the user's `renderConfirmationEmail.ts` edit,
  the line-ending-only `sanity.types.ts` / `sanity.schema.json` drift, and the three untracked future
  specs (`about-us`, `contact-page`, `offer-index`). No spec file this time (inline feature).
- Verified: **126/126 Vitest** (119 existing + 7 new for the session module — it's a pure utility, so
  it tests cleanly with a stubbed `sessionStorage`), `type-check` (both workspaces), `lint` (only the
  pre-existing TrustSection warning), `next build` — all four new routes prerender **static**, all
  offer slugs still SSG.

### Form Success State — shared confirmation panel (2026-07-27)

Replaced the four quotation forms' minimal inline success message with a shared **`FormSuccessState`**
panel: a `CheckCircle` header, a contextual Polish headline per form type, the customer's submitted
email echoed back, an inline „Co dalej?" recap of the process-timeline steps, and two navigation CTAs.
Spec: `context/features/form-success-state-spec.md` (committed with the feature).

- **Scoped to 4 forms, not the spec's 5.** The spec lists `ContactForm` / `/kontakt`, but **neither
  exists in the repo yet** (confirmed by glob — no `kontakt` route, no contact form). Wired
  `FormSuccessState` into `TarasForm` / `ZadaszenieForm` / `ZaluzjeForm` / `SchodyForm` only. The
  `kontakt` `formType` + its copy are **already baked into the component**, so the contact page (a
  separate untracked spec) is a one-line wire-up when it lands.
- **`FormSuccessState.tsx`** (`components/forms/shared/`, `'use client'` for the GSAP mount): props
  `formType` (`taras`/`zadaszenie`/`zaluzje`/`schody`/`kontakt`), `submittedEmail`, `steps[]`, and
  optional `primaryCtaLabel`/`primaryCtaHref` (default „Wróć na stronę główną" → `/`). Secondary CTA
  („Zobacz nasze realizacje" → `/realizacje`) is fixed. Centered `max-w-2xl` panel; email rendered as
  an accent inline `<span>`; the 7-dni + śląskie/opolskie notes match the recent
  `renderConfirmationEmail.ts` copy. GSAP staggered entrance (header → divider → step rows → CTAs) via
  the repo's `useGSAP` convention (spec said `gsap.context()`/`useEffect`; reconciled to the repo
  pattern, same as every prior section).
- **„First 3 steps" reconciled to steps 2–4.** The spec's „first 3 steps" wording contradicts its own
  narrative + its `steps[1]` reference; the intent (skip the just-completed „Zapytanie", show what's
  next) is unambiguous, so `steps.slice(1, 4)` with the first shown step highlighted. Because it's
  CMS-driven, the live timeline (which the client expanded to 7 steps with „Pomiar" inserted) now
  yields **Wycena wstępna → Pomiar → Wycena końcowa** — a correct „what happens next" window that
  self-updates with the CMS.
- **Icon map extracted, not duplicated.** The spec referenced a shared `src/lib/iconMap.ts`; the repo
  had the Lucide lookup **inline in `ProcessTimeline.tsx`**. Pulled it into
  **`app/lib/processStepIcons.ts`** (`PROCESS_STEP_ICON_MAP`) and pointed both `ProcessTimeline` and
  `FormSuccessState` at it — one source, no duplication.
- **No new Sanity schema/query.** Reused the existing standalone **`processTimeline` singleton**
  (`processTimelineQuery`), *not* `siteSettings.processTimeline` as the spec's phrasing assumed (this
  repo split section configs into fixed-id singletons long ago). Each `/wycena/*` page now fetches
  `processTimelineQuery` — `taras`/`schody` already `await`, so added it to their `Promise.all`;
  `zadaszenie`/`zaluzje` were sync, made them `async` — and threads `steps={processTimeline?.steps ??
  []}` to the form. Each form captures `submittedEmail` from `data.email` **before** flipping to the
  success state.
- **Removed the now-unused `CheckCircle` import** from all four forms (it moved into the shared
  component); `Link` stayed (still used for the RODO/Polityka-prywatności consent links).
- **No tests added** — the change is presentational + prop-threading, with no new server action or
  utility (matches the coding-standards test scope). No typegen needed (no schema/query change).
- **Verified with a real in-browser submission** (Playwright/Chromium, existing dev server on :3000):
  filled `/wycena/zaluzje` (Ark `NumberInput`s via `pressSequentially`, contact fields, RODO), submit
  → Resend accepted → the success panel rendered „Zapytanie o żaluzje wysłane!", the email inline, the
  three CMS steps (02 Wycena wstępna highlighted / 03 Pomiar / 04 Wycena końcowa), the 7-dni note, and
  both CTAs — **0 console errors**. The other three forms share the identical wiring (not each
  clicked through).
- **Left untouched (same precedent as prior features):** the pre-existing uncommitted `.mcp.json`,
  `OfferTechSpecs.tsx`, `FeaturedProjectsSection.tsx`, the user's `renderConfirmationEmail.ts` edit,
  the line-ending-only `sanity.types.ts` / `sanity.schema.json` drift, and the three untracked future
  specs (`about-us`, `contact-page`, `offer-index`) — all excluded from the commit. The
  `form-success-state-spec` **was** committed with the feature.
- Verified: **`type-check`** (both workspaces), **`lint`** (only the pre-existing TrustSection
  warning), **`next build`** — all four `/wycena/*` routes still prerender static.

### Terrace Landing Page `/tarasy` + nested Oferta nav (2026-07-27)

A dedicated **`/tarasy`** landing page — the target of the company's existing Google Ads — presenting
the three terrace categories as a bento grid, each card linking to its `/oferta/tarasy-*` subpage.
Defined inline via `/feature start` (no separate spec file). Decisions confirmed up front with the
user: URL exactly **`/tarasy`** (top-level, matches the ad destination); the **3 terrace offers**;
**CMS-editable header + auto-derived cards**.

- **`tarasyPage` singleton** (new, fixed id) holds only the header copy (`eyebrow`/`headline`/
  `subheadline`) — mirrors the `realizacjePage` precedent. Registered in `schemaTypes/index.ts`, added
  a „Strona Tarasy" structure entry, and wired Presentation (a `/tarasy` `mainDocuments` route + a
  `locations` resolver). **Seeded + published** the singleton; hosted Studio needs a **redeploy** to
  expose the new entry.
- **Cards auto-derive from the 3 terrace `service` docs** (`terraceServicesQuery`, filtered by the
  three `tarasy-*` slugs, ordered in code) — no card content duplicated into a new schema. Header via
  `tarasyPageQuery`.
- **`app/tarasy/page.tsx`** (SSR, static) fetches both in parallel and renders **`TarasyLanding.tsx`**
  (`'use client'`): a hero (eyebrow/headline/intro) + a bento grid — first card a 2×2 hero on `md`+,
  the other two stacked (the OfferGallery square-alignment pattern), each a `<Link>` to `/oferta/
[slug]` with an `?.asset`-guarded `urlForImage`, title, subheadline, hover CTA. Reused the shared
  `categories.ts` conceptually; titles come straight from the service docs.
- **Metadata:** page title deliberately omits the brand — the root layout's `title.template`
  (`%s | <site title>`) appends it, so including „| CComplex" here double-printed the brand.
- **Navbar — „Tarasy" is a collapsible group in the Oferta menu.** New optional `children` on the
  `NavItem` type; the „Tarasy" entry links to `/tarasy` and its **chevron toggles** the three terrace
  subpages inline (new `DropdownGroup` desktop + `MobileNavGroup` drawer components; the label is a
  `<Link>`, the chevron a sibling `<button>` — no nested interactive elements). Collapsed by default.
- **Dropdown contrast fix (same change set):** the shared `.glass` utility is only 60% opaque, so the
  Oferta/Formularze dropdowns bled scrolled content through. Swapped the panel for `bg-bg-mid/95` +
  `border-graphite` + shadow (blur kept) — readable over the hero now. Both dropdowns benefit.
- **Verified in a real browser (Playwright/Chromium):** `/tarasy` renders the CMS headline + 3 cards
  in order with correct `/oferta/*` hrefs and images (0 console errors); the Oferta „Tarasy" group is
  collapsed by default and its chevron reveals exactly the 3 subpages; dropdown panel now 95% opaque.
  **Playwright gotcha:** the custom `NavDropdown` toggles on click, so `el.click()` across separate
  `evaluate` calls double-toggles — drive it off `aria-expanded` and read `btn.nextElementSibling`.
- **Left untouched (same precedent as prior features):** the pre-existing uncommitted `.mcp.json`,
  `OfferTechSpecs.tsx`, `FeaturedProjectsSection.tsx`, and the user's `renderConfirmationEmail.ts`
  copy edit (24h → 7 dni), plus the four untracked future specs (`about-us`, `contact-page`,
  `form-success-state`, `offer-index`). `offer-index-spec.md` specs a broader `/oferta` index of all
  7 services — used only as a pattern reference here.
- ⚠️ **Confirm the ad's exact destination is `/tarasy`** (no trailing slash / query) before relying
  on it. Sitemap left as-is (it currently lists only the root), so `/tarasy` isn't in it yet.
- Verified: **119/119 Vitest**, `type-check` (both workspaces), `next build` — `/tarasy` prerenders
  static, all offer slugs still SSG.

### Wysyłka wycen mailem — Resend (2026-07-13)

Replaced the four quotation forms' `console.log` placeholder with real transactional email. Spec:
`context/features/quote-email-spec.md` (written this session from an inline request, not a
pre-existing spec file). Each submission now sends **two** emails: an HTML **lead** to the company
(`QUOTE_TO_EMAIL`) and a short **confirmation** back to the customer. First use of **Resend** in the
repo (`resend@^6`).

- **Stayed on the existing server actions — no `/api/quote` route** (the project overview lists one;
  confirmed with the user that a route only earns its keep for webhooks / non-web clients).
- **`app/lib/email/` — one shared layer, four thin callers.** `renderQuoteEmail.ts` is **pure** and
  owns *every* formatting rule, so the four forms cannot drift: `Section[] → HTML`, where
  `formatRowValue` **drops empty rows entirely** (`undefined`/`null`/`''`/`[]` — so shape 1 shows only
  sides A and B, no `C: undefined`), maps booleans to **„Tak"/„Nie"**, joins arrays („A, B"), and
  **escapes** user text (`notes`, `name`) while preserving its line breaks. A section whose every row
  was dropped is skipped, header and all. All styles are **inline** — mail clients drop `<style>`
  blocks. Plus `renderConfirmationEmail.ts`, `attachments.ts`, and `sendQuoteEmails.ts` (the only
  module that touches the network).
- Each action now just describes its own submission as `Section[]`. Zadaszenie sends its add-ons as
  **Polish labels** (not 7 booleans); Schody keys its dimensions off `SCHODY_DIMENSIONS` (H and h stay
  distinct).
- **`replyTo` = the customer's address** on the lead email — the company hits Reply and lands in the
  lead's inbox. The single detail that makes the email usable day-to-day.
- **Diagrams are re-fetched from Sanity server-side** (`tarasFormConfig` shape / `schodyFormConfig`
  drawing) via `client.fetch` + `urlForImage` — a client-supplied image URL is not something to
  forward into an email. Embedded as `<img src>` (Sanity's CDN is public) **and** passed to Resend as
  a remote attachment (`{ path }`) so it survives a mail client that blocks remote images. Zadaszenie
  and Żaluzje have no diagram.
- **Photos** attach as Buffers. Resend caps attachments at **40 MB after base64** (~30 MB raw) and the
  dropzone allows 3 × 10 MB — right at the line. `attachments.ts` caps the total at **20 MB raw** and,
  when exceeded, **drops the photos and notes it in the email body** rather than failing the send: the
  lead is worth more than the pictures.
- **A failed send is no longer silent.** The Resend SDK returns `{data, error}` (never throws); the
  actions return `{success: false, error}` and the four forms render an inline red notice by the
  submit button. They previously ignored a non-success result entirely.
- **TS gotcha:** the actions' two failure shapes (`{errors}` from Zod vs `{error}` from a failed send)
  get normalized by TS into optional props, so `'error' in result` does **not** narrow — the forms use
  a truthiness check and the tests use `result.errors?.fieldErrors`.
- **Env (server-only):** `RESEND_API_KEY`, `QUOTE_FROM_EMAIL`, `QUOTE_TO_EMAIL`, read **lazily** so a
  missing key doesn't break `next build`. Added to `.env.example`. ⚠️ **Still on the
  `onboarding@resend.dev` test sender**, which only delivers to the Resend account owner's address —
  so the customer confirmation currently reaches the dev inbox, not a real customer. **Client action
  required:** verify `ccomplex.pl` under Resend → Domains, then switch `QUOTE_FROM_EMAIL` (and
  `QUOTE_TO_EMAIL` → `biuro@ccomplex.pl`). No code change needed.
- **Verified with a real submission in Chromium** against the dev server: `/wycena/taras`, shape 1,
  4 m × 2.5 m, a photo, notes containing `<b>` tags, both consents → success panel, and Resend
  accepted both emails (no `[email]` errors in the server log). **Playwright gotchas:** `networkidle`
  never settles (`<SanityLive>` holds an SSE connection — wait on a selector instead), and the Ark UI
  Checkbox/NumberInput are Controller-managed, so `.check()`/`.fill()` on the underlying input never
  reaches RHF — must click the visible control and `pressSequentially` the numbers.
- The failure path (Resend down) is **unit-tested only** — not forced in a browser.
- **Left untouched (same precedent as the four form features):** the pre-existing uncommitted
  `OfferTechSpecs.tsx` + `FeaturedProjectsSection.tsx` edits, the user's `.mcp.json` Playwright entry,
  the line-ending-only `sanity.types.ts` / `sanity.schema.json` drift, and the four untracked future
  specs (`about-us`, `contact-page`, `form-success-state`, `offer-index`). The `quote-email-spec`
  **was** committed with the feature.
- Verified: **116/116 Vitest** (91 existing + 25 new — the render/attachment modules are pure, so they
  test cleanly), `type-check` (both workspaces), `eslint` (only the pre-existing TrustSection
  warning), `next build` — all four `/wycena/*` routes still prerender static.

### Formularz Wyceny Schodów — `/wycena/schody` (2026-07-13)

**Fourth and final** quotation form — modular stairs. Reuses the **react-hook-form + Zod + Ark UI**
foundation from `/wycena/taras` (2026-07-08) wholesale; **zero new shared primitives** — all inputs
come from `forms/shared/`. Spec: `context/features/stairs-quotation-spec.md`. Reconciled the spec's
`src/...` paths → repo's `frontend/app/...` + `studio/src/...`, same as every prior feature.

- **Named after the route, not the spec.** Spec said `SchodForm`/`SchodForms.tsx` (inconsistent with
  itself); shipped `SchodyForm` / `schodyForm.ts` / `submitSchodyForm.ts` to match
  `TarasForm`/`ZadaszenieForm`/`ZaluzjeForm`, which are all named after their `/wycena/[type]` route.
- **Diagram lives in a new `schodyFormConfig` singleton — deviation from the spec (confirmed at
  start).** Spec said add a `schodDiagram` object to `siteSettings`; instead created a fixed-id
  singleton („Formularz Schodów", `ComponentIcon`) holding `diagram` (image + required `alt`),
  matching the **`tarasFormConfig` precedent** — `siteSettings` has been metadata/SEO-only since the
  2026-06-16 split. Registered in `schemaTypes/index.ts`, added the structure entry, plus a
  Presentation `locations` resolver **and** a `/wycena/schody` `mainDocuments` route.
- **Validation (`app/lib/validations/schodyForm.ts`):** Zod v4. `isInsulated` is a `z.enum(['tak',
'nie'])`; the seven dimensions are exported as **`SCHODY_DIMENSIONS`** — a single source of truth
  carrying each field's `name`, its form `label` and its `logLabel`, so the form renders its inputs
  and the action builds its log from the same array (a label change is one edit, not three).
  **`dimH` and `dimh` are two distinct measurements** (height incl. ceiling vs. height to ceiling) —
  the case difference is meaningful and preserved end-to-end. Dimensions reuse Taras's `preprocess`
  mapping `''` → `undefined` so the „required" message wins over a coercion error. **No max caps** —
  unlike Żaluzje, the spec sets none and inventing them wasn't warranted. **Dropped `.default(false)`**
  on the consent booleans (spec had it), same call as the prior three forms.
- **Action (`app/lib/actions/submitSchodyForm.ts`, `'use server'`):** same shape as the other three —
  a `formDataToObject` rebuilding a typed object from the multipart FormData (`=== 'true'` for
  booleans, raw strings for the coerced numbers), `safeParse`, then a structured `console.log` keyed
  by the diagram labels (Resend is a later spec). Deviates from the spec's bare `Object.fromEntries`,
  which would leave the checkboxes as the string `'true'`.
- **Dimensions use `FormNumberInput`, not the spec's `FormInput type="number"`** — same reasoning as
  Zadaszenie/Żaluzje (themed chevron steppers instead of the browser's spinner arrows). Its `error`
  prop needs a `FieldError` cast (the `preprocess` makes the RHF **input** type `unknown`).
- **First real use of `FormRadioGroup`** — it was written during the Taras feature for „future forms"
  and had sat unused until now (the insulation tak/nie pills).
- **`SchodyForm.tsx`:** `useForm<Input, unknown, Output>` + `zodResolver`, `mode: 'onBlur'`,
  `shouldUnregister: true`. Two-column `max-w-6xl` grid (single column on mobile): **left** = the
  diagram (guarded — omitted entirely until the client uploads one), the insulation question, and the
  7 dimension inputs rendered by mapping `SCHODY_DIMENSIONS`; **right** = contact + postal code,
  notes, photo dropzone, RODO/marketing consents, submit. **No `installationService` checkbox** (per
  spec — stairs are always installed). Success panel, submit copy and consent block identical to the
  other three forms.
- **Page (`app/wycena/schody/page.tsx`):** server component, static metadata, `sanityFetch(
schodyFormConfigQuery)`, same hero as the other form pages (`pt-28` to clear the fixed navbar).
- **Seeded + published** the empty `schodyFormConfig` singleton so the Studio entry resolves. **No
  diagram image** — the stair drawing the spec references isn't in `context/screenshots/`, so the
  client uploads it in the Studio. Hosted Studio needs a **redeploy** to expose the new „Formularz
  Schodów" entry.
- **Route was already wired:** `/wycena/schody` existed in the Navbar mega-menu, the Footer, and the
  `schody-modulowe` offer page's `OFFER_FORM_HREFS` CTA — those links were dead until this branch.
- **Verified in a real browser this time** (Playwright/Chromium against the dev server — the prior
  two forms shipped with this as an open caveat). Empty submit → **13 inline errors** (insulation, all
  7 dimensions, name, phone, email, postal, RODO); `441-00` → „Format: 00-000"; `0` in a dimension →
  the `positive()` message, not a coercion error; chevron steppers increment; a fully-filled submit
  reaches the success panel with no console errors. **Bug found + fixed during verification:** the
  `border-t` divider above „Dane do wyceny" was unconditional, so with no diagram uploaded it rendered
  as a **dangling line at the top of the left column** — now applied only when a diagram exists.
- **Noted, not changed:** `FormNumberInput` allows 2 decimal places even at `step={1}`, so `320.5` cm
  passes — same across all four forms, and the spec sets no integer constraint.
- **Left untouched (same precedent as the prior forms):** the pre-existing uncommitted
  `OfferTechSpecs.tsx` + `FeaturedProjectsSection.tsx` edits and the four untracked future specs
  (`about-us`, `contact-page`, `form-success-state`, `offer-index`) — excluded from the commit. The
  `stairs-quotation-spec` **was** committed with the feature. `studio/sanity.types.ts` had gone stale
  (never picked up this schema) → regenerated both workspaces.
- Verified: **91/91 Vitest** (72 existing + 19 new), `type-check` (both workspaces), `eslint` (only
  the pre-existing TrustSection warning), `next build` — `/wycena/schody` prerenders static, all 7
  offer slugs still SSG.

### Formularz Wyceny Żaluzji — `/wycena/zaluzje` (2026-07-13)

Third of the four quotation forms — the terrace blinds form and the **simplest**: no shape
selector, no dropdowns, no CMS content. Reuses the **react-hook-form + Zod + Ark UI** foundation
from `/wycena/taras` (2026-07-08) and `/wycena/zadaszenie` (2026-07-13) wholesale. Spec:
`context/features/blinds-quotation-spec.md`. Reconciled the spec's `src/...` paths → repo's
`frontend/app/...`, same as every prior feature. **No Sanity work** — every field is a fixed value,
so nothing to seed, no Studio redeploy, no type regen. **Zero new shared primitives** — all five
inputs come from `forms/shared/`.

- **Validation (`app/lib/validations/zaluzjeForm.ts`):** Zod v4 schema — `openingHeight` (≤ 500 cm)
  and `openingWidth` (≤ 1000 cm) in **centimetres** (the other two forms use metres), plus the
  standard contact block, `installationService`, `notes`, `photo` and the two consents. Both
  dimensions reuse Taras's `preprocess` that maps `''` → `undefined` before coercion, so the
  „required" message wins over a coercion error. **Dropped `.default(false)`** on the booleans (the
  spec had it) — same call as the prior two forms, so Zod's _input_ types stay a clean `boolean`.
- **Action (`app/lib/actions/submitZaluzjeForm.ts`, `'use server'`):** same shape as
  `submitZadaszenieForm` — a `formDataToObject` that rebuilds a typed object from the multipart
  FormData (`=== 'true'` for booleans, raw strings for the coerced numbers), `safeParse`, then a
  structured `console.log` (Resend is a later spec). Deviates from the spec's bare
  `Object.fromEntries`, which would have left the checkboxes as the string `'true'`.
- **Dimensions use `FormNumberInput`, not the spec's `FormInput type="number"`** — same reasoning as
  Zadaszenie: that component exists precisely because Taras replaced the browser's default spinner
  arrows with themed chevron steppers. Its `error` prop needs a `FieldError` cast (the `preprocess`
  makes the RHF **input** type `unknown`).
- **`ZaluzjeForm.tsx`:** `useForm<Input, unknown, Output>` + `zodResolver`, `mode: 'onBlur'`,
  `shouldUnregister: true`. Two-column `max-w-6xl` grid (single column on mobile): **left** = the
  section label + helper, the two dimension inputs, and a glass „Jak mierzyć otwór?" info card
  (`Info` icon, purely informational — the spec called for it because the left column is otherwise
  nearly empty); **right** = contact + postal code, install service, notes, photo dropzone,
  RODO/marketing consents, submit. Success panel, submit copy and consent block are identical to the
  other two forms. **User tweak during the session:** `md:mt-10` on the dimension stack so its first
  input lines up with „Imię i nazwisko" in the right column.
- **Page (`app/wycena/zaluzje/page.tsx`):** plain server component, static metadata, the same hero as
  the other two form pages (`pt-28` to clear the fixed navbar). No `sanityFetch`.
- **Route was already wired:** `/wycena/zaluzje` existed in the Navbar mega-menu, the Footer, and the
  `zaluzje-tarasowe` offer page's `OFFER_FORM_HREFS` CTA — those links were dead until this branch.
- **Left untouched (same precedent as the prior forms):** the pre-existing uncommitted
  `OfferTechSpecs.tsx` + `FeaturedProjectsSection.tsx` edits, the line-ending-only `sanity.types.ts` /
  `sanity.schema.json` drift, and the three untracked future specs (`about-us`, `contact-page`,
  `stairs-quotation`) — excluded from the commit. The `blinds-quotation-spec` **was** committed with
  the feature.
- Verified: **72/72 Vitest** (53 existing + 19 new), `type-check` (both workspaces), `eslint` (only
  the pre-existing TrustSection warning), `next build` — `/wycena/zaluzje` prerenders static, all 7
  offer slugs still SSG. Served HTML checked (hero, both dimension labels, info card, every
  right-column field). ⚠️ The form's **interactive** behavior (on-blur validation, dropzone, a real
  submit through the action) was **not** driven in a browser — worth a click-through, same caveat as
  Zadaszenie.

### Formularz Wyceny Zadaszenia — `/wycena/zadaszenie` (2026-07-13)

Second of the four quotation forms — the canopy/roof form — reusing the **react-hook-form + Zod +
Ark UI** foundation `/wycena/taras` established (2026-07-08). Spec:
`context/features/canopy-quotation-spec.md`. Reconciled the spec's `src/...` paths → repo's
`frontend/app/...`, same as every prior feature. **No Sanity work** — unlike Taras (which needed the
`tarasFormConfig` singleton for the shape diagrams), every option here is a fixed list, so it lives
in code; nothing to seed, no Studio redeploy, no type regen.

- **Validation (`app/lib/validations/zadaszenieForm.ts`):** Zod v4 schema plus the three option
  lists exported as the **single source of truth** — `ROOF_TYPES` (7 models), `FRAME_COLORS`
  (antracyt / czarny / biały krem) and `EQUIPMENT_OPTIONS` (the 7 add-ons as `{name, label}`). The
  form renders its checkbox group from `EQUIPMENT_OPTIONS` and the action logs from the same array,
  so a new add-on is a one-line change rather than an edit in three files. `width` (≤ 20 m) and
  `depth` (≤ 10 m) reuse Taras's `preprocess` that maps `''` → `undefined` before coercion, so the
  „required" message wins over a coercion error.
- **Renamed the equipment fields** from the spec's `equip_ledLighting` snake_case to
  `equipLedLighting` — snake_case keys would have been the only ones in the codebase.
- **Action (`app/lib/actions/submitZadaszenieForm.ts`, `'use server'`):** same shape as
  `submitTarasForm` — `formDataToObject` rebuilds a typed object from multipart FormData
  (`=== 'true'` for booleans, raw strings for the coerced numbers), `safeParse`, then a structured
  `console.log` (Resend is a later spec). Logs the **selected add-ons as a list of Polish labels**
  rather than the spec's object of seven booleans — reads far better once it becomes an email.
- **`ZadaszenieForm.tsx`:** `useForm<Input, unknown, Output>` + `zodResolver`, `mode: 'onBlur'`,
  `shouldUnregister: true`. Two-column `max-w-6xl` grid (single column on mobile): **left** = roof
  type, ALUM colour, width, depth, the 7-checkbox equipment group, terrace-blind dimensions
  (separated by a `border-t`); **right** = contact + postal code, install service, notes, photo
  dropzone, RODO/marketing consents, submit. Success panel, submit copy and consent block are
  identical to `TarasForm`. **Zero new shared primitives** — all six come from `forms/shared/`.
- **Width/depth use `FormNumberInput`, not the spec's `FormInput type="number"`** — that component
  exists precisely because Taras replaced the browser's default spinner arrows with themed chevron
  steppers; a raw number input would look off next to every other form field. Its `error` prop needs
  a `FieldError` cast (the `preprocess` makes the RHF **input** type `unknown`) — same cast
  `DimensionInputs` already does.
- **Dropped `.default(false)`** on the booleans (the spec had it) — Taras dropped it deliberately so
  Zod's _input_ types stay a clean `boolean` for `FieldPathByValue`.
- **Page (`app/wycena/zadaszenie/page.tsx`):** plain server component, static metadata, the same hero
  as `/wycena/taras` (`pt-28` to clear the fixed navbar). No `sanityFetch` — simpler than the Taras
  page, which needed the shape config.
- **Copy fix:** the spec's „wraz z zadaszenie**i**em" typo shipped as „wraz z zadaszeniem".
- **Left untouched (same precedent as prior forms):** the pre-existing uncommitted `OfferTechSpecs.tsx`
  edit, the line-ending-only `sanity.types.ts` / `sanity.schema.json` drift, and the two untracked
  future specs (`blinds-quotation-spec`, `stairs-quotation-spec`) — excluded from the commit. The
  `canopy-quotation-spec` **was** committed with the feature.
- Verified: **53/53 Vitest** (29 existing + 24 new), `type-check` (both workspaces), `eslint` (only
  the pre-existing TrustSection warning), `next build` — `/wycena/zadaszenie` prerenders static, all
  7 offer slugs still SSG. Served HTML checked (hero copy, all 7 roof models, equipment checkboxes).
  ⚠️ The form's **interactive** behavior (on-blur validation, dropzone, a real submit through the
  action) was **not** driven in a browser — worth a click-through.

### Client Feedback — Medium Items (2026-07-13)

Second pass over the client's post-launch review (`context/feedback/ZMIANY STRONA.docx`) — the
**medium-difficulty** subset (#6, #7, #8, #10). The easy wins (#1, #3a, #3b, #5, #9) shipped on the
previous branch; #2 (logo redesign — a designer task) and #4 (emphasize „C" in body copy — needs a
scope decision) remain open pending client input.

- **#6 „Zadaszenia aluminiowe" → „Zadaszenia tarasowe" (slug included).** User chose the **thorough**
  option, so the slug moved too: `/oferta/zadaszenia-aluminiowe` → `/oferta/zadaszenia-tarasowe`.
  Code: `PROJECT_CATEGORIES` (`documents/project.ts`), `OFFER_SLUGS` (`objects/offerCard.ts`),
  `offerSection` initialValues, the `service.title` field description, `CATEGORY_LABELS`
  (`app/lib/categories.ts`), `OFERTA_ITEMS` + `OFFER_FORM_HREFS` (Navbar), `OFERTA_LINKS` (Footer).
- **#7 „Tarasy z płyt gresowych" → „Tarasy gresowe".** Display-name only — the slug/category value
  was already `tarasy-gresowe`, so no URL impact.
- **Redirect:** added a `redirects()` block to `next.config.ts` (the repo's first) mapping the old
  offer URL → the new one with `permanent: true`. Verified **308**.
- **Renamed the product name, not the material.** Copy such as „konstrukcja z aluminium" and
  „Płyty gresowe 2 cm" was deliberately left intact — those describe the actual material; only the
  product _name_ changed. Applied to `title`/`seoDescription`/`heroHeadline`/`benefits*`.
- **#8 „Pomiar" step.** Not content-only: `processTimeline.steps[]` was capped at `max(6)`, so the
  7th step needed the cap raised to `max(7)`; added a `ruler` icon to `PROCESS_STEP_ICONS` + the
  frontend `ICON_MAP` (Lucide `Ruler`) and rewrote the initialValue seed. Content: inserted „Pomiar"
  at index 2, renumbered `01…07`. Also **reworded „Wycena końcowa"** — it had absorbed the
  measurement („Po bezpłatnej wizycie pomiarowej…" → „Na podstawie wykonanych pomiarów…"), which
  read as redundant once „Pomiar" became its own step.
- **#10 Office split.** `bottomCtaSection.showroomAddress` was a single overloaded field holding the
  address _and_ the office text jammed together. Added `officeLabel` / `officeDescription` fields,
  rendered them as a separate block (divider + `Building2` icon) below the showroom in
  `ContactShowroom.tsx`, and cleaned `showroomAddress` back to just „Kępska 12, 45-130 Opole".
- **Content migration (published):** 2 `service` docs, 6 `project` docs' `category`, the
  `offerSection` card's `offerSlug`, `processTimeline`, `bottomCtaSection`. Verified **0 stragglers**
  on the old slug/category. None of these had pending client drafts, so only our changes went live.
- **Duplication found (left as-is):** the category-label map exists **twice** — `app/lib/categories.ts`
  _and_ a private copy inside `FeaturedProjectsSection.tsx`. Both were updated, but this duplication
  is exactly what makes a rename error-prone; worth consolidating onto the shared module later.
- **⚠️ Open data inconsistency:** the CMS showroom address says „Kępska 12, **45-130** Opole" while
  `ShowroomMap.tsx` hardcodes „**46-020** Opole" (plus pin coords + directions URL). One is wrong —
  the pin may literally be in the wrong place. Not guessed; needs the client.
- **Hosted Studio still needs a redeploy** for the client to see the new office fields / 7-step cap.
- **Pre-existing edit:** `OfferTechSpecs.tsx` (unrelated `flex-shrink-0`→`shrink-0`) stayed excluded.
- Verified: `type-check` (both workspaces), `eslint` (only the pre-existing TrustSection warning),
  **29/29 Vitest**, `next build`, plus in-browser — new slug 200, old slug 308→new, zero old names
  on the home page, 7 timeline steps in order, „Biuro" block renders.

### Client Feedback — Easy Wins (2026-07-09)

First pass over the client's post-launch review (`context/feedback/ZMIANY STRONA.docx`, a 10-row
Polish table). Comprehended + triaged all 10 into easy / medium / discussion; this branch shipped
only the **easy-win** subset (#1, #3a, #3b, #5, #9). The medium items (#6, #7, #8, #10) go on a
follow-up branch; the discussion items (#2 logo redesign, #4 emphasize „C" in copy) await client
decisions.

- **#1 Logo bigger** — navbar logo enlarged ~+25%: image `h-12`→`h-15` (source req `height(96)`
  →`height(160)` for crispness) and the letter/text fallback bumped (square `h-10`→`h-12`, text
  `text-xl`→`text-2xl`). Stays within the existing `h-16` header bar; footer logo left as-is.
- **#3a Hero CTA swap** — CMS-content fix on the `heroSection` singleton (code already maps
  primary=green/first, secondary=gray/second): primary → „Darmowa wycena" `/wycena/zadaszenie`,
  secondary → „Nasze realizacje" `/realizacje`. Patched + **published** (no pending draft, clean).
- **#3b Trust — drop placeholder numbers** — the four `trustSection` cards showed a meaningless big
  „1/2/3/4" (client typed them only because `value` was `required`). Made `trustStat.value`
  **optional** (schema), hid the number block when empty (`TrustSection.tsx`), and unset the four
  values. `trustSection` had a **pending client draft** (eyebrow „Dlaczego CComplex?" →
  „Zaufanie budowane doświadczeniem"); per the user's call, **published** it — so both the number
  removal and that eyebrow edit went live together.
- **#5 Remove „Kierownik budowy"** — dropped from `Navbar` `NAV_LINKS` + `Footer` `FIRMA_LINKS`.
  No `/kierownik-budowy` route existed, so nothing else to remove.
- **#9 Map pin label** — added a bold „CCOMPLEX ZADASZENIA I TARASY" title line above the address
  in the `ShowroomMap` Leaflet popup (hardcoded, like the existing address).
- **Content vs. code:** #3a and clearing #3b's values are **live now** via Sanity publish
  (independent of the merge); the hosted **Studio still needs a redeploy** so the client sees the
  now-optional Trust `value` field and can self-edit.
- **Dev-server caching gotcha:** after publishing the hero swap, the SSR curl kept showing old CTAs
  — traced to Next's data cache (not a bug; a real browser's `<SanityLive>` invalidates it).
  Confirmed correct after a full `.next` clear + restart; CDN + live API both returned fresh data.
- **Pre-existing edits:** `Footer.tsx` carried a long-standing uncommitted refactor (drops
  fallbacks / early-returns null) — since #5 genuinely edits it, that refactor rode along in this
  commit. `OfferTechSpecs.tsx` (unrelated `flex-shrink-0`→`shrink-0`) stayed **excluded**.
- Verified: `type-check` (both workspaces), `eslint` (only the pre-existing TrustSection warning),
  **29/29 Vitest**, `next build` (all pages prerender) all pass. Hero swap + Kierownik removal +
  logo size eyeballed via served HTML; map popup is client-only Leaflet (trivial string).

### Formularz Wyceny Tarasu — `/wycena/taras` (2026-07-08)

First of the four quotation forms — the terrace form — establishing the shared \*\*react-hook-form

- Zod + Ark UI\*\* foundation the other three (`zadaszenie`/`zaluzje`/`schody`) will reuse. Spec:
  `context/features/tarrace-quotation-spec.md`. Reconciled the spec's `src/...` paths → repo's
  `frontend/app/...` + `studio/src/...`, same as every prior feature.

* **Decisions confirmed at start:** (1) shape diagrams → a **dedicated `tarasFormConfig` fixed-id
  singleton** (deviation from the spec's „add to `siteSettings`"), matching the repo's
  split-singleton precedent; (2) **added Vitest** (repo had no runner) + wrote unit tests for the
  schema and action — the test setup the other 3 forms inherit; (3) installed
  `react-hook-form` + `zod` + `@hookform/resolvers` (first repo use).
* **Studio:** `objects/tarasShape.ts` (inline object — `shapeNumber` 1–4, `label`, `image`+alt,
  `sides[]`) + `objects/tarasFormConfig.ts` (singleton, `ComponentIcon`, „Formularz Tarasu",
  `shapes[]` validated `length(4)` with a 4-shape `initialValue`). Registered both, added the
  „Formularz Tarasu" structure entry, a Presentation `locations` resolver + a `/wycena/taras`
  `mainDocuments` route.
* **Validation (`app/lib/validations/tarasForm.ts`):** Zod v4 schema. Dimension fields use a
  `preprocess` that maps empty strings → `undefined` so optional sides don't false-fail
  `.positive()`. **Sides are CMS-driven:** the form sends the selected shape's `sides` as
  `requiredSides` and `.superRefine` enforces exactly those (falling back to a static
  `REQUIRED_SIDES` map only for direct/API calls) — so rendered inputs and validation can never
  diverge. Dropped `.default(false)` on the two booleans so Zod's _input_ types stay clean
  `boolean` for `FieldPathByValue`.
* **Action (`app/lib/actions/submitTarasForm.ts`, `'use server'`):** `formDataToObject` rebuilds a
  typed object from multipart FormData (`getAll` for arrays, `=== 'true'` for booleans, raw strings
  for coerced numbers), `safeParse`, then console-logs structured data (Resend is a later spec).
  `as const` returns give the client a discriminated union without exporting a type from a server
  file (Next.js restriction).
* **Shared primitives (`components/forms/shared/`):** `FormInput`, `FormSelect`, `FormTextarea`,
  `FormCheckbox` (Ark `Checkbox` + Controller), `FormRadioGroup` (Ark `RadioGroup`, for future
  forms), `FormFileDropzone` (Ark `FileUpload`, 3 files/10 MB), and `FormNumberInput` (Ark
  `NumberInput` with themed chevron steppers — replaces the browser's default spinner arrows). Plus
  `ShapeSelector` (Ark `RadioGroup` image cards) + `DimensionInputs`.
* **`TarasForm.tsx`:** `useForm<Input, unknown, Output>` + `zodResolver`, `mode: 'onBlur'`,
  `shouldUnregister: true`. **Shape 1 pre-selected by default.** `useWatch('shape')` derives
  `activeSides` from CMS `sides`; a `useEffect` mirrors them into the `requiredSides` field so client
  - server validate identically. Building-position checkboxes are a `Controller`-managed array
    (reconciliation — the spec's boolean `FormCheckbox` can't produce an array). Photo dropzone,
    RODO/marketing consents, success panel.
* **Page (`app/wycena/taras/page.tsx`):** server component, `sanityFetch(tarasFormConfigQuery)`,
  simple hero (`pt-28` to clear the fixed navbar), renders `<TarasForm>`. Static + live-updating.
  Returns a `<div>` (layout already provides `<main>`).
* **In-browser fixes (per feedback):** (1) shape image was cropped — the URL requested a fixed
  `240×200` box; switched to width-only `fit('max')` + `fill`/`object-contain` in a fixed box so the
  whole diagram shows; (2) **shape 1 corrected to 2 sides (A, B)** — patched + published the live
  `tarasFormConfig` doc's `shape1.sides` (preserving the uploaded image) and updated the fallback
  map + tests; the CMS-driven `requiredSides` design means shapes 2–4 can't hit this mismatch.
* **Seed + publish (per request):** created + published the `tarasFormConfig` singleton (4 shapes,
  no images) so the selector renders immediately. Hosted Studio needs a **redeploy** to expose the
  „Formularz Tarasu" entry; the client uploads the 4 diagram images there.
* **Queries/types:** added `tarasFormConfigQuery` (`defineQuery`); regenerated frontend types
  (`TarasFormConfigQueryResult`); studio types already carried the new types.
* **Left untouched (same precedent as prior parts):** the pre-existing uncommitted `Footer.tsx` /
  `OfferTechSpecs.tsx` edits — excluded from the commit. The `tarras-quotation-spec` **was**
  committed with the feature.
* Verified: **29 Vitest tests pass**, frontend `type-check` (next typegen + tsc) + studio `tsc`
  clean, `eslint` clean (only the pre-existing TrustSection warning), `next build` passes —
  `/wycena/taras` prerenders static, all 7 offer slugs still SSG. Eyeballed in-browser (image +
  shape-1 fixes applied from user feedback); form submit drives the console-logging action.

### Process Timeline — shared 6-step journey (2026-07-07)

Shared **`ProcessTimeline`** section — Complex's fixed 6-step customer journey (zapytanie →
wycena wstępna → wycena końcowa → umowa → montaż → gwarancja) as a vertical numbered timeline,
rendered on the **home page** (after `FeaturedProjectsSection`, before `BottomCtaSection`) and on
**every offer page** (between `OfferBenefits` and `OfferGallery`). Spec:
`context/features/process-timeline-spec.md`. Content is CMS-managed from **one central source** so
the process reads identically everywhere.

- **Content location — deviated from spec (confirmed at start).** Spec said add a `processTimeline`
  object to `siteSettings`; instead created a **new `processTimeline` fixed-id singleton**
  (own „Sekcja Proces" sidebar entry) — matches the repo's split-singleton precedent
  (Navbar/Hero/Trust/Offer/Bottom-CTA); `siteSettings` is metadata/SEO only here.
- **Studio:** `objects/processStep.ts` — inline `processStep` object (`number`/`icon`/`title`/
  `description`), `icon` a constrained `options.list` dropdown driven by exported
  `PROCESS_STEP_ICONS` (6 values: `mail`/`calculator`/`file-check`/`file-signature`/`hammer`/
  `shield-check`). `objects/processTimeline.ts` — singleton (`OlistIcon`, „Sekcja Proces") with
  `eyebrow`/`headline`/`subheadline` + `steps[]` (`min 1 / max 6`), all Polish `initialValue`s incl.
  the full 6-step seed. Registered both in `schemaTypes/index.ts`, added the „Sekcja Proces" entry
  in `structure/index.ts`, and a Presentation `locations` resolver (home) in `sanity.config.ts`.
- **Frontend:** `app/components/sections/ProcessTimeline.tsx` (`'use client'`) — `bg-bg-mid` +
  `.section-padding`, centered header, `max-w-3xl` timeline. Icon string → Lucide via `ICON_MAP` +
  `stegaClean`. GSAP via the repo's safe `useGSAP` + `gsap.set`/`.to`/`fromTo` convention
  (`scope: container`, `dependencies: [steps]`): header reveal, per-row independent reveal
  (`x:-20→0`), scroll-scrubbed accent progress fill, and per-node activation
  (`border-accent`/`bg-accent/10`/`text-accent`) via `ScrollTrigger.create` `onEnter`/`onLeaveBack`.
- **Vertical line — iterated on feedback.** (1) Original `left-7` sat off-center and the base line
  ran the full container height, overshooting past the last node into its description. Fixed:
  centered on the nodes (`left-5 sm:left-6 -translate-x-1/2`) and **JS-measured** (a `ResizeObserver`
  on the timeline sets the track `top`/`height` to span exactly first-node-center → last-node-center;
  measurement is layout-relative so it's scroll-independent). Progress fill switched from animating
  `height:%` to **`scaleY` of a `h-full` child** (origin-top) so it stays correct after
  measurement/resize. (2) **Scroll jank** („shrinks on scroll") was a `ScrollTrigger.refresh()` call
  inside the `ResizeObserver` — on scroll the browser fires resize (scrollbar/URL-bar/width), the
  observer fired, and `refresh()` yanked every trigger mid-scrub. Removed it (unnecessary — the scrub
  trigger's geometry is the `timeline` container, independent of the decorative line's height).
- **Data threading:** added `processTimelineQuery` (`defineQuery`, whole-doc select); fetched in
  `app/page.tsx` (parallel `Promise.all`, rendered `{processTimeline && …}`) and in
  `app/oferta/[slug]/page.tsx` (parallel with the gallery/bottomCta fetches), threaded through
  `OfferPage` (new `processTimeline` prop, rendered guarded between Benefits and Gallery). New offer
  composition: Hero → Benefits → **ProcessTimeline** → Gallery → Brands → TechSpecs →
  {relatedFormSlug && FormCta} → Contact. Regenerated **both** frontend + studio types
  (`ProcessTimelineQueryResult`, `ProcessStep`; studio types were stale — Part 5 precedent, regen
  caught them up).
- **Seed + publish (per request):** no prior `processTimeline` doc existed → created + published the
  singleton (fixed id `processTimeline`) with the spec's exact Polish eyebrow/headline/subheadline +
  all 6 steps in one transaction (non-destructive, nothing to clobber). Hosted Studio needs a
  **redeploy** to expose the new „Sekcja Proces" sidebar entry.
- **Left untouched (same precedent as Parts 1–7):** the pre-existing uncommitted `Footer.tsx` /
  `OfferTechSpecs.tsx` edits and the untracked future-spec markdown were excluded from the commit;
  the `process-timeline-spec` **was** committed with the feature (matching Parts 3–7).
- Verified: frontend `tsc` + `eslint` (clean on touched files), studio `tsc`, `next build` all pass —
  `/oferta/[slug]` still SSG (all 7 slugs), home still static. No server actions/utils → no Vitest.
  Line alignment + scroll-jank fix eyeballed via user feedback during the session.

### Offer Pages — Part 7: Contact Section (2026-06-30)

Seventh and **final** section on every `/oferta/[slug]` page — a contact/showroom block,
**always rendered** (incl. Elewacje kompozytowe, which has no form). **Spec 7 of 7**
(`context/features/offer-07-contact-spec.md`). **User overrode the spec's design:** instead
of the spec's bespoke 3-column card grid + new `siteSettings.showroom*` root fields, the section
**reuses the home page's contact/showroom block exactly**, fed by **one** CMS source — so the
offer pages and the home page look identical and the client edits contact details in a single
place.

- **Single source of truth:** the existing `bottomCtaSection` singleton's contact/showroom fields
  (`contactEyebrow`/`contactNote`/`contactPhone`/`contactEmail`/`showroomLabel`/
  `showroomDescription`/`showroomAddress`). **No new schema fields, no `footer` changes, no
  seeding** — reuses already-published data.
- **Extraction (not copy-paste):** pulled the home page's „Showroom / Map block" out of
  `BottomCtaSection.tsx` into a new shared `app/components/sections/ContactShowroom.tsx`
  (`'use client'`). It owns its own GSAP reveal (showroom text `y:30→0`, map `x:20→0`, scoped to
  its own ref, `gsap.set`+`.to`/`useGSAP`) and the `dynamic(() => import('@/app/components/
ShowroomMap'), { ssr: false })` Leaflet map. Keeps `bg-bg-mid py-20`, the in-component
  fallbacks (`+48 661 242 507` / `biuro@ccomplex.pl`), the sanitized `tel:` href, the
  phone/email buttons + address. The user suggested literal copy-paste; extraction is strictly
  better for the „single source" goal (no duplicated markup) and still renders identically —
  flagged and chosen.
- **`BottomCtaSection` slimmed:** dropped the showroom JSX, the showroom/map GSAP tweens, the
  `ShowroomMap`/`dynamic`/`MapPin`/`Phone`/`Mail` imports and the contact field destructuring +
  phone/email vars; now renders `<ContactShowroom {...} />` for that block (keeps only the
  CTA-block reveal). Home page visually unchanged.
- **Offer wiring:** `OfferPage.tsx` takes a `contact: BottomCtaQueryResult` prop and renders
  `<ContactShowroom>` as the **always-rendered final child** (after the conditional
  `OfferFormCta`), guarded `{contact && …}`. `app/oferta/[slug]/page.tsx` fetches `bottomCtaQuery`
  in parallel (`Promise.all`) with the gallery query and threads it through. Final composition:
  Hero → Benefits → Gallery → Brands → TechSpecs → {relatedFormSlug && FormCta} → **Contact**.
- **Queries:** none added — `bottomCtaQuery` already existed (home page). No new generated types.
- **Path reconciliation (same as Parts 1–6):** spec's `src/...` + `sanity/schemas/siteSettings.ts`
  → repo's `frontend/app/...`; the spec's `siteSettings.footer.*` contact assumption was replaced
  by the repo's real `bottomCtaSection` source per the user's single-source decision.
- **Left untouched:** the pre-existing uncommitted `Footer.tsx` refactor, the pre-existing
  `OfferTechSpecs.tsx` edit, the line-ending-only `sanity.types.ts` drift, and the
  `process-timeline-spec` markdown — excluded from the commit for their own work (same precedent
  as Parts 1–6). The `offer-07` spec **was** committed with the feature (matching Parts 3–6).
- Verified: frontend `tsc` + `eslint` (clean on all touched files), `next build` all pass —
  `/oferta/[slug]` still SSG, prerenders all 7 slugs; home still static. No server actions/utils
  → no Vitest. Not yet eyeballed in-browser.

### Offer Pages — Part 6: Quotation Form CTA Section (2026-06-30)

Sixth section on every `/oferta/[slug]` page — `OfferFormCta`, directly below `OfferTechSpecs`:
a strong, centered lead-gen banner that points the visitor to the offer's quotation form.
**Spec 6 of 7** (`context/features/offer-06-formcta-spec.md`). **Conditionally rendered** — only
when `service.relatedFormSlug` is set (6 of 7; Elewacje kompozytowe has no form → section skipped).
Reconciled the spec's `src/...` + `sanity/schemas/` paths → repo layout, same as Parts 1–5.

- **Studio:** appended a new **„CTA formularza"** field group to `documents/service.ts` with
  `formCtaHeadline` (string), `formCtaSubheadline` (string), `formCtaButtonLabel` (string) and
  `formCtaBullets` (array of strings — 3 reassurance points). No new href field — the button URL
  derives from the existing `relatedFormSlug` (spec 1).
- **Frontend:** `app/components/offer/OfferFormCta.tsx` (`'use client'`) — `bg-bg-mid` + `py-24`,
  centered `max-w-4xl`. Top/bottom architectural accent bars (`h-px` gradient lines), eyebrow pill
  („Bezpłatna wycena", `BottomCtaSection` pattern), `formCtaHeadline`, `formCtaSubheadline`, one
  large green CTA button (`formCtaButtonLabel` fallback „Wypełnij formularz wyceny" + lucide
  `ArrowRight`) → `/wycena/[relatedFormSlug]` (`stegaClean` on the slug), and a wrap row of bullets
  (green dot + silver text). GSAP scroll reveal via the safe `gsap.set`+`.to` `useGSAP` pattern —
  accent bars animate `scaleX:0→1`, content staggers `y:40→0` at `start: top 80%`,
  `dependencies: [formCtaBullets]`. Guarded: returns `null` when `relatedFormSlug` is falsy. Wired
  as `OfferPage`'s **sixth child**, gated by `{service.relatedFormSlug && …}`.
- **Mid-feature additions (per request):** (1) made the section **more prominent** — added a centered
  accent radial glow (`bg-accent/10 blur-[120px]`) behind the content; (2) added a **form-target
  label** under the button („Prowadzi do: <form name>") via a hardcoded `FORM_LABELS` map
  (slug→Polish form name) so the visitor sees which form the button opens. The label text/wording is
  in code; the form it names follows `relatedFormSlug`.
- **Navbar „Darmowa wycena" CTA → per-offer form (per request):** on an offer page the global navbar
  CTA now links straight to that offer's specific `/wycena/...` form via a hardcoded
  `OFFER_FORM_HREFS` map (slug→form URL, mirroring `relatedFormSlug`); falls back to the CMS
  `ctaHref` on Elewacje + every non-offer page. First explored a smooth-scroll-to-section approach
  (DOM-presence check + `#wycena` anchor) but the user chose the **direct link** instead, so the
  scroll machinery + anchor were removed. The map is hardcoded in the navbar — consistent with its
  existing hardcoded `OFERTA_ITEMS`/`WYCENA_ITEMS`, but won't auto-track a CMS `relatedFormSlug`
  change (flagged for sign-off).
- **Reconciliation:** GSAP uses the repo's safe `gsap.set`+`.to`/`useGSAP` convention rather than the
  spec's literal `gsap.context()`/`gsap.from` (matches Parts 1–5). Eyebrow („Bezpłatna wycena") left
  **hardcoded** per spec (open question raised whether to make it CMS-editable like
  `benefitsEyebrow`/`brandsEyebrow` — left as-is for now).
- **Queries:** extended `serviceBySlugQuery` with `formCtaHeadline`/`formCtaSubheadline`/
  `formCtaButtonLabel`/`formCtaBullets`; regenerated **both** frontend + studio types
  (`ServiceBySlugQueryResult` now carries the 4 fields).
- **Seed + publish (per request):** the 6 form-bearing services had **no pending drafts** (verified
  first), so patching the draft + publishing pushed **only** the form-CTA data live (no clobber).
  Seeded all 4 fields per the spec's per-service content tables on `zadaszenia-aluminiowe`,
  `zaluzje-tarasowe`, `tarasy-kompozytowe`, `tarasy-gresowe`, `tarasy-drewniane`, `schody-modulowe`
  in one transaction, then published all 6. Elewacje untouched (no form). Hosted Studio needs a
  **redeploy** to expose the new „CTA formularza" fields.
- **Left untouched:** the pre-existing uncommitted `Footer.tsx` refactor and the pre-existing
  `OfferTechSpecs.tsx` edit (`flex-shrink-0`→`shrink-0`), plus the future-spec markdowns
  (`offer-07`, `process-timeline-spec`) — excluded from the commit for their own work (same precedent
  as Parts 1–5). The `offer-06` spec **was** committed with the feature (matching Parts 3–5).
- Verified: frontend `tsc` + `eslint` (only the pre-existing TrustSection warning), studio `tsc`,
  `next build` all pass — `/oferta/[slug]` still SSG, prerenders all 7 slugs. No server actions/utils
  → no Vitest. Not yet eyeballed in-browser.

### Contact Section — Showroom refactor (2026-06-30)

Refactored the home-page **showroom** sub-block of `BottomCtaSection` (the second,
`data-showroom-block` block) into a **contact section** with direct **phone** + **email**
buttons, noting in copy that those are the company's **preferred** contact methods.
Inline request (not a spec file) — treated as `/feature start`. Preserved the editor's
existing showroom copy + map; contact added on top, nothing clobbered.

- **Studio:** appended 4 fields to `objects/bottomCtaSection.ts` under the (renamed)
  **„Blok kontaktu / salonu"** group, all with Polish `initialValue`s: `contactEyebrow`
  (default „Kontakt bezpośredni" — replaces the previously hardcoded „Showroom" eyebrow),
  `contactNote` (text — the „telefon i e-mail to nasze preferowane formy kontaktu"
  sentence), `contactPhone` (default `+48 661 242 507`), `contactEmail` (default
  `biuro@ccomplex.pl` — the **double-c** „ccomplex.pl" is the real domain, **not** a typo,
  confirmed by the client). Left `showroomLabel`/`showroomDescription`/`showroomAddress`
  untouched.
- **Frontend:** `app/components/sections/BottomCtaSection.tsx` (`'use client'`) — the
  left column of the showroom block now renders the CMS `contactEyebrow` (fallback
  „Kontakt bezpośredni"), the showroom heading, the `contactNote`, then two prominent
  buttons: a green **phone** button (`<a href="tel:…">`, lucide `Phone`) and a ghost
  **email** button (`<a href="mailto:…">`, lucide `Mail`). `tel:` href is sanitized
  (`replace(/[^\d+]/g, '')`) so spaces don't break dialing; the `+` is kept. In-component
  fallbacks (`+48 661 242 507` / `biuro@ccomplex.pl`) so the block renders before seeding.
  The editor's `showroomDescription`/`showroomAddress` and the Leaflet map sit below,
  unchanged.
- **Queries:** none — `bottomCtaQuery` selects the whole doc (`*[_type ==
"bottomCtaSection"][0]`, no projection), so the new fields flow through after a TypeGen
  regen. Regenerated **both** frontend + studio types (`BottomCtaQueryResult` now carries
  the 4 contact fields; studio's generated file caught up too).
- **Seed + publish (per request):** the published `bottomCtaSection` doc had all 4 contact
  fields `null` (initialValue doesn't backfill) and real editor content in `showroomLabel`/
  `showroomDescription`/`showroomAddress`. No pending draft existed → patched **only** the
  4 contact fields onto the draft and published, leaving the editor's showroom copy intact
  (no clobber). Hosted Studio needs a **redeploy** to expose the new fields in the editor.
- **Left untouched:** the long-standing pre-existing uncommitted `Footer.tsx` refactor, the
  pre-existing `OfferTechSpecs.tsx` edit, and the future-spec markdowns (`offer-06`,
  `offer-07`, `process-timeline-spec`) — excluded from the commit for their own work (same
  precedent as the offer-pages parts). No inline spec file this time, so nothing spec-like
  was committed.
- Verified: frontend `tsc` + `eslint` (only the pre-existing TrustSection warning), studio
  `tsc`, `next build` all pass — home still static. No server actions/utils → no Vitest.

### Offer Pages — Part 5: Technical Specs Section (2026-06-30)

Fifth section on every `/oferta/[slug]` page — `OfferTechSpecs`, directly below `OfferBrands`:
a two-column grid of glass „info cards" with practical install/spec info (montaż, gwarancja,
VAT, wymiary, kontakt), replacing the old „Niezbędnik informacji" block. **Spec 5 of 7**
(`context/features/offer-05-techspecs-spec.md`). Reconciled the spec's `src/...` +
`sanity/schemas/` paths → repo layout, same as Parts 1–4.

- **Studio:** appended a new **„Specyfikacja"** field group to `documents/service.ts` with
  `techSpecsHeadline` (string, initialValue „Informacje techniczne i montaż"),
  `techSpecsDescription` (string, optional) and `techSpecs[]` — a **min 1 / max 8** array of
  inline `techSpec` objects `{icon, title, content (text)}`. `icon` is a constrained
  `options.list` driven by a new exported `TECH_SPEC_ICONS` that **spreads** the existing
  `BENEFIT_ICONS` and adds 4 values (`home`→`Home`, `euro`→`Euro`, `file`→`FileText`,
  `phone`→`Phone`) rather than duplicating the list.
- **Frontend:** `app/components/offer/OfferTechSpecs.tsx` (`'use client'`) — `bg-bg-deep` +
  `.section-padding`, left-aligned header (hardcoded „Specyfikacja" accent eyebrow →
  `techSpecsHeadline` → optional `techSpecsDescription` `max-w-2xl`),
  `grid grid-cols-1 md:grid-cols-2 gap-4 mt-10`. Each card: `.glass rounded-xl p-6 border
border-graphite` + a thin green top accent line (`border-t-2 border-t-accent/30`,
  `hover:border-accent/30`) to differentiate from benefit cards' full-border hover; top row =
  accent icon tile (`w-10 h-10 bg-accent/10`) + title on one line, then `content` body. Icon
  string → Lucide via a static `ICON_MAP` (benefits' 12 + the 4 new icons) with `stegaClean`
  on the key and a `FileText` fallback. GSAP scroll reveal via the safe `gsap.set`+`.to`
  `useGSAP` pattern (header `y:30→0`, cards `y:30→0` stagger 0.1, `start: top 85%`),
  `dependencies: [techSpecs]`. Guarded: returns `null` when `techSpecs` empty. Wired as
  `OfferPage`'s **fifth child** (after `OfferBrands`; comment slot updated to specs 6–7).
- **Queries:** extended `serviceBySlugQuery` with `techSpecsHeadline`/`techSpecsDescription`/
  `techSpecs[]{_key,icon,title,content}`; regenerated **both** frontend + studio types
  (`studio/sanity.types.ts` had also drifted — it never picked up Part 4's brands — so the regen
  caught up both brands and techSpecs; committed it to keep the generated file in sync).
- **Reconciliation:** GSAP uses the repo's safe `gsap.set`+`.to`/`useGSAP` convention rather than
  the spec's literal `gsap.context()`/`gsap.from` (matches Trust/About/Benefits/Gallery/Brands).
- **Seed + publish (per request):** all 7 services get techSpecs (unlike Brands' 3 → section shows
  on every offer page). The 3 „branded" services (`zadaszenia-aluminiowe`, `zaluzje-tarasowe`,
  `tarasy-kompozytowe`) already carried their techSpecs in **clean drafts** from a prior pass —
  verified per-doc that the draft differed from published **only** by techSpecs (no pending client
  edits → no Part 2 clobber). The other 4 (`tarasy-gresowe`, `tarasy-drewniane`,
  `elewacje-kompozytowe`, `schody-modulowe`) had no draft, so patching created a clean
  techSpecs-only draft. Patched the 4 (one doc per call, per the Part 4 timeout lesson), then
  published all 7 — only techSpecs went live. Hosted Studio needs a **redeploy** to expose the new
  „Specyfikacja" fields.
- **Dev-server hiccup (env, not the feature):** after the project folder was moved to
  `d:\projects\complex`, `npm run dev` panicked with a Turbopack „Next.js package not found" /
  stale `/posts/[slug]` error — the `.next` cache had baked-in absolute paths from the old
  location. Fixed by deleting `frontend/.next` (node_modules was fine; `next build` had worked).
- **Left untouched:** the pre-existing uncommitted `Footer.tsx` refactor and the future-spec
  markdowns (`offer-06`, `offer-07`) — excluded from the commit for their own features (same as
  Parts 1–4). The `offer-05` spec **was** committed with the feature (matching Parts 3–4).
- Verified: frontend `tsc` + `eslint` (only the pre-existing TrustSection warning), studio `tsc`,
  `next build` all pass — `/oferta/[slug]` still SSG, prerenders all 7 slugs. No server
  actions/utils → no Vitest. Eyeballed in-browser after the `.next` fix (dev server healthy).

### Offer Pages — Part 4: Brands & Models Section (2026-06-29)

Fourth section on every `/oferta/[slug]` page — `OfferBrands`, directly below `OfferGallery`:
a **de-emphasized, optional** collapsed Ark UI `Accordion` of manufacturer brands/models (the
client confirmed brand names aren't a primary decision factor). **Spec 4 of 7**
(`context/features/offer-04-brands-spec.md`). Reconciled the spec's `src/...` + `sanity/schemas/`
paths → repo layout, same as Parts 1–3.

- **Studio:** appended a new **„Producenci"** field group to `documents/service.ts` with
  `brandsEyebrow` (string, initialValue „Producenci i systemy"), `brandsHeadline` (string,
  initialValue „Dostępne systemy i producenci"), `brandsDescription` (string, default sentence)
  and `brands[]` — an **optional** array (no `min`/`max`) of inline `brand` objects
  `{name (req), shortDescription, fullDescription (text), image (optional, hotspot+alt),
specs[] (array of string)}`. `brandsEyebrow` was added mid-feature per request so the eyebrow
  is CMS-editable (was hardcoded) — mirrors `benefitsEyebrow`.
- **Frontend:** `app/components/offer/OfferBrands.tsx` (`'use client'`) — `bg-bg-mid` +
  `.section-padding`, left-aligned header (`{brandsEyebrow || 'Producenci i systemy'}` accent
  eyebrow → `brandsHeadline` → `brandsDescription`), `max-w-4xl` `Accordion.Root`
  (`collapsible multiple={false}` — one open at a time). Each item: trigger row = `name` +
  `shortDescription` + `ChevronDown` rotating via `group-data-[state=open]:rotate-180`
  (`hover:border-accent/40`, `data-[state=open]:border-accent/60`); expanded `ItemContent` =
  `fullDescription` + optional „Specyfikacja" list (accent-dot `<li>`) + optional `next/image`
  (400×280, `object-cover rounded-lg`) in a `md:grid-cols-2` layout **only when an image exists**,
  else full-width. GSAP scroll reveal via the safe `gsap.set`+`.to` `useGSAP` pattern (header
  `y:30→0`, items `y:20→0` stagger 0.08, `start: top 85%`), `dependencies: [brands]` — Ark owns
  the expand/collapse. Guarded: returns `null` when `brands` empty. Wired as `OfferPage`'s
  **fourth child** (`OfferBrands` import added; comment slot updated to specs 5–7).
- **Queries:** extended `serviceBySlugQuery` with `brandsEyebrow`/`brandsHeadline`/
  `brandsDescription`/`brands[]{_key,name,shortDescription,fullDescription,image,specs}`; types
  regenerated (`ServiceBySlugQueryResult` now carries `brands[]`).
- **Reconciliation:** GSAP uses the repo's safe `gsap.set`+`.to`/`useGSAP` convention rather than
  the spec's literal `gsap.context()`/`gsap.from` (matches Trust/About/Benefits/Gallery). The
  spec's seed tables give only name/short/specs, so `fullDescription`/`image` were left empty
  (both optional → expanded view shows specs only). Eyebrow made CMS-editable (spec had it
  hardcoded) per mid-feature request.
- **Seed + publish (per request):** the 3 branded services (`zadaszenia-aluminiowe`,
  `zaluzje-tarasowe`, `tarasy-kompozytowe`) had **no pending drafts** (verified first), so patching
  the draft + publishing pushed **only** the brand data live (avoided the Part 2 clobber risk).
  Patched `brandsHeadline`/`brandsDescription`/`brands[]` per the spec tables, then a second pass
  set + published `brandsEyebrow`. The other 4 services have no brands → section hidden, per spec.
  The big 3-doc patch initially **timed out** (large payload) without applying — retried one doc
  at a time, which worked. Hosted Studio needs a **redeploy** to expose the new „Producenci" fields.
- **Left untouched:** the pre-existing uncommitted `Footer.tsx` refactor and the future-spec
  markdowns (`offer-05`–`offer-07`) — excluded from the commit for their own features (same as
  Parts 1–3). The `offer-04` spec itself **was** committed with the feature (matching Part 3, which
  committed `offer-03`).
- Verified: frontend `tsc` + `eslint` (only the pre-existing TrustSection warning), studio `tsc`,
  `next build` all pass — `/oferta/[slug]` still SSG, prerenders all 7 slugs. No server
  actions/utils → no Vitest. Not yet eyeballed in-browser.

### Offer Pages — Part 3: Bento Gallery Section (2026-06-29)

Third section on every `/oferta/[slug]` page — `OfferGallery`, directly below `OfferBenefits`:
a bento grid of project photos filtered by the current service's `category`, opening the shared
`ProjectLightbox`. **Spec 3 of 7** (`context/features/offer-03-gallery-spec.md`). No new Sanity
fields — driven entirely by the existing `project` pool + `service.category` (from spec 1).
Reconciled the spec's `src/...` paths → repo layout, same as Parts 1 & 2.

- **Frontend:** `app/components/offer/OfferGallery.tsx` (`'use client'`) — `bg-bg-deep` +
  `.section-padding`, left-aligned header (hardcoded „Nasze realizacje" eyebrow → „Galeria —
  {categoryLabel}"), `return null` when empty. GSAP scroll reveal via the safe `gsap.set`+`.to`
  `useGSAP` timeline (header `y:30`, cells `y:50` stagger 0.06, `start: top 85%`),
  `dependencies: [projects]`. Each cell = `<button>` → `next/image` `fill`/`object-cover`
  `group-hover:scale-[1.03]`, hover-only gradient overlay + hover-only city label; click opens the
  reused `ProjectLightbox` (no changes to it). Wired as `OfferPage`'s **third child**.
- **Shared category labels:** extracted `CATEGORY_LABELS`/`CATEGORY_ORDER`/`categoryLabel` out of
  `ProjectsGrid` into a new **non-client** module `app/lib/categories.ts`, imported by both the
  client `ProjectsGrid` and the server `OfferPage`. Needed because importing a function from a
  `'use client'` module into a Server Component turns it into a client-reference proxy that throws
  when called server-side — so the label map can't live in `ProjectsGrid`. `OfferPage` derives
  `categoryLabel(stegaClean(service.category))` and passes it down.
- **Queries:** added `galleryProjectsByCategoryQuery` (`project` where `category == $category`,
  ordered `_createdAt desc`); `page.tsx` does a secondary `sanityFetch` passing
  `stegaClean(service.category)`, threads `galleryProjects` through `OfferPage` → `OfferGallery`.
  Types regenerated (`GalleryProjectsByCategoryQueryResult`).
- **Bento layout — reworked after feedback.** Spec's original (items 1 & 6 `aspect-video` span-2,
  rest `aspect-[3/4]`, separate overflow grid) caused row-1 cells to misalign — two cells in one
  row computing different heights from mismatched aspect ratios. **Fix:** every cell is now a
  uniform `aspect-square`; the first cell is a 2×2 hero (`md:col-span-2 md:row-span-2
md:aspect-auto`, size from the grid span, not a ratio). Rows align deterministically at any
  width, and 6 projects fill a perfect 3×3 (hero 4 cells + 5 squares). Collapsed the two grids into
  one (7th+ just continue as squares — robust for any count, not only multiples of 6). Container
  `max-w-6xl`, `gap-3`, `rounded-lg`, header `text-3xl md:text-4xl`.
- **Seed (per request):** created + published **36** new `project` docs via Sanity MCP so every
  category has **6** (5 added to each of the 6 existing categories, 6 new for `tarasy-drewniane`
  which had none; total 42). Each new project **reuses its own category's existing cover image**
  (`tarasy-drewniane` reuses the composite-deck photo) so the bento shows real images; all set
  `isFeatured: false` so the home Featured section still shows only the original 6. Images repeat
  within a category — placeholder demo content until the client uploads distinct photos.
- **Left untouched:** the pre-existing uncommitted `Footer.tsx` refactor and the future-spec
  markdowns (`offer-04`–`offer-07`) — excluded from the commit for their own features (same as
  Parts 1 & 2).
- Verified: frontend `tsc` + `eslint` (only the pre-existing TrustSection warning), `next build`
  all pass — `/oferta/[slug]` still SSG, prerenders all 7 slugs. No schema change → studio
  untouched. No server actions/utils → no Vitest. Not yet eyeballed in-browser.

### Offer Pages — Part 2: Benefits Section (2026-06-25)

Second section on every `/oferta/[slug]` page — `OfferBenefits`, directly below the hero.
Short value-prop description + a responsive grid of icon/text benefit cards, all CMS-managed.
**Spec 2 of 7** (`context/features/offer-02-benefits-spec.md`). Reconciled the spec's `src/...` +
`sanity/schemas/` paths → repo layout, same as Part 1.

- **Studio:** appended `benefitsHeadline` (string), `benefitsDescription` (text) and `benefits[]`
  (`array`, `min(2).max(6)`, inline `benefit` object `{icon, title, description}`) to
  `documents/service.ts`, under a new **„Zalety”** field group. `icon` is a constrained
  `options.list` dropdown driven by a new exported `BENEFIT_ICONS` (12 values:
  `shield/clock/award/users/star/check/tool/map/sun/droplets/ruler/zap`) — same pattern as
  `trustStat`. Added `defineArrayMember` import.
- **Frontend:** `app/components/offer/OfferBenefits.tsx` (`'use client'`) — `bg-bg-mid` +
  `.section-padding`, **left-aligned** header (`max-w-2xl`: hardcoded „Zalety produktu” accent
  eyebrow → `benefitsHeadline` → `benefitsDescription`), responsive **3/2/1** card grid
  (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`). Cards: `bg-bg-surface rounded-xl p-6 border
border-graphite` hover `hover:border-accent/40`, accent icon tile (`w-10 h-10 bg-accent/10`),
  title + description. Icon string → Lucide via static `ICON_MAP` (TrustSection pattern +
  `Sun`/`Droplets`/`Ruler`/`Zap`) with `stegaClean` on the key. GSAP scroll reveal via the safe
  `gsap.set`+`.to` `useGSAP` pattern (header `y:30→0`, cards `y:40→0` `stagger 0.08`, trigger
  `top 80%`), `dependencies: [benefits]`. Guarded: returns `null` when `benefits` empty. Wired as
  `OfferPage`'s **second child** (after `<OfferHero>`), passing the three benefit props.
- **Queries:** extended `serviceBySlugQuery` with `benefitsHeadline`/`benefitsDescription`/
  `benefits[]{_key,icon,title,description}`; regenerated **both** frontend + studio types
  (studio's `sanity.types.ts` was stale at session start — ran `studio` typegen too so the
  committed generated file matches the new schema).
- **Reconciliation:** GSAP uses the repo's safe `gsap.set`+`.to`/`useGSAP` convention rather than
  the spec's literal `gsap.context()`/`gsap.from` (matches Trust/About/Featured-Projects).
- **Seed + publish (per request):** patched `benefitsHeadline`/`benefitsDescription`/`benefits[]`
  per the spec's 7 per-service content tables into all 7 `service` **drafts** via Sanity MCP
  (non-destructive — never edits published directly). The drafts carried **pending client edits**
  (e.g. `zadaszenia` title „Complex - …” → „Zadaszenia aluminiowe”, newly-uploaded hero images),
  so flagged that publishing would also push those live; **user chose to publish all 7**, so
  published them — benefits + the client's pending edits are now live. Hosted Studio still needs a
  **redeploy** to expose the new „Zalety” fields in the editor.
- **Left untouched:** the pre-existing uncommitted `Footer.tsx` refactor and the future-spec
  markdowns (`offer-03`–`offer-07`) — excluded from the commit for their own features (same as
  Part 1).
- Verified: frontend `tsc` + `eslint` (only the pre-existing TrustSection warning), studio `tsc`,
  `next build` all pass — `/oferta/[slug]` still SSG, prerenders all 7 slugs. No server
  actions/utils → no Vitest. Not yet eyeballed in-browser.

### Realizacje page header → CMS + Presentation main document (2026-06-22)

Fixed two issues on **`/realizacje`**: (1) Presentation showed „Missing a main document for
/realizacje” — there was no `mainDocuments` route for it; (2) the eyebrow/headline/subheadline
were hardcoded in `ProjectsGrid.tsx`, so the client couldn't edit them. Solved both with one new
fixed-id singleton that doubles as the route's main document.

- **Studio:** `objects/realizacjePage.ts` — `realizacjePage` singleton (`ImagesIcon`, „Strona
  Realizacje”) with `eyebrow` / `headline` (required) / `subheadline`, Polish `initialValue`s
  mirroring the old hardcoded copy. Distinct from `featuredProjectsSection` (that's the _home_
  section header; this is the standalone listing page). Registered in `schemaTypes/index.ts`,
  added a **„Strona Realizacje”** entry in `structure/index.ts` (above the „Realizacje”
  collection list), and wired Presentation in `sanity.config.ts` — a `/realizacje`
  `mainDocuments` route (filter on the fixed `realizacjePage` id, fixes the warning) **and** a
  `realizacjePage` `locations` resolver → `/realizacje`.
- **Frontend:** added `realizacjePageQuery`; `app/realizacje/page.tsx` now `Promise.all`-fetches
  projects + header via `sanityFetch`, passes `header` into `ProjectsGrid`. `ProjectsGrid.tsx`
  takes a `header: RealizacjePageQueryResult` prop; renders `eyebrow`/`subheadline` conditionally
  and `headline ?? 'Realizacje'` (in-component fallback since `initialValue` doesn't backfill).
  Types regenerated (`RealizacjePageQueryResult`).
- **Seed:** created + published the `realizacjePage` singleton (text only) to `production` via
  Sanity MCP — the fixed `_id` was honored. Hosted Studio needs a **redeploy** to expose the new
  „Strona Realizacje” sidebar entry + editor.
- Verified: frontend `tsc` + `eslint` (only the pre-existing TrustSection warning), studio `tsc`,
  `next build` all pass (`/realizacje` still static). No server actions/utils → no Vitest.

### Offer Pages — Part 1: Boilerplate & Hero (2026-06-22)

Foundation for the **7 offer subpages** at `/oferta/[slug]`, all generated from one shared
`service` document. **Spec 1 of 7** (`context/features/offer-01-hero-spec.md`) — establishes the
schema, dynamic route, `OfferPage` composition root, and the hero; specs 2–7 append their own
fields/sections. First repo page using `generateStaticParams` + per-doc `generateMetadata`
(`/realizacje` was static). Reconciled the spec's `src/...` paths → repo's `frontend/app/...` +
`studio/src/schemaTypes/...`, same as the Realizacje page.

- **Studio:** `documents/service.ts` — `service` doc (`TagIcon`, „Oferta (podstrona)") with the
  foundation/hero fields: `title`, `slug` (from `title`), `seoDescription`, `heroImage`,
  `heroHeadline`, `heroSubheadline`, `relatedFormSlug`, `category`. `category` **reuses** the
  existing `PROJECT_CATEGORIES` (imported from `documents/project.ts`) so spec 3's gallery filter
  joins cleanly; new exported `RELATED_FORM_SLUGS` list (4 form values) drives `relatedFormSlug`.
  Single „Hero" field group (specs 2–7 add more). Registered in `schemaTypes/index.ts`, added an
  **„Oferta"** `documentTypeList` in `structure/index.ts`, and wired Presentation in
  `sanity.config.ts` — both a `service` location resolver **and** an `/oferta/:slug`
  `mainDocuments` route (first `mainDocuments` route added for our own content; enables
  click-to-edit).
- **`relatedFormSlug` = null modeling:** spec lists `null` „Brak formularza" as a value. Modeled
  as the field simply being **empty** (Sanity dropdowns are clearable) rather than a `'none'`
  sentinel — keeps the generated type as `"zadaszenie" | … | undefined` and the frontend treats
  falsy as „no CTA". `elewacje-kompozytowe` is seeded with no `relatedFormSlug` → no hero CTA.
- **Frontend:** `app/oferta/[slug]/page.tsx` — async Server Component; `generateStaticParams`
  (build-time `client.fetch(serviceSlugsQuery)`), `generateMetadata` (`title` + `seoDescription`,
  `stega: false`), fetches `serviceBySlugQuery` via `sanityFetch`, `notFound()` on miss, renders
  `<OfferPage>`. `components/offer/OfferPage.tsx` — **plain server** composition root (not a
  „client wrapper" as the spec said — only the hero needs `'use client'`); renders `<OfferHero>`
  now, with commented slots for the 6 later sections. `components/offer/OfferHero.tsx`
  (`'use client'`) — `min-h-screen`, `heroImage` via `next/image` (`fill`/`object-cover`),
  `bg-black/50` overlay, breadcrumb (Oferta `<Link>` → lucide `ChevronRight` → `title`), headline,
  subheadline, conditional green „Bezpłatna wycena" CTA → `/wycena/[relatedFormSlug]`
  (`stegaClean` on the slug), bouncing `ChevronDown`. GSAP `gsap.from` staggered upward reveal on
  mount (`y:40→0`, `stagger 0.12`, `power3.out`) over `[data-offer-animate]` via `useGSAP`.
- **Queries:** `serviceSlugsQuery` + `serviceBySlugQuery` in `sanity/lib/queries.ts`; types
  regenerated (`ServiceSlugsQueryResult`, `ServiceBySlugQueryResult`; `sanity.schema.json` picked
  up the new `service` type via the typegen schema-extract step).
- **Reconciliations flagged for sign-off:** (1) `sanityFetch` (Live Content API) instead of the
  spec's `revalidate: 60` — repo convention, route is SSG but live-updates via `<SanityLive>`;
  (2) `OfferPage` kept server-side, not a client wrapper.
- **Seed:** created + **published** all 7 `service` docs to `production` via Sanity MCP (hero
  fields only — `title`/`slug`/`category`/`relatedFormSlug`/`heroHeadline`/`heroSubheadline` per
  the spec table; later fields seeded in their specs). **No `heroImage`** yet → hero shows the
  dark overlay over the page background until the client uploads photos. Hosted Studio needs a
  **redeploy** to expose the new „Oferta" sidebar entry + `service` editor.
- **Left untouched:** the pre-existing uncommitted `Footer.tsx` refactor (still in the working
  tree from before the Realizacje feature) — not part of this feature, excluded from the commit
  again. Future-spec markdowns (`offer-02/03/04`) left untracked for their own features.
- Verified: frontend `tsc` + `eslint` clean (only the pre-existing TrustSection warning), studio
  `tsc` clean, `next build` passes — `/oferta/[slug]` is SSG and prerenders all 7 slugs. No server
  actions/utils → no Vitest. Not yet eyeballed in-browser (seeded docs have no hero images).

### Realizacje Page (2026-06-22)

Standalone **`/realizacje`** listing page — all projects (ignores `isFeatured`), static
category-filter tabs, results count, 3-col card grid, shared lightbox. Reuses the same
`project` document pool as the home `FeaturedProjectsSection` (one source of truth). First
route page beyond `/` in the repo. Reconciled the spec's `src/...` paths + `revalidate: 60`
to the repo's `frontend/app/...` layout and `sanityFetch` (Live Content API) convention.

- **Studio:** added optional `surface` (number, m², `positive()` validation, label
  „Powierzchnia (m²)”) to `documents/project.ts`. `sanity.config.ts`: the `project`
  Presentation location now also resolves to `/realizacje` (kept the home entry too).
- **Frontend — shared lightbox:** extracted the Ark UI `Dialog` lightbox out of
  `FeaturedProjectsSection.tsx` into `app/components/ui/ProjectLightbox.tsx` — a controlled
  component (`project` / `onClose`) consumed by **both** the home section and the new grid.
  Preserves the "image + captions fade in together gated on `onLoad`" behavior. The load-gate
  reset uses React's **render-time state-adjustment** pattern keyed on `_id` (not a
  `useEffect`) — the `react-hooks/set-state-in-effect` lint rule rejects `setState` in an
  effect; the original had sidestepped it by resetting in the click handler.
- **Frontend — page + grid:** `app/realizacje/page.tsx` (async Server Component, static
  `metadata`, fetches `allProjectsQuery` via `sanityFetch`). `app/components/sections/
ProjectsGrid.tsx` (`'use client'`): centered header (h1 „Realizacje”), **static** 8-tab
  Ark `Tabs` (`activationMode="manual"`, all categories always shown in fixed order — unlike
  the home section's dynamic tabs), results count „Wyświetlono {n} realizacji", 3-col grid.
  Cards = category badge top-left + city/`surface` „42 m²" bottom row (surface omitted when
  null); no star rating. GSAP header-on-mount + cards-on-filter-change reveals via `useGSAP`.
- **Home link (from `featured.png`):** added a „Zobacz wszystkie realizacje" accent link
  (OfferSection pattern: `ArrowUpRight` nudge) to the `FeaturedProjectsSection` header,
  wrapped in a `flex-col md:flex-row md:justify-between` row → `/realizacje`. Hardcoded
  Polish copy (consistent with the section's other in-component strings; not CMS-driven).
- **Queries:** added `allProjectsQuery` (`*[_type == "project"] | order(_createdAt desc)`,
  includes `surface`) in `sanity/lib/queries.ts`; types regenerated (`AllProjectsQueryResult`;
  studio's stale generated `Footer` type also caught up in the same run).
- **Reconciliations flagged for sign-off:** (1) `sanityFetch` instead of `revalidate: 60`
  (repo convention; route shows static but updates live via `<SanityLive>`); (2) card shows
  **no title** (spec's card lists only badge + city + surface — title lives in the lightbox),
  a deliberate deviation from the screenshot which shows a title.
- **Left untouched:** a pre-existing uncommitted `Footer.tsx` refactor (drops in-component
  fallbacks + early-returns `null`) was in the working tree at session start — **not** part of
  this feature, so it was excluded from the commit and left uncommitted for separate handling.
- Verified: frontend `tsc` + `eslint` clean, studio `tsc` clean, `next build` passes
  (`/realizacje` in the route table). No server actions/utils → no Vitest. Not yet eyeballed
  in-browser (seeded projects still have no cover images → placeholder cards).

### Footer (2026-06-22)

Site-wide **Footer**, CMS-managed, rendered at the bottom of every page via `layout.tsx`.
Replaced a 7-line placeholder stub (`frontend/app/components/Footer.tsx`, which showed
`© {year} Complex`). Built from a new `footer` fixed-id singleton — reconciled the spec's
"embed in `siteSettings`" instruction to the repo's **singleton precedent** (navbar, also
global, is already its own document; `settings` is metadata-only since the 2026-06-16
split). First mix of two icon libraries in the repo.

- **Studio:** `objects/footer.ts` — `footer` singleton (`ThListIcon`) with `logo`
  (`logoImage`/`text`/`iconLetter`/`href` — mirrors `navbar.logo` incl. the optional
  uploadable image), `tagline`, `socialLinks[]` (`platform` constrained `options.list`
  select via exported `FOOTER_SOCIAL_PLATFORMS` + required `href` url), `contactName`/
  `contactAddress`/`contactPhone`/`contactEmail`, `copyrightText` — all Polish
  `initialValue`s, split into Marka/Kontakt/Stopka-dolna field groups. Registered in
  `schemaTypes/index.ts`, **"Stopka"** entry in `structure/index.ts`, Presentation
  `location` → home in `sanity.config.ts`.
- **Frontend:** `app/components/layout/Footer.tsx` — an **async server component** (no
  interactivity, so no `'use client'`; fetches `footerQuery` directly via `sanityFetch`
  rather than the Header/Navbar server+client split). 5-col grid (brand + Oferta 7 /
  Firma 4 / Narzędzia 4 wycena / Kontakt) → `md` 2-col → mobile stacked; brand logo
  mirrors Navbar (image replaces square+text, else green letter-square + wordmark; no
  `priority` since it's below the fold); Kontakt with inline accent `MapPin`/`Phone`/
  `Mail` + `tel:`/`mailto:`; bottom bar copyright + 3 legal links. In-component Polish
  fallbacks (initialValue doesn't backfill). Added `footerQuery`; types regenerated.
- **Deps / gotcha 1 — brand icons:** lucide-react v1 **dropped all brand/logo icons**
  (the spec's `Instagram`/`Facebook`/`Twitter`/etc. no longer exist). Added
  `react-icons` and used `react-icons/fa6` brand glyphs (`FaInstagram`/`FaFacebookF`/
  `FaLinkedinIn`/`FaYoutube`/`FaXTwitter`/`FaTiktok`); kept lucide for the generic
  contact icons. `IconType` is the right map value type (accepts `aria-hidden` string).
- **Gotcha 2 — stega (user-reported "Facebook icon not showing"):** the platform→icon
  lookup `SOCIAL_ICONS[link.platform]` failed because Visual Editing embeds invisible
  stega chars in the string. Fixed with `stegaClean(link.platform)` — same pattern
  Trust/Offer/About already use on icon keys. Data was correct; the bug was mine.
- **Seed:** the `footer` singleton exists in `production` (the client created it when
  adding the Facebook social link). Hosted Studio still needs a **redeploy** to expose
  the new "Stopka" sidebar entry + the `logoImage` upload field.
- Verified: frontend `tsc` + `eslint` (only the pre-existing TrustSection warning),
  studio `tsc`, `next build` all pass. No server actions/utils → no Vitest.

### Bottom CTA Section (2026-06-22)

Home-page bottom lead-gen **CTA + showroom/map** section, built from a new `bottomCtaSection`
fixed-id singleton (Hero/Trust/Offer/About/Featured-Projects precedent — no `homePage` doc).
First use of **Leaflet** in the repo. Two stacked sub-blocks: a full-bleed CTA block over a
showroom block with an interactive map.

- **Studio:** `objects/bottomCtaSection.ts` — singleton (`RocketIcon`) with all spec fields
  (`backgroundImage`, `eyebrow`, `headline`/`headlineAccent`, `subheadline`, primary/secondary
  CTA label+href, `bullets[]`, `showroomLabel`/`showroomDescription`/`showroomAddress`) + Polish
  `initialValue`s, split into "Blok CTA" / "Blok salonu" field groups. Registered in
  `schemaTypes/index.ts`, added a **"Sekcja CTA / Salon"** entry in `structure/index.ts`, and a
  Presentation `location` → home in `sanity.config.ts`.
- **Frontend:** `ShowroomMap.tsx` (`'use client'`) — Leaflet map (`[50.6751, 17.9213]`, zoom 15,
  OSM tiles), custom green `divIcon` pin (white ring + glow for visibility), popup with address +
  "Nawiguj" → Google Maps directions in a new tab. Default-icon CDN paths fixed via
  `L.Icon.Default.mergeOptions`; coords + directions URL hardcoded. `BottomCtaSection.tsx`
  (`'use client'`) — CTA block (`min-h-[50vh]`, darkened `bg-black/70` overlay, eyebrow pill,
  accent-split headline reusing the `stegaClean` pattern, two CTAs, bullet row) + `bg-bg-mid`
  showroom block (two-col text + dynamic-imported `<ShowroomMap>` with `ssr: false`). GSAP scroll
  reveals (CTA stagger, showroom text, map slide-from-right). Query `bottomCtaQuery`; wired into
  `page.tsx`, guarded by `{bottomCta && …}`. Types regenerated.
- **Deps:** added `leaflet@1.9.4` + `react-leaflet@5.0.0` (peer-requires React 19 ✓) +
  `@types/leaflet`.
- **Gotchas:** (1) the "Nawiguj" link wouldn't go white via Tailwind — Leaflet's
  `.leaflet-container a` rule outranks `.text-white` on specificity; fixed with an inline
  `style={{ color: '#fff' }}`. (2) Popup body text is `text-black` (Leaflet popups have a white
  background), a deliberate deviation from the spec's `text-white`.
- **Seed:** created + published the `bottomCtaSection` singleton (text only, no background image)
  to `production` via Sanity MCP so the section renders immediately. Hosted Studio needs a
  **redeploy** to expose the new sidebar entry + field editor.
- Verified: frontend `tsc` + `eslint` (only the pre-existing TrustSection warning), studio `tsc`,
  `next build` all pass. No server actions/utils → no Vitest. In-browser tweaks applied per
  feedback (darker overlay, shorter block, bigger pin, white CTA text).

### Featured Projects Section (2026-06-18)

Home-page **Realizacje** section: a filterable photo grid of completed projects by category,
with an image lightbox. Built from a new `project` collection + a `featuredProjectsSection`
singleton. First **collection** document type in the repo (everything prior was a fixed-id
singleton). Reconciled the prototype spec's paths to the repo: no `homePage` doc — the section
header is its own singleton (Hero/Trust/Offer/About precedent); `project` created fresh per the
spec (it didn't already exist).

- **Studio:** `studio/src/schemaTypes/documents/project.ts` — `project` doc (`title`, `city`,
  `category` 7-value Polish `select` via `options.list` + exported `PROJECT_CATEGORIES`,
  `coverImage` required, `isFeatured` boolean). `objects/featuredProjectsSection.ts` — fixed-id
  singleton (`eyebrow`/`headline`/`subheadline`, Polish `initialValue`s). Registered both in
  `schemaTypes/index.ts` (new "Collections" group). `structure/index.ts`: added **"Sekcja
  Realizacje"** singleton entry + a **"Realizacje"** `documentTypeList`. `sanity.config.ts`:
  added Presentation `locations` for `featuredProjectsSection` + `project` (→ home), and the
  `aboutSection` location that the previous feature had omitted.
- **Frontend:** `FeaturedProjectsSection.tsx` (`'use client'`). Ark UI `Tabs`
  (`activationMode="manual"`, no `Tabs.Content`) → `onValueChange` drives a React filter state;
  "Wszystkie" + pills only for categories present in the featured set (ordered by the
  `CATEGORY_LABELS` map). Cards: `aspect-[4/3]`, `next/image` fill, gradient + dim-at-rest →
  brighten on hover; **title over city** bottom-left (dropped the top-left category badge after
  feedback). Lightbox = Ark UI `Dialog` (focus-trap + Escape + backdrop-click free); image +
  captions share one wrapper gated on the image's `onLoad` so they **fade in together** (no
  caption-then-image pop) — `openProject` pre-sets loaded=true when a project has no cover so it
  reveals instantly. GSAP: header/tab reveal (`gsap.set`+`.to`) + a separate card `fromTo`
  stagger re-run on `[activeTab, projects]`. Queries `featuredProjectsSectionQuery` +
  `featuredProjectsQuery` (`isFeatured == true`, ordered `_createdAt desc`); wired into
  `page.tsx`, guarded by `{featuredSection && …}`. Types regenerated.
- **Seed (text only, per request):** created + published the section singleton + 6 `project`
  docs (one per category, all `isFeatured`) via Sanity MCP to `production`. **No cover
  images** — cards render as dark placeholders and the lightbox shows title/city only until the
  client uploads photos in the Studio (Studio flags `coverImage` as required). Hosted Studio
  needs a **redeploy** to expose the new types + sidebar entries.
- Verified: frontend `tsc` + `eslint`, studio `tsc`, `next build` all pass. No server
  actions/utils → no Vitest. Not yet eyeballed in-browser (data has no images yet).

### About Section layout (2026-06-17)

Two-column home **About (O nas)** section built from the `aboutSection` singleton, matching
the v0 screenshot (the "Learn more about us" CTA intentionally omitted per request).

- Component `frontend/app/components/sections/AboutSection.tsx` (`'use client'`): responsive
  `lg:grid-cols-2`. **Left** = `cardImage` in a rounded `aspect-4/5` frame (`next/image` via
  `urlForImage`) with the `cardContent` stat card overlaid bottom-left as a `.glass` panel
  (display-font accent title + silver description). **Right** = accent uppercase `eyebrow` →
  bold `font-heading` headline → `description` body → a 2×2 `badges` grid (accent icon tile +
  title + description). `description` is a single string but rendered as multiple `<p>` by
  splitting on blank lines (`\n{2,}`).
- Icon string → Lucide via static `ICON_MAP` + `stegaClean` on the key (Trust/Offer pattern;
  badge icons constrained to `gem|target|wrench|award`). GSAP scroll reveal via the safe
  `gsap.set` + `.to` stagger over `[data-about-reveal]`. **No** in-component fallbacks — the
  section is guarded by `{about && …}` in `page.tsx`, so it renders only once an `aboutSection`
  doc exists. Replaced the broken placeholder (`max-w-7xl-px-6` typo, invisible accent-on-accent
  icon, scaffold `<h2>`).
- Schema: filled `aboutSection.badges` `initialValue` to the full 4 Polish defaults (was 1).
  Reinforced for the client that **`initialValue` is a one-time creation template, not a live
  default** — it does not backfill the already-existing singleton (queried the dataset: the
  published doc already had 4 badges, the draft had 1). `_key` is auto-generated by Sanity for
  array initial values, so that was never the issue.
- Same branch theme (dropping component fallbacks): added a `container` null-guard and
  `dependencies: [data]` to the Offer/Trust `useGSAP` effects so reveals re-run when live data
  arrives. Merged the whole `fix/drop-component-fallbacks` branch (Navbar/Hero/Offer/Trust
  refactors + `aboutBadge`/`aboutSection` schema) into `main`.
- Verified: frontend `tsc` + `eslint` (only the pre-existing TrustSection `useEffect` warning)
  - `next build` all pass. The badge `initialValue` edit is data-only → no type regen needed.
    No server actions/utils → no Vitest.

### Split section configs into singletons (2026-06-16)

Moved per-component config off the single `settings` (`siteSettings`) document into
dedicated **fixed-id singleton documents**, each its own top-level Studio sidebar entry —
so editors manage Navbar / Hero / Trust / Offer in separate places instead of one big
"Ustawienia" blob. Chosen over field-groups / a `homePage` doc; reverses the earlier
"embed everything in settings" precedent intentionally.

- **Studio:** `navbar` / `heroSection` / `trustSection` / `offerSection` converted from
  `type: 'object'` → `'document'` (kept in `schemaTypes/objects/`; folder name now cosmetic).
  `trustSection` got a distinct `CheckmarkCircleIcon` (was a 2nd `StarIcon`). Removed those
  four fields from `settings.tsx`; settings now holds only `title` / `description` /
  `ogImage` and is relabeled **"Ustawienia / SEO"**. `structure/index.ts` lists the four
  sections (each `.documentId(...)`) + divider + settings. `schemaTypes/index.ts` regrouped
  (singletons vs. embedded objects). Added Presentation `locations` for the four new types
  (all → home).
- **Frontend:** added `navbarQuery` / `heroQuery` / `trustQuery` / `offerQuery`; `settingsQuery`
  is metadata-only now. `page.tsx` fetches hero/trust/offer in parallel (`Promise.all`);
  `Header.tsx` fetches navbar; `layout.tsx` unchanged (still reads settings for metadata).
  No `dataAttr` calls existed, so no Visual-Editing path changes. Types regenerated
  (`SettingsQueryResult` slimmed; new `*QueryResult` types).
- **No data migration** (dev/fallback data): new singletons start empty, in-component Polish
  fallbacks cover Trust/Offer. **Hero is guarded by `{hero && …}`, so it won't render until a
  `heroSection` doc is created + saved** (its `backgroundImage` is required). Old values stay
  orphaned on `siteSettings` (harmless). Prod Studio needs a redeploy for the new structure;
  singletons are created on first save.
- Verified: frontend `tsc` + `next build`, studio `tsc`, `eslint` (only the pre-existing
  TrustSection `useEffect` warning) all pass. No server actions/utils → no Vitest.
- **Deferred (separate, pre-existing):** intermittent "Maximum update depth exceeded" in the
  Studio — not in our code (no custom Studio components); leading suspects are `@sanity/assist`
  and the Presentation tool still referencing removed `post`/`page` types. Awaiting a console
  component-stack to pinpoint; not touched in this branch.

### Bento Offer Cards + Prettier formatting (2026-06-16)

Home-page **Offer (Oferta)** section as a bento grid, matching the v0 prototype, plus a
project-wide Prettier formatting pass (committed separately).

- Component `frontend/app/components/sections/OfferSection.tsx` (`'use client'`): bento grid —
  on `lg` a 3-col × 3-row grid where the featured card is `col-span-2 row-span-2` and the rest
  auto-flow into the remaining cells (matches the screenshot: 2 stacked right, 2 along the
  bottom, bottom-right empty at 5 cards); `md` 2-col; mobile single-column stack with per-card
  `min-h`. Featured card sorts first so auto-flow stays clean.
- Card visuals: optional `next/image` background + bottom gradient; **hover** brightens/scales
  the image, fades in a corner `ArrowUpRight` button, and turns the title `accent`. Featured
  card shows a green "Wyróżnione" icon badge + title + description + pill badges; smaller cards
  show an icon tile (top) + title/description (bottom). Whole card is a `<Link>` to
  `/oferta/<slug>` (falls back to `ctaHref`).
- Icon string → Lucide via static `ICON_MAP` + `stegaClean` on the key (TrustSection pattern).
  Full in-component Polish fallbacks (5 cards: 1 featured + 4) since `initialValue` doesn't
  backfill the existing singleton. GSAP scroll reveal via the safe `gsap.set` + `.to` pattern.
- Header polish: replaced loose `container mx-auto` with the standard `mx-auto max-w-7xl px-6
md:px-12`; fixed the `thext-white` typo; styled subheadline (`text-silver`); "Poznaj całą
  ofertę" CTA is now an accent link with an animated arrow. Header stacks on mobile.
- **Prettier:** added root + frontend `prettier.config.mjs` overriding `@sanity/prettier-config`
  (`semi`, `bracketSpacing`, trailing commas, single quotes), removed the `package.json`
  `"prettier"` key, ignored generated/vendored paths (`.claude/**`, `**/.sanity/`,
  `sanity.types.ts`, `sanity.schema.json`). Reformatted the whole repo; TypeGen now emits the
  new style too (it formats its output with the project config), so the generated type files
  were regenerated to match. Committed as a standalone `chore:` so it stays out of blame.
- Verified: frontend `tsc`, studio `tsc`, `eslint` (no new warnings), `next build`, and
  `prettier --check .` all pass. No server actions/utilities added, so no Vitest tests.

### Trust Section (2026-06-15)

CMS-managed social-proof / credibility block on the home page, directly below the hero, with a GSAP scroll reveal. Also added a navbar entrance animation in the same session.

- Sanity: `trustSection` + `trustStat` object types (`studio/src/schemaTypes/objects/`), embedded as the `trust` field on the `settings` singleton (no `homePage` doc — matches the Hero precedent). `trustStat.icon` is a constrained `options.list` dropdown (8 allowed values, exported as `TRUST_STAT_ICONS`). Polish `initialValue` defaults for header, stats, badges. Registered `trustStat` in `index.ts`; regenerated types (`TrustSection`/`TrustStat`).
- Component `frontend/app/components/sections/TrustSection.tsx` (`'use client'`): centered header (`max-w-4xl`), responsive 4/2/1 stat-card grid, badge row. Icon string → Lucide via a static `ICON_MAP` (no dynamic imports), with `stegaClean` on the key so Visual Editing metadata doesn't break the lookup. Green radial glow in the upper-left (`relative overflow-hidden` section + absolute blurred radial). Full in-component fallbacks; rendered **always** in `page.tsx` (initialValue doesn't backfill the existing singleton), so the section shows even before an editor populates it.
- **GSAP fix:** initial implementation chained three `.from()` tweens in one ScrollTrigger timeline → cards stayed stuck at `opacity:0` (immediateRender footgun). Rewrote to `gsap.set(...)` hidden state + `.to()` reveals (header → cards stagger 0.1 → badges) with `toggleActions: 'play none none none'`, via `useGSAP`. Reliable now.
- **Hover polish:** card carries `border-b-2` at rest (was `hover:border-b-2`, which shifted height by 1px) and only swaps the bottom color to accent on hover; icon gets `group-hover:brightness-125` (greener) and its tile `group-hover:bg-accent/20`.
- **Navbar entrance:** new `nav-slide-down` keyframe in `globals.css` (`translateY(-100%)` + fade); header animates in with `animate-[nav-slide-down_0.45s_cubic-bezier(0.22,1,0.36,1)]`. Independent of the scroll-based background transition.
- Verified: frontend `tsc`, studio `tsc`, `eslint`, `next build` all pass. No server actions/utilities added, so no Vitest tests (per coding standards).

### Navbar dropdown links not clickable (fix, 2026-06-15)

Oferta / Formularze wycen desktop dropdown items had no hover feedback and didn't navigate on click. Ark UI's `Menu` (portalled, Zag-driven) was the culprit; two attempts to fix it within Ark (`asChild`+`Link`, then plain `Menu.Item`+`onSelect`/`router.push`) both still failed in the browser.

- Final fix: **removed Ark `Menu` from the desktop dropdowns entirely.** New in-file `NavDropdown` component — plain `useState` open/close, no portal, real `<Link>` anchors. Closes on outside `pointerdown`, `Escape`, or link click. Panel is `absolute top-full` inside a `relative` wrapper (`align` left/right); hover via native `hover:bg-white/10`. Real anchors restore native clicks, hover, and middle-click "open in new tab".
- Dropped the `Menu`/`useRouter` imports; `Portal` stays (mobile `Dialog` drawer still uses Ark). Mobile drawer (Ark `Accordion` + `Link`) was unaffected and left as-is.

### Navbar logo image (2026-06-15)

Optional uploadable logo image for the navbar, falling back to the existing letter-square + brand text.

- Sanity: added a `logoImage` (`type: 'image'`, hotspot) field to the `navbar.logo` object (`studio/src/schemaTypes/objects/navbar.ts`); relabeled `iconLetter` as the fallback. Field is named `logoImage` (not `icon`) to avoid colliding with a plugin-registered `icon` type during schema extract. Regenerated types (`LogoImage`).
- Component `Navbar.tsx`: when `logo.logoImage.asset` is set, render it via `next/image` (`urlForImage(...).height(64).fit('max')`, `h-8 w-auto object-contain`, `priority`) in place of the whole current logo; otherwise fall back to the green letter-square + text. Mobile drawer title stays text (`logoText`).
- Note: image **replaces** the square+text (a logo image normally includes the wordmark) — not shown alongside.

### Navbar (2026-06-15)

Fixed site navigation bar, CMS-managed logo + CTA, with desktop dropdowns and a mobile drawer.

- Sanity: `navbar` object type (`studio/src/schemaTypes/objects/navbar.ts`) with `logo {text, iconLetter, href}` + `ctaButton {label, href}` (Polish labels, spec defaults), added as the `navbar` field on the `settings` singleton. Generated `Navbar`/`Logo`/`CtaButton` types via TypeGen.
- Component `frontend/app/components/layout/Navbar.tsx` (`'use client'`): `fixed top-0 z-50 h-16`, transparent → `bg-bg-mid/80 backdrop-blur-md` past `scrollY > 50` (`transition-all duration-300`). Logo left, center nav, right actions.
- **Oferta** (7 links) + **Formularze wycen** (4 links) dropdowns use Ark UI `Menu` (portalled `z-50`, chevron rotates via `group-data-[state=open]`, closes on outside-click/select). Mobile drawer = Ark UI `Dialog` right slide-in (`bg-bg-mid`) with Ark `Accordion` sub-menus + bottom CTA; closes on link click / overlay / X.
- Links follow the **project IA** (not the screenshot placeholders); active state via `usePathname`. Logo/CTA have in-component fallbacks (matching the Hero precedent).
- **Layout fix:** center nav is an in-flow `flex-1` group with `shrink-0` sides (was `absolute left-1/2`), so center links never overlap the right actions as the viewport narrows toward `lg`.
- Installed `@ark-ui/react` + `lucide-react` (both were "to add" in the stack). `Header` now fetches `settings` and renders `<Navbar>`. Added `nav-fade-in` / `nav-slide-in-right` keyframes to `globals.css`.
- Used Ark `Dialog` (not the `Drawer` primitive — that one is a swipe/snap-point bottom-sheet, heavier than this spec needs).

### Hero Section (2026-06-15)

Fullscreen homepage hero, CMS-managed (Polish copy) with GSAP entrance animation.

- Sanity: `heroSection`/`heroStat` object types in `studio/src/schemaTypes/objects/`, embedded as the `hero` field on the `settings` singleton (no separate `homePage` doc — extends the existing singleton per project convention). Removed the test `settings.heading` field.
- Component `frontend/app/components/sections/HeroSection.tsx`: `next/image` background, dark gradient overlay + faded blueprint grid, accent-split headline (`stegaClean` before substring match so Visual Editing watermarks don't break it), primary (green) + glassmorphic secondary CTAs, separate `.glass` stat cards (2×2 mobile / 4-up desktop), staggered upward reveal via `useGSAP` (`gsap` + `@gsap/react`).
- Mobile: centered content, side-by-side equal-width CTAs, responsive type scale (`text-4xl`→`text-7xl`).
- CTA labels/hrefs and stats have in-component fallbacks (schema `initialValue` doesn't backfill fields added to an existing doc).
- Rendered on `/`; emptied the placeholder `Header` (site name stays in metadata only). Fixed `cdn.sanity.io` `remotePatterns` (object form — the `new URL(...)` form rejected query-string srcs). Exported `urlForImage`.
- Polished all client-facing Studio labels (schema fields, structure sidebar, workspace/Presentation titles).

### Styling — Global Design System (2026-06-15)

Set up the foundational design system in `frontend/app/globals.css` and `frontend/app/layout.tsx`.

- Color palette + typography tokens exposed via Tailwind v4 `@theme` (`bg-deep`/`bg-mid`/`bg-surface`, `accent` `#6FCF3A` + `accent-hover` `#5BB82E`, `graphite`, `silver`, `white`; `font-display`/`font-heading`/`font-body`)
- Fonts loaded via `next/font/google` (Bebas Neue, Space Grotesk, Inter) instead of `@import` — matches project convention and avoids double-loading
- Dark `body` background, smooth scroll, `.glass` and `.section-padding` utilities
- Removed leftover IBM Plex Mono font; set `html lang="pl"`
