# Hero Section — Spec

## Overview

Build the `HeroSection` component for the Complex home page. It is a fullscreen cinematic section with a background image, dark overlay, animated text content, two CTA buttons, and a row of stat cards at the bottom. All text content is managed via Sanity. Animations use GSAP — all content animates in on page load along the Y axis (upward reveal). All visible text must be in Polish.

## Sanity Schema

Create a `heroSection` schema object (embedded in the `homePage` document or as a standalone document) with the following fields:

- `backgroundImage` — image — the fullscreen background photo
- `headline` — string — main headline text (e.g. "Nowoczesne zadaszenia aluminiowe dla luksusowego życia na zewnątrz")
- `headlineAccent` — string — the word or phrase within the headline rendered in `--color-accent` green (e.g. "luksusowego życia na zewnątrz")
- `subheadline` — string — supporting paragraph below the headline
- `primaryCtaLabel` — string — label for the primary (green) button, default: "Nasze realizacje"
- `primaryCtaHref` — string — link for the primary button, default: `/realizacje`
- `secondaryCtaLabel` — string — label for the ghost button, default: "Darmowa wycena"
- `secondaryCtaHref` — string — link for the secondary button, default: `/wycena/zadaszenie`
- `stats` — array of objects, each with:
  - `value` — string — e.g. "1200+"
  - `label` — string — e.g. "Realizacji"

## Component Requirements

- File: `src/components/sections/HeroSection.tsx`
- Fullscreen height: `min-h-screen`
- Background: `backgroundImage` from Sanity rendered via `next/image` with `fill` and `object-cover`, below a dark overlay `div` with `bg-black/60`
- Layout: content vertically centered in the upper ~65% of the section, stat cards pinned to the bottom
- Headline: rendered in `--font-heading` (Space Grotesk), large display size (`text-5xl` to `text-7xl`). The `headlineAccent` substring is wrapped in a `<span>` with `text-accent` color. All other headline text is white
- Subheadline: rendered in `--font-body` (Inter), `text-lg`, `text-silver`, max width ~`600px`
- Primary CTA: solid green button (`bg-accent text-black`), label from `primaryCtaLabel`, links to `primaryCtaHref`, arrow icon (`→`) on the right
- Secondary CTA: ghost button (transparent background, white text, play icon on left), label from `secondaryCtaLabel`, links to `secondaryCtaHref`
- Stat cards row: pinned to the bottom of the section, full width, 4 cards in a horizontal row
  - Each card: `glass` utility class, padding `py-6 px-8`, stat `value` in `--color-accent` and large font (`text-4xl font-bold --font-heading`), `label` in white below in `text-sm`
  - Cards are separated by a `1px` vertical border in `--color-graphite`
  - On mobile: 2×2 grid

## Default Stat Values

Seed these as default content in the Sanity document or as fallback constants in the component:

| Value | Label |
|---|---|
| 1200+ | Realizacji |
| 15 | Lat doświadczenia |
| 98% | Zadowolonych klientów |
| 50+ | Opcji projektowych |

## GSAP Animations

- Install `gsap` if not already present
- On component mount (`useGSAP` or `useEffect`), run a staggered timeline that animates the following elements **upward** (from `y: 40` to `y: 0`) with `opacity` from `0` to `1`:
  1. Headline
  2. Subheadline
  3. CTA buttons (both together)
  4. Stat cards row
- Stagger delay between each group: `0.15s`
- Ease: `power3.out`
- Duration per element: `0.8s`
- Use `gsap.context()` for cleanup on unmount

## References

- `@context/complex-project-spec.md` — Hero Section, Design System
- `@context/screenshots/hero.png` — visual reference
- `@src/app/globals.css` — CSS variables and utility classes
- `@sanity/schemas/homePage.ts` — add `heroSection` fields here
- `src/components/sections/HeroSection.tsx` — file to create
