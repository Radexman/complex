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
