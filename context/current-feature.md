# Current Feature: Hero Section

## Status

In Progress

## Goals

- Build `HeroSection` component at `frontend/src/components/sections/HeroSection.tsx` — fullscreen (`min-h-screen`) cinematic hero with Sanity-managed content (Polish copy)
- Add a `heroSection` Sanity schema object: `backgroundImage`, `headline`, `headlineAccent`, `subheadline`, `primaryCtaLabel`/`primaryCtaHref` (default "Nasze realizacje" → `/realizacje`), `secondaryCtaLabel`/`secondaryCtaHref` (default "Darmowa wycena" → `/wycena/zadaszenie`), and a `stats` array of `{value, label}`
- Background image via `next/image` (`fill`, `object-cover`) under a `bg-black/60` overlay; content centered in upper ~65%, stat cards pinned to bottom
- Headline in `font-heading` (Space Grotesk), `text-5xl`–`text-7xl`, white with `headlineAccent` substring wrapped in `text-accent` span; subheadline in `font-body` (Inter), `text-lg text-silver`, max width ~600px
- Primary CTA: solid `bg-accent text-black` with right `→` icon; Secondary CTA: ghost (transparent, white text) with left play icon
- Stat cards row: 4 cards full-width using `.glass`, `py-6 px-8`, value in `text-accent` + `text-4xl font-bold font-heading`, label white `text-sm`, separated by `1px` `graphite` vertical borders; 2×2 grid on mobile
- GSAP staggered upward reveal on mount (headline → subheadline → CTAs → stat cards), `y: 40`→`0`, opacity `0`→`1`, stagger `0.15s`, ease `power3.out`, duration `0.8s`, cleanup via `gsap.context()`

## Notes

- Default stat values (seed as Sanity defaults / component fallbacks): `1200+` Realizacji, `15` Lat doświadczenia, `98%` Zadowolonych klientów, `50+` Opcji projektowych
- Install `gsap` if not already present
- Schema decision needed: embed `heroSection` in a `homePage` document or as a standalone — spec references `@sanity/schemas/homePage.ts` but this repo authors schema in `studio/src/schemaTypes/`. Reconcile paths during implementation
- Visual reference: `context/screenshots/hero.png`; CSS tokens/utilities in `frontend/app/globals.css`
- After schema/GROQ changes, regenerate types: `cd frontend && npm run sanity:typegen`
- All visible copy Polish; code identifiers English

## History

### Styling — Global Design System (2026-06-15)

Set up the foundational design system in `frontend/app/globals.css` and `frontend/app/layout.tsx`.

- Color palette + typography tokens exposed via Tailwind v4 `@theme` (`bg-deep`/`bg-mid`/`bg-surface`, `accent` `#6FCF3A` + `accent-hover` `#5BB82E`, `graphite`, `silver`, `white`; `font-display`/`font-heading`/`font-body`)
- Fonts loaded via `next/font/google` (Bebas Neue, Space Grotesk, Inter) instead of `@import` — matches project convention and avoids double-loading
- Dark `body` background, smooth scroll, `.glass` and `.section-padding` utilities
- Removed leftover IBM Plex Mono font; set `html lang="pl"`
