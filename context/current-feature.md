# Current Feature

## Status

Not Started

## Goals

<!-- Populated by /feature load -->

## Notes

<!-- Populated by /feature load -->

## History

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
