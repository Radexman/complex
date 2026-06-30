# Current Feature

## Status

Not Started

## Goals

<!-- Bullet points of what success looks like -->

## Notes

<!-- Additional context, constraints, or details from spec -->

## History

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
  mirroring the old hardcoded copy. Distinct from `featuredProjectsSection` (that's the *home*
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
