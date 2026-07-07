# Process Timeline — Spec

## Overview

Build the `ProcessTimeline` component — a shared section showing the customer the full journey of working with Complex, from first inquiry to finished installation and warranty. It is a standalone, reusable component placed both on the home page and on every offer page (after `OfferBenefits`, before `OfferGallery` — see placement note below). Content is managed centrally in `siteSettings` since the process is identical regardless of which product the customer is interested in. The process reflects the company's actual 6-step workflow: zapytanie → wycena wstępna → wycena końcowa → umowa → montaż → gwarancja. Layout is a vertical timeline with numbered nodes connected by a line, animated step-by-step on scroll. All visible text in Polish.

---

## Sanity Schema

Add a `processTimeline` object to the `siteSettings` document with the following fields:

- `eyebrow` — string — default: "Jak to działa"
- `headline` — string — default: "Twoja droga do wymarzonego tarasu"
- `subheadline` — string — default: "Od pierwszego zapytania po gotową realizację objętą gwarancją — proces zaprojektowany tak, aby był prosty i przejrzysty na każdym etapie."
- `steps` — array of objects (exactly 6, matching the company's fixed workflow, built as an array so order can be adjusted in Studio if ever needed), each with:
  - `number` — string — display number, e.g. "01"
  - `icon` — string — icon identifier, `options.list` dropdown. Allowed values: `"mail"`, `"calculator"`, `"file-check"`, `"file-signature"`, `"hammer"`, `"shield-check"`
  - `title` — string — step title
  - `description` — text — editor-facing field to explain the step in further detail, 1–3 sentences

### Icon lookup map (new icons for this component)

| Value | Lucide Icon | Step |
|---|---|---|
| `"mail"` | `Mail` | Zapytanie |
| `"calculator"` | `Calculator` | Wycena wstępna |
| `"file-check"` | `FileCheck` | Wycena końcowa |
| `"file-signature"` | `FileSignature` | Umowa |
| `"hammer"` | `Hammer` | Montaż |
| `"shield-check"` | `ShieldCheck` | Gwarancja |

---

## Seed Initial Content

- `eyebrow`: "Jak to działa"
- `headline`: "Twoja droga do wymarzonego tarasu"
- `subheadline`: "Od pierwszego zapytania po gotową realizację objętą gwarancją — proces zaprojektowany tak, aby był prosty i przejrzysty na każdym etapie."

Steps:

1. `number`: "01" / `icon`: "mail" / `title`: "Zapytanie" / `description`: "Wysyłasz zapytanie poprzez formularz wyceny, e-mail lub telefonicznie. Opisujesz swoje potrzeby i wstępne oczekiwania dotyczące projektu."
2. `number`: "02" / `icon`: "calculator" / `title`: "Wycena wstępna" / `description`: "Na podstawie przesłanych informacji przygotowujemy orientacyjną wycenę, która pozwala oszacować koszt realizacji jeszcze przed wizją lokalną."
3. `number`: "03" / `icon`: "file-check" / `title`: "Wycena końcowa" / `description`: "Po bezpłatnej wizycie pomiarowej na miejscu inwestycji przygotowujemy szczegółową, ostateczną wycenę uwzględniającą wszystkie ustalenia."
4. `number`: "04" / `icon`: "file-signature" / `title`: "Umowa" / `description`: "Po akceptacji wyceny podpisujemy umowę z jasno określonym zakresem prac, materiałami, terminem realizacji i warunkami płatności."
5. `number`: "05" / `icon`: "hammer" / `title`: "Montaż" / `description`: "Nasza ekipa montażowa realizuje projekt zgodnie z umową i ustalonym harmonogramem, dbając o porządek i sprawny przebieg prac."
6. `number`: "06" / `icon`: "shield-check" / `title`: "Gwarancja" / `description`: "Po odbiorze prac przekazujemy gwarancję na montaż oraz materiały. Pozostajemy do dyspozycji w razie pytań lub potrzeby serwisu."

---

## Component Requirements

- File: `src/components/sections/ProcessTimeline.tsx`
- Props: `eyebrow`, `headline`, `subheadline`, `steps[]` — each step contains `number`, `icon`, `title`, `description`
- Background: `bg-bg-mid` (`#111111`)
- Apply `.section-padding`

### Header Block (centered)

- Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase mb-3`
- Headline: `font-heading text-4xl md:text-5xl font-bold text-white text-center`
- Subheadline: `font-body text-base text-silver text-center max-w-xl mx-auto mt-4`

### Timeline Layout

- Container: `max-w-3xl mx-auto mt-16 relative`
- Vertical connecting line: `absolute left-7 top-0 bottom-0 w-px bg-graphite` — runs the full height behind the numbered nodes
- A second overlay line on top of it represents scroll-driven progress: `absolute left-7 top-0 w-px bg-accent` with `height` animated from `0%` to `100%` via GSAP `ScrollTrigger` `scrub: true` as the user scrolls through the section — this gives a visual sense of progression through the journey
- Steps rendered as a vertical `flex flex-col gap-8` list — tighter than a 4-step layout would need, since there are 6 rows to fit without the section feeling like an excessive scroll

### Each Step Row

- `flex gap-6 relative items-start`
- **Node** (left side): `relative z-10 flex-shrink-0`
  - Circle: `w-12 h-12 rounded-full bg-bg-surface border-2 border-graphite flex items-center justify-center`
  - When step becomes active (scroll progress passes it): border changes to `border-accent`, background to `bg-accent/10` — controlled via GSAP/ScrollTrigger toggling a class, not hover-based
  - Icon inside circle: resolved from `icon` string via lookup map, size `18`, color `text-silver` default / `text-accent` when active
- **Content** (right side): `flex-1 pt-1`
  - Top row: `flex items-center gap-3 mb-1.5`
    - Number: `font-heading text-sm font-bold text-accent` — e.g. "01"
    - Title: `font-heading text-lg font-semibold text-white`
  - Description: `font-body text-sm text-silver leading-relaxed max-w-lg`

### Mobile Behaviour

- Same vertical layout works natively on mobile — no structural changes needed
- Reduce node size slightly: `w-10 h-10` below `sm` breakpoint, icon size `16`
- Reduce row gap to `gap-6` below `sm` breakpoint to keep the 6-step list compact on small screens

---

## GSAP Animations

- Register `ScrollTrigger`
- Animate header block on scroll entry (`start: "top 85%"`): `y: 30` → `y: 0`, `opacity: 0` → `1`, `duration: 0.7`, `ease: "power3.out"`
- **Progress line**: pin the timeline container and animate the accent overlay line's `height` from `0%` to `100%` using `scrub: true` tied to scroll position through the section (`start: "top 60%"`, `end: "bottom 60%"`)
- **Step reveal**: each step row fades and slides in independently as it enters the viewport: `x: -20` → `x: 0`, `opacity: 0` → `1`, `duration: 0.5`, `ease: "power3.out"`, `start: "top 85%"` per row (not staggered together — each triggers independently as user scrolls, slightly faster duration than a 4-step version to keep the 6-row sequence feeling brisk)
- **Active node state**: toggle `border-accent` / `bg-accent/10` / `text-accent` classes on each node via `ScrollTrigger.create()` with `onEnter` / `onLeaveBack` callbacks, tied to the same scroll positions as the progress line reaching that node
- Use `gsap.context()` for cleanup on unmount

---

## Placement

This component is rendered in two places:

### 1. Home page

- File: `src/app/page.tsx`
- Position: after `FeaturedProjectsSection`, before `BottomCtaSection`
- Fetch `processTimeline` data from `siteSettings` in the home page query

### 2. Offer pages

- File: `src/components/offer/OfferPage.tsx`
- Position: after `OfferBenefits` (spec 2), before `OfferGallery` (spec 3)
- Updated composition order:
  ```tsx
  <OfferHero />
  <OfferBenefits />
  <ProcessTimeline />      {/* shared component, new */}
  <OfferGallery />
  <OfferBrands />
  <OfferTechSpecs />
  {relatedFormSlug && <OfferFormCta />}
  <OfferContact />
  ```
- Fetch `processTimeline` from `siteSettings` in `src/app/oferta/[slug]/page.tsx` alongside the existing service and siteSettings queries, pass down to `OfferPage`

---

## References

- `@context/complex-project-spec.md` — Design System, Pages & Structure
- `@src/components/sections/TrustSection.tsx` — reference for icon lookup map pattern and header block style
- `@src/components/offer/OfferTechSpecs.tsx` — reference for extending shared icon maps
- `@sanity/schemas/siteSettings.ts` — add `processTimeline` fields here
- `@src/app/page.tsx` — add `<ProcessTimeline />` placement
- `@src/components/offer/OfferPage.tsx` — add `<ProcessTimeline />` placement
- `@src/app/oferta/[slug]/page.tsx` — extend siteSettings fetch
- `@src/app/globals.css` — CSS variables and utility classes
- `src/components/sections/ProcessTimeline.tsx` — file to create
