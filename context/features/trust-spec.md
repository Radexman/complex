# Trust Section — Spec

## Overview

Build the `TrustSection` component for the Complex home page. It sits directly below the hero and serves as a social proof / credibility block. It contains a centered header with eyebrow label, a headline, a subheadline, a 4-column grid of stat cards, and a row of trust badges at the bottom. All content is managed via Sanity. Cards animate in on scroll using GSAP. All visible text must be in Polish.

## Sanity Schema

Add a `trustSection` object to the `homePage` document with the following fields:

- `eyebrow` — string — small uppercase label above the headline, default: "Dlaczego Complex?"
- `headline` — string — section headline, default: "Zaufali nam właściciele domów w całym regionie"
- `subheadline` — string — supporting sentence below the headline, default: "Nasze zaangażowanie w jakość sprawiło, że staliśmy się pierwszym wyborem przy realizacji nowoczesnych przestrzeni zewnętrznych."
- `stats` — array of objects (min 1, max 6), each with:
  - `icon` — string — icon identifier, must be one of the allowed values listed below, rendered as a dropdown in Sanity Studio using `options.list`
  - `value` — string — the large number/text displayed, e.g. "1200+"
  - `label` — string — bold label below the value, e.g. "Zrealizowanych montaży"
  - `description` — string — smaller muted text below the label, e.g. "Pergole i zadaszenia zamontowane na terenie Śląska i Opolszczyzny"
- `badges` — array of strings — short trust labels shown as bullet-point items at the bottom of the section, e.g. "10 lat gwarancji", "Darmowa konsultacja"

### Allowed Icon Values (for `icon` field `options.list`)

Map these string values to Lucide React icons in the frontend component:

| Value      | Lucide Icon   | Suggested use         |
| ---------- | ------------- | --------------------- |
| `"shield"` | `ShieldCheck` | Quality / warranty    |
| `"clock"`  | `Clock`       | Years of experience   |
| `"award"`  | `Award`       | Customer satisfaction |
| `"users"`  | `Users`       | Team members          |
| `"star"`   | `Star`        | Ratings               |
| `"check"`  | `CheckCircle` | Certifications        |
| `"tool"`   | `Wrench`      | Craftsmanship         |
| `"map"`    | `MapPin`      | Location / region     |

In Sanity Studio this renders as a `select` dropdown. In the component, use a lookup map (plain object) to resolve the string to the correct Lucide component — do not use dynamic imports.

## Default Stat Card Values

Seed these as Sanity document defaults:

| Icon       | Value | Label                  | Description                                                       |
| ---------- | ----- | ---------------------- | ----------------------------------------------------------------- |
| `"shield"` | 1200+ | Zrealizowanych montaży | Pergole i zadaszenia zamontowane na terenie Śląska i Opolszczyzny |
| `"clock"`  | 15    | Lat doświadczenia      | Pionierskie rozwiązania w zakresie przestrzeni zewnętrznych       |
| `"award"`  | 98%   | Zadowolonych klientów  | Na podstawie zweryfikowanych opinii klientów                      |
| `"users"`  | 50+   | Opcji projektowych     | Konstrukcje, materiały i wykończenia dobrane do każdego projektu  |

## Default Badge Values

- 10 lat gwarancji
- Bezpłatna konsultacja
- Materiały premium
- Realizacje na terenie Śląska i Opolszczyzny

## Component Requirements

- File: `src/components/sections/TrustSection.tsx`
- Section background: `bg-bg-mid` (`#111111`)
- Apply `.section-padding` utility class for vertical spacing
- Layout: centered content column, `max-w-4xl` for header block, full width for cards

### Header Block (centered)

- Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase` — rendered above the headline
- Headline: `font-heading text-4xl md:text-5xl font-bold text-white`
- Subheadline: `font-body text-base text-silver text-center max-w-2xl mx-auto mt-4`

### Stat Cards Grid

- 4 columns on desktop (`grid-cols-4`), 2 columns on tablet (`md:grid-cols-2`), 1 column on mobile
- Gap: `gap-4`
- Each card:
  - Background: `bg-bg-surface` (`#181818`), `rounded-xl`, `p-6`
  - Border: `border border-graphite` by default
  - **Hover state** (from `trust-section-hover.png`): bottom border changes to `border-b-accent` with `border-b-2`, rest of border stays `border-graphite`. Apply with `group-hover` or direct `hover:` on the card. Transition: `transition-all duration-300`
  - Icon container: `bg-accent/10 rounded-lg p-2 w-10 h-10 flex items-center justify-center mb-6`
  - Icon: Lucide component resolved from `icon` string, color `text-accent`, size `20`
  - Value: `font-heading text-5xl font-bold text-white mt-4`
  - Label: `font-body text-sm font-semibold text-white mt-2`
  - Description: `font-body text-sm text-silver mt-1`

### Badge Row (bottom)

- Horizontal flex row, centered, `gap-6 flex-wrap mt-12`
- Each badge: green bullet dot (`w-2 h-2 rounded-full bg-accent inline-block mr-2`) + `text-sm text-silver`

## GSAP Animations

- Use `ScrollTrigger` plugin — trigger when section enters viewport (`start: "top 80%"`)
- Animate header block (eyebrow, headline, subheadline) together: `y: 30` → `y: 0`, `opacity: 0` → `1`, `duration: 0.7`, `ease: "power3.out"`
- Animate stat cards with stagger: `y: 40` → `y: 0`, `opacity: 0` → `1`, `stagger: 0.1`, `duration: 0.6`, `ease: "power3.out"`, triggered slightly after header
- Animate badge row last: `y: 20` → `y: 0`, `opacity: 0` → `1`, `duration: 0.5`
- Use `gsap.context()` for cleanup on unmount
- Register `ScrollTrigger` plugin at the top of the file: `gsap.registerPlugin(ScrollTrigger)`

## References

- `@context/screenshots/trust-section.png` — default (non-hover) visual reference
- `@context/screenshots/trust-section-hover.png` — hover state reference (green bottom border on first card)
- `@context/complex-project-spec.md` — Trust / Stats Section, Design System
- `@src/app/globals.css` — CSS variables (`--color-accent`, `--color-bg-surface`, `glass`, etc.)
- `@sanity/schemas/homePage.ts` — add `trustSection` fields here
- `src/components/sections/TrustSection.tsx` — file to create
