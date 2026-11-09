# Current Feature

## Status

Not Started

## Goals

<!-- Populated by /feature load -->

## Notes

<!-- Populated by /feature load -->

## History

### Announcement Banner — Sanity-controlled, auto-expiring, dismissible (2026-09-25)

New sticky promo bar above the Navbar, fully CMS-controlled (enable/disable, text, end date,
optional CTA). Spec: `context/features/announcement-banner-spec.md`, plus a reference screenshot
the client supplied showing the target visual (icon + text + muted end-date + green pill CTA + ✕).
Branch `feature/announcement-banner`, cut from `main`.

- **Schema deviates from the spec's "embed in `siteSettings`" instruction, on purpose.** The
  2026-06-16 history entry deliberately split every section config (Navbar, Hero, Trust, etc.) out
  of `settings` into its own fixed-id singleton, specifically so `settings` stays metadata/SEO-only
  — every section added since has followed that precedent. New `announcementBanner` singleton
  (`isEnabled`/`text`/`endsAt`/`ctaLabel`/`ctaHref`, icon `WarningOutlineIcon` — `@sanity/icons` has
  no megaphone glyph), registered in `schemaTypes/index.ts`, a "Baner ogłoszeń" structure entry
  (first item — it renders above the Navbar), and a Presentation `locations` resolver (→ home,
  "used on all pages", matching `navbar`/`footer`). `ctaHref` has a custom validation requiring a
  link whenever a label is set. `ctaLabel`/`ctaHref` carry `initialValue`s ("Zapytaj o wycenę" →
  `/wycena/zadaszenie`) per a mid-session user request — new documents default to the canopy
  quotation form, matching the CTA in the client's own reference screenshot.
- ⚠️ **The spec's core layout assumption was wrong for this codebase, and acting on it as written
  would have shipped a banner that either got covered by the Navbar or never pushed it down.** The
  spec assumes a `sticky` Navbar that a banner placed above it in the DOM would naturally push
  down. This repo's Navbar is actually `position: fixed` (`Navbar.tsx`, `fixed top-0 left-0 z-50`)
  — fixed elements are removed from normal flow, so a banner rendered before it in markup would NOT
  push it anywhere; it would just render underneath/behind the fixed Navbar. Fixed by moving the
  fixed positioning **off** `Navbar.tsx`'s own `<header>` (now plain `w-full`) and **onto a shared
  wrapper** in `layout.tsx`: `<div className="fixed inset-x-0 top-0 z-50"><AnnouncementBar />
<Header /></div>`. Banner and Navbar now stack in ordinary document flow *inside* that one fixed
  strip, so the Navbar rises on its own the moment the banner isn't rendered (disabled, expired, or
  dismissed) — zero cross-component height coordination, no `ResizeObserver`, no CSS variables.
  Documented with a comment in both files pointing at each other.
- **Known, spec-acknowledged limitation, not chased further:** hero sections' `pt-28`/`pt-20`
  clearance padding is calibrated to the Navbar's height alone (the Navbar has always been `fixed`
  and out of flow, so page content has always had to manually clear it). When the banner is
  showing, the very top of a hero could have a few px less clearance than ideal. The spec itself
  explicitly says banner height "should not be baked into scroll offsets" — same call applied here;
  not treated as a bug to fix with a magic pixel value, matching the Round 4 `/wycena` stripes
  precedent for exactly this kind of tradeoff.
- **Dismissal check avoids `useEffect` + `setState`** — this repo's `react-hooks/set-state-in-effect`
  lint rule is an **error**, not a warning (confirmed live: it failed the first draft). Read
  `localStorage` in a lazy `useState` initializer instead, inside a component mounted **client-only**
  via `dynamic(() => import('./AnnouncementBanner'), { ssr: false })` (`AnnouncementBannerMount.tsx`)
  — the exact pattern `FormThankYou.tsx`/`FormThankYouPanel.tsx` already established for the same
  class of problem (state that only exists in the browser, so SSR has nothing honest to render).
  `AnnouncementBar.tsx` (new, mirrors `Header.tsx`'s fetch-then-render shape) is the async server
  component that fetches `announcementBannerQuery` and computes the active window (`isEnabled` +
  `endsAt` in the future) server-side — an expired or disabled banner never reaches the client, no
  HTML, no hydration cost, matching the spec's intent exactly.
- Reused the existing `nav-slide-down` keyframe (already driving the Navbar's own mount animation)
  for the banner's entrance instead of adding new CSS.
- Styling: `bg-white/4 backdrop-blur-xl border-b border-graphite` glassmorphism strip (spec's exact
  rgba/blur values, translated to this repo's `graphite` border token instead of a raw rgba value
  to stay consistent with the design system); CTA pill styled like the existing
  `FacebookRealizacjeLink` accent-outline-pill pattern (border-accent/60 + bg-accent/10 + text-accent,
  filling solid on hover) rather than the spec's filled-button description — matches the outlined
  green pill in the client's screenshot exactly, not a solid button.
- ⚠️ **Found a pending, unrelated-to-us client draft while auditing for conflicts before seeding any
  test content — left it completely untouched.** `drafts.announcementBanner` already existed in the
  dataset (created the same day, `isEnabled: false`, `text: "Promocja Testowa - 15"`, no
  `endsAt`/CTA yet), and both the client's local dev servers (frontend :3000, studio :3333) were
  listening at the time — the client appears to have been testing this feature live in their own
  Studio session in parallel with this build. Per this project's standing rule to never clobber an
  in-progress client draft, no test content was seeded or published over it. **Consequence: full
  interactive in-browser verification (Playwright) was not performed this session** — the client's
  dev servers had also stopped running by the time implementation finished (not something this
  session did). Verified instead via `lint` (clean), `type-check` (both workspaces, clean),
  `next build` (clean, all 29 routes prerender exactly as before, no new routes — the banner adds
  no route), and `npm test` (**184/184**, unchanged — this feature adds no server actions/utilities,
  matching the coding-standards test scope).
- **Studio NOT redeployed this session** — the new "Baner ogłoszeń" structure entry won't be
  visible in the hosted Studio editor until `npm run deploy` is run from `studio/` (same recurring
  precedent as every prior schema-adding feature).
- **Still open, flagged to the client rather than acted on:** their in-progress
  `drafts.announcementBanner` won't retroactively pick up the new `ctaLabel`/`ctaHref`
  `initialValue`s (Sanity's initialValue-doesn't-backfill-existing-docs behavior, same as every
  other singleton in this project) — they'll need to fill those two fields in manually, or ask for
  a narrow patch of just those two empty fields on their existing draft.

### Client Feedback Round 11 — SEO podstron, kolor banera, korekty formularzy wycen (2026-10-13)

Client message of 13.10.2026. Spec: `context/features/feedback-round-11-spec.md`. Branch
`feature/feedback-round-11`, cut from `main`.

- **SEO per subpage:** new reusable `seo` object (`title`, `description`, `ogImage` + `alt`, all
  optional, length limits as warnings). **Deviation from the spec:** no separate `pageSeo` singleton.
  The spec assumed the static routes have no document of their own, but they all do (`ofertaPage`,
  `realizacjePage`, `tarasyPage`, `wycenaPage`, 4 × `*FormConfig`). So `seo` sits on those plus
  `service`, `aboutPage`, `faqPage`, `legalPage` (12 docs). Tabbed docs get an „SEO” tab; the rest
  get a collapsed „SEO” object. All 11 page types use `generateMetadata` → `buildSeoMetadata(seo,
  fallback)` (tested). Fallback order: `seo.*` → old field (`seoDescription`/`seoTitle`) → the
  former hardcoded text. The doubled brand in `<title>` is gone. `openGraph` is set only when there
  is an image, so pages inherit the site-wide OG image (`/oferta/[slug]` used to suppress it with
  `images: []`). The fallback title is trimmed, because CMS `faqPage.seoTitle` is `"FAQ "`.
- **Banner color:** `announcementBanner.color` radio presets (`brand` default, red, orange, yellow,
  blue, graphite) → `BANNER_THEMES` class literals, `stegaClean`, empty → `brand`. Other presets
  not previewed live, to avoid touching the client's published banner.
- **Forms:** „Prowadzi do” removed from `OfferFormCta`. Taras montaż text and „CComplex” in the
  contact RODO consent changed. Zadaszenie options renamed, plus 4 new add-ons (16 total) and a
  helper text for the „Żaluzje tarasowe” field. **Zaluzje: 3 openings** (1 required, 2–3 optional
  both-or-neither). The pair rule needs `superRefine(…, { when })`: without it Zod 4 skips the
  object refinement while any other field is invalid, so the error only showed after everything
  else was fixed (caught in the browser, covered by a test).
- Verified: lint, type-check, Vitest 202/202, clean `next build` (29 routes, all still static/SSG).
  Browser check on a local `next start`. Studio deployed.
- **Unrelated working-tree churn was left uncommitted on purpose:** CRLF-only diffs, prettier
  reformatting of `AUDIT.md`/old specs, `package-lock.json` `dev`/`devOptional` flips,
  playwright logs.
- **Open for the client:** (1) is the 6-color preset set OK? (2) Is „CComplex sp. z o.o.” the
  registered name? If yes, also fix `/o-nas` and the privacy policy. (3) „Wolnostojące” was applied
  for grammatical consistency (FYI). (4) The live banner's CMS `ctaHref` is
  `oferta/zadaszenia-tarasowe`, with no leading `/`, so it 404s from subpages. It should be
  `/oferta/zadaszenia-tarasowe`.

### Client Feedback Round 12 — `/wycena/zadaszenie` korekty nazw (2026-10-27)

Client message of 27.10.2026. Spec: `context/features/feedback-round-12-spec.md`. Branch
`feature/feedback-round-12`, cut from `main`.

- Copy-only, in `zadaszenieForm.ts` + `ZadaszenieForm.tsx`. No schema change, no Studio redeploy.
  Field `name`s unchanged; the quote e-mail reads the same labels.
- `ROOF_TYPES`: „Materia (pergole ekonomiczne)”, „Roleta rzymska (Deponti Verdeca)”. Typo
  „Markizy podachowe” → „poddachowe”. Montaż helper text unified with Taras/Żaluzje („Zaznacz,
  jeśli wycena ma obejmować montaż.”).
- Add-ons: the sliding glass options reordered to „Zabudowa przesuwna, bezramowa/ramowa, szkło”.
  The client's „apply that logic to each matching checkbox” was read as the ` / ` → ` - `
  separator change on all 12 bok 1 / bok 2 / front options, for consistency. The client's
  screenshot wasn't available, so the table was derived from their two examples.
- Verified: lint, type-check, Vitest 202/202, clean `next build`. New labels confirmed in the
  prerendered `/wycena/zadaszenie` HTML (no old strings left). No interactive browser or e-mail
  send check.
- Unrelated working-tree churn again left uncommitted (same as Round 11).
- **Open for the client:** „Materia” applied as written. Should it be „Materiał” (fabric)?

### Client Feedback Round 13 — po wdrożeniu: przekierowania, canonical (2026-11-05)

Client messages of 5.11.2026. Spec: `context/features/feedback-round-13-spec.md`, attachments in
`context/features/assets/`. Branch `feature/feedback-round-13`, cut from `main`. **Only the code
part is done. The conversions work is still open, see below.**

- **Redirects:** old WordPress addresses → new pages in `next.config.ts`. News posts, old thank-you
  pages, categories, tags and author stay 404 on purpose, to avoid soft 404s.
- **Canonical:** required `path` on `buildSeoMetadata` → `alternates.canonical` on all indexable
  pages; the home page sets its own. Not in the root layout, or every page would inherit it.
- **`metadataBase`:** `NEXT_PUBLIC_SITE_URL` first, then the CMS value (still the non-`www` address).
- **Studio:** `www.ccomplex.pl` added to `PREVIEW_ALLOW_ORIGINS`. `SANITY_STUDIO_PREVIEW_URL` changed
  locally in `studio/.env.production`, which is git-ignored.
- **Deviation from the spec:** the `dziekujemy-kontakt` title is „Wiadomość wysłana”, without the
  brand, because the layout template already appends it. „CComplex” would have appeared twice.
- Verified: lint, type-check, Vitest 203/203, `next build`. On a local `next start`: 33 old URLs
  reach the right page, canonicals on 14 pages, none on thank-you pages, browser check of
  `/kontakt/` → `/#kontakt`. **Not verified:** the full chain from `https://ccomplex.pl/...`, which
  needs a deploy.
- Unrelated working-tree churn again left uncommitted.

**Deployed and verified on production the same day:** the full redirect chain from
`https://ccomplex.pl/.../`, canonicals on all 18 sitemap pages, Studio deploy with Presentation on
`www`, `vercel.app` → `www` redirect, CMS metadata base and banner link, Firewall (nothing blocks AI
bots).

**⚠️ Correction of the first diagnosis, same day.** The spec's first version said conversions fail
because GTM still targets WordPress. After seeing GTM and Ads, that is true only of the 4 old tags,
which most likely fed `A_Wczytany`. The three primary `A_Przesłany` conversions are page-load rules
on the new thank-you URLs. All campaigns are paused, so zero conversions since 27.10 proves nothing.
A browser test confirmed the tag prepares a `page_view` for the thank-you URL after client-side
navigation. **Not yet proven with a live conversion.** Schody does have a conversion, created
5.11.2026. GA4 enhanced measurement is off, contrary to the spec's first assumption.

**Still open, full steps in the spec:**

- **Google Ads policy messages (P0):** the client reports many, content not seen yet. Basic outside
  checks found no cause.
- **Conversions:** live test once a new campaign runs. Three goal categories should become one.
- **GTM:** 5 unpublished changes from `info@ccomplex.pl`. Don't publish them, and don't discard them
  without her consent. Use a separate workspace if work starts earlier.
- **GA4:** `G-2YVGGG5VH6` confirmed, tag missing; turn on enhanced measurement when adding it.
- **Cookies:** no banner or Consent Mode, and `_gcl_au` is set on first visit. The client has no
  CookieYes account. The privacy policy doesn't mention Google Ads, Analytics or Tag Manager.
- **Other:** Search Console (the client added pages today; check the sitemap), new logo (trim margins;
  Navbar and Footer in Studio; check the favicon and OG images).
- **Questions for the client:** see the end of the spec.

### Fix — Kierownik budowy redirects + brand favicon (2026-11-09)

Follow-up to Round 13. Branch `fix/kierownik-favicon`, cut from `main`.

- **Kierownik budowy:** the client confirmed the service is no longer offered. `/kierownik-budowy` and
  `/kierownik-budowy/:path+` redirect to `/oferta` (same as „Elewacje kompozytowe”). The old offer
  URLs with `kierownik-budowy` in the parent folder name are not this service and already redirect.
- **Favicon:** the Next.js „N” from the Sanity template was still the site icon, and Google showed it
  in results. Replaced with the „CC” mark: `app/favicon.ico` (16/32/48 PNG entries), `app/icon.png`
  (512) and `app/apple-icon.png` (180, on `#0B0B0C`). **Deviation from the plan:** no ring. The script
  keeps only the two largest shapes in the logo, because the ring, the part of the „O” inside the
  second „C” and the wordmark were noise at 16 px. Made from
  `context/features/assets/ccomplex-logo-2026-11.png` (1000×452); the user's
  `frontend/assets/*.webp` is the same logo at 354×160 and was left untracked and untouched.
- Verified: lint, type-check, Vitest 203/203, `next build`. On a local `next start`: all four
  Kierownik variants end on `/oferta` with 200, the old Deceuninck offer URL still redirects, and
  the three icons are in `<head>` and served with 200. **Not verified on production yet** (needs a
  push). Google may take days to weeks to show the new icon in results.
- Round 13 spec corrections committed separately (`docs:`).

### Fix — Old gallery filter redirect → /realizacje (2026-11-09)

Branch `fix/gallery-filter-redirect`, cut from `main`.

- `/awl_filter_gallery/:path*` (old WordPress gallery-plugin filter pages) → `/realizacje` in
  `next.config.ts`, next to `/realizacje/:path+`. The new gallery has no per-category URLs.
- Source: the Search Console 404 report for `https://ccomplex.pl/` (9.11.2026). It was the only
  reported 404 with a real equivalent; the other five (tags, an old thank-you page, a news post) stay
  404 on purpose, and Hartika was already fixed by Round 13. The 403 (`/wp-content/plugins/*`),
  noindex (`/comments/feed/`) and nine crawled-not-indexed URLs are all old WordPress leftovers.
- Verified: lint, type-check, Vitest 203/203, `next build`. On a local `next start`: the reported URL
  with and without the trailing slash, another filter and the bare path all end on `/realizacje` with
  200; `/realizacje/zadaszenia/`, Hartika and `/kierownik-budowy/` still redirect. **Not verified on
  production yet** (needs a push).
- The client message drafted on 9.11.2026 promises this redirect, so send it after the deploy.

### Lighthouse — agentic browsing, accessibility, safe security headers (2026-11-09)

Spec: `context/features/lighthouse-best-practices-agentic-spec.md` (Lighthouse 13.6.0). Branch
`feature/lighthouse-agentic-a11y`, cut from `main`. Scope: the spec's „This round” (items 1, 2, 8 and
the safe headers from item 4).

- **Baseline:** in a clean profile Best practices was already 100; the developer's 77 came from
  third-party cookies in their own browser profile. Agentic browsing was 50 on three pages because
  of two accessibility-tree failures.
- **Map marker:** `ShowroomMap` sets an `aria-label` („Salon CComplex: <address>”) on the Leaflet
  divIcon, which renders as an unnamed focusable `role="button"`.
- **Project filter:** `FeaturedProjectsSection` and `ProjectsGrid` used Ark UI Tabs with no
  `Tabs.Content`, so `aria-controls` pointed at nothing. Replaced with `ToggleGroup`
  (`deselectable={false}`, `value={[activeTab]}`, active style on `data-[state=on]`). Ark renders it as a
  `radiogroup` with `role="radio"` items. Same look, state and `data-*-reveal` hooks.
- **Accessibility:** footer column headings `h3` → `h2` (same classes); `text-silver/60` helper text
  → `text-silver` in `FormFileDropzone`/`FormSuccessState`; the „Polityka prywatności” consent link is
  underlined in all five forms.
- **Headers** (`headers()` in `next.config.ts`): `nosniff`, `Referrer-Policy`, HSTS
  `includeSubDomains` (no `preload`), `Content-Security-Policy: frame-ancestors`.
  **Deviations from the plan:** (1) `frame-ancestors` also lists `https://www.sanity.io` and
  `https://*.sanity.studio`, because the hosted Studio redirects into the sanity.io dashboard and
  `frame-ancestors` checks every ancestor; (2) **COOP was skipped**: it could cut the opener link when
  Presentation opens the preview in a separate window, and it is an unscored hint.
- Verified: lint, type-check, Vitest 203/203, `next build`. Lighthouse 13.6.0 on a local `next start`:
  Agentic 100 and Accessibility 100 on `/`, `/realizacje`, `/oferta/zadaszenia-tarasowe` and
  `/wycena/zadaszenie`; Best practices 96 locally only from a Sanity CORS error on port 3100 (100 on
  production). Headers confirmed with `curl`. Filter checked in the browser: click filters (20 of
  86), re-click keeps the selection, Tab enters the group, arrows move focus, Enter selects.
- **Not verified:** Presentation in the hosted Studio with the new `frame-ancestors` (needs a
  deploy; if it breaks, adjust `FRAME_ANCESTORS`); a visual check of the filter styling.
- Left for later, per the spec: third-party cookies and full CSP (with the cookie banner),
  `llms.txt`, source maps, ARD/WebMCP, `/realizacje` performance (73).
- `OfferIndexGrid.tsx` (older uncommitted churn) left out of the commit.
