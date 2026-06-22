# Current Feature

## Status

Not Started

## Goals

<!-- Bullet points of what success looks like -->

## Notes

<!-- Additional context, constraints, or details from spec -->

## History

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
