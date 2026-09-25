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
