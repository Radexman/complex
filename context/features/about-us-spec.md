# About Us Page — Spec

## Overview

Build the `/o-nas` page. It tells the company's story with authority and warmth — positioned as a premium regional expert, not a generic contractor. The page is composed of 6 sections: a simple page hero, a split company story block, an animated values grid, the shared `ProcessTimeline` component (already built), a team section, and a closing CTA. All content managed via Sanity. All visible text in Polish. No new shared components needed — everything either reuses existing components or is self-contained to this page.

---

## File Structure

```
src/
  app/
    o-nas/
      page.tsx                        ← SSR page, fetches all data
  components/
    about/
      AboutHero.tsx                   ← simple page hero (not fullscreen)
      AboutStory.tsx                  ← split image + text company story
      AboutValues.tsx                 ← values icon grid
      AboutTeam.tsx                   ← team member cards
      AboutCta.tsx                    ← closing lead generation CTA
```

`ProcessTimeline` is imported from `src/components/sections/ProcessTimeline.tsx` — do not recreate it.

---

## Page Requirements

- File: `src/app/o-nas/page.tsx`
- `async` Server Component, `revalidate: 60`
- Metadata:
  - `title`: "O nas — Complex"
  - `description`: "Poznaj Complex sp. z o.o. — firmę z wieloletnim doświadczeniem w realizacji tarasów, zadaszeń i schodów modułowych na terenie Śląska i Opolszczyzny."
- Fetches from Sanity: `aboutPage` document + `siteSettings.processTimeline` + `teamMember` documents
- Renders in order:
  1. `<AboutHero />`
  2. `<AboutStory />`
  3. `<AboutValues />`
  4. `<ProcessTimeline />` ← shared, reused
  5. `<AboutTeam />`
  6. `<AboutCta />`

---

## Sanity Schema

### `aboutPage` document — create `sanity/schemas/aboutPage.ts`

```ts
name: 'aboutPage',
type: 'document',
// singleton — only one document of this type
fields: [
  // Hero
  heroHeadline,        // string
  heroSubheadline,     // text

  // Story section
  storyEyebrow,        // string
  storyHeadline,       // string
  storyBody,           // array (Portable Text) — rich text, 3-5 paragraphs
  storyImage,          // image — large photo of the team, workshop, or a finished project
  storyStats,          // array of objects: { value: string, label: string } — 3 items max

  // Values section
  valuesEyebrow,       // string
  valuesHeadline,      // string
  values,              // array of objects: { icon: string (options.list), title: string, description: string }

  // Team section
  teamEyebrow,         // string
  teamHeadline,        // string
  teamSubheadline,     // string
]
```

### `teamMember` document — create `sanity/schemas/teamMember.ts`

```ts
name: 'teamMember',
type: 'document',
fields: [
  name,          // string
  role,          // string — e.g. "Kierownik budowy"
  photo,         // image
  bio,           // text — 2–3 sentences
  order,         // number — controls display order in Studio
]
```

---

## Seed Initial Content

### `aboutPage` document

- `heroHeadline`: "O nas"
- `heroSubheadline`: "Firma Complex sp. z o.o. z siedzibą w Opolu — specjaliści w dziedzinie zadaszeń aluminiowych, tarasów i schodów modułowych."

- `storyEyebrow`: "Nasza historia"
- `storyHeadline`: "Budujemy przestrzenie, które zostają na lata"
- `storyBody` (Portable Text paragraphs):
  - "Complex sp. z o.o. to firma z ugruntowaną pozycją w budownictwie zewnętrznym na terenie województwa śląskiego i opolskiego. Specjalizujemy się w kompleksowym wykonaniu tarasów, zadaszeń aluminiowych, żaluzji tarasowych, elewacji kompozytowych oraz schodów modułowych."
  - "Każdą realizację traktujemy indywidualnie — doradzamy w wyborze materiałów, projektujemy rozwiązania dopasowane do architektury budynku i oczekiwań klienta, a następnie realizujemy montaż własną ekipą z wieloletnim doświadczeniem."
  - "Nasze standardy to profesjonalizm, jakość wykonania i niezawodność. Każda inwestycja objęta jest pisemną umową i gwarancją, a klienci mogą liczyć na pełne wsparcie — od pierwszego kontaktu po odbiór gotowej realizacji."
- `storyStats`:
  - { value: "1200+", label: "Zrealizowanych projektów" }
  - { value: "15", label: "Lat doświadczenia" }
  - { value: "Śląsk i Opolszczyzna", label: "Obszar działania" }

- `valuesEyebrow`: "Nasze wartości"
- `valuesHeadline`: "Co nas wyróżnia"
- `values`:
  - { icon: "shield", title: "Jakość wykonania", description: "Pracujemy wyłącznie ze sprawdzonymi materiałami od renomowanych producentów. Każda realizacja jest objęta gwarancją." }
  - { icon: "check", title: "Profesjonalizm", description: "Pisemne umowy, ustalony termin, transparentna wycena. Wiemy, że Twój czas i inwestycja są cenne." }
  - { icon: "users", title: "Indywidualne podejście", description: "Słuchamy potrzeb klienta i projektujemy rozwiązania szyte na miarę — nie gotowe szablony." }
  - { icon: "ruler", title: "Precyzja", description: "Każdy pomiar, każde cięcie, każdy montaż wykonujemy z dbałością o detal. Estetyka i funkcjonalność idą w parze." }
  - { icon: "map", title: "Lokalny ekspert", description: "Działamy na terenie Śląska i Opolszczyzny — znamy specyfikę regionu i jesteśmy blisko naszych klientów." }
  - { icon: "award", title: "Zaufanie klientów", description: "98% naszych klientów poleca nas znajomym. Budujemy relacje na długie lata, nie jednorazowe transakcje." }

- `teamEyebrow`: "Nasz zespół"
- `teamHeadline`: "Ludzie, którzy stoją za realizacjami"
- `teamSubheadline`: "Doświadczona ekipa, która od lat tworzy przestrzenie zewnętrzne w Śląsku i Opolszczyźnie."

### `teamMember` documents (seed 2 entries)

1. name: "Sebastian Kożuch" / role: "Właściciel / Kierownik budowy" / bio: "Inżynier z wieloletnim doświadczeniem w budownictwie. Odpowiada za nadzór techniczny i kierowanie budową. Specjalizuje się w zadaszenieach aluminiowych i konstrukcjach tarasowych." / order: 1
2. name: "Agnieszka Jaszczyk-Kożuch" / role: "Obsługa klienta i wyceny" / bio: "Odpowiada za kontakt z klientami, przygotowywanie wycen i koordynację realizacji. Dba o to, aby każdy klient czuł się zaopiekowany na każdym etapie współpracy." / order: 2

---

## Section 1 — `AboutHero.tsx`

- File: `src/components/about/AboutHero.tsx`
- Props: `heroHeadline`, `heroSubheadline`
- Same simple page hero pattern used on quotation pages — not fullscreen, not a background image
- Background: `bg-bg-mid`, `py-20 border-b border-graphite`
- Max width container: `max-w-7xl mx-auto px-6`
- Layout: two columns — `grid grid-cols-2 gap-12 items-end` on desktop, stacked on mobile
- **Left**: eyebrow + headline
  - Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase mb-3` — hardcoded: "Complex sp. z o.o."
  - Headline: `font-heading text-6xl md:text-7xl font-bold text-white leading-none` — from `heroHeadline`
- **Right**: subheadline + a thin decorative horizontal rule
  - `border-t border-accent/30 pt-6`
  - Subheadline: `font-body text-base text-silver leading-relaxed`
- GSAP: on mount, left col slides in from `x: -30`, right from `x: 30`, both `opacity: 0 → 1`, `duration: 0.8`, `ease: power3.out`

---

## Section 2 — `AboutStory.tsx`

- File: `src/components/about/AboutStory.tsx`
- Props: `storyEyebrow`, `storyHeadline`, `storyBody` (Portable Text), `storyImage`, `storyStats[]`
- Background: `bg-bg-deep`
- Apply `.section-padding`

### Layout

- Two columns: `grid grid-cols-2 gap-16 items-center max-w-7xl mx-auto px-6`
- **Left column**: image
- **Right column**: text content
- On mobile: image on top, text below

### Left — Image

- `next/image`, `width={600}`, `height={700}`, `objectFit="cover"`, `className="rounded-2xl w-full"`
- Subtle green border glow: `ring-1 ring-accent/20`
- Below the image: 3 stat items in a row (`flex gap-8 mt-8 pt-8 border-t border-graphite`)
  - Each: `value` in `font-heading text-3xl font-bold text-accent`, `label` in `font-body text-xs text-silver uppercase tracking-wider mt-1`

### Right — Text

- Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase mb-4`
- Headline: `font-heading text-4xl font-bold text-white mb-6`
- Body: rendered via `@portabletext/react` — paragraphs in `font-body text-base text-silver leading-relaxed space-y-4`

### GSAP

- Scroll-triggered, `start: "top 75%"`
- Left image: `x: -40 → 0`, `opacity: 0 → 1`, `duration: 0.9`, `ease: power3.out`
- Right text: `x: 40 → 0`, `opacity: 0 → 1`, `duration: 0.9`, same trigger, slight delay `0.1s`
- Stats: stagger `y: 20 → 0`, `opacity: 0 → 1`, `stagger: 0.1`, after text

---

## Section 3 — `AboutValues.tsx`

- File: `src/components/about/AboutValues.tsx`
- Props: `valuesEyebrow`, `valuesHeadline`, `values[]`
- Background: `bg-bg-mid`
- Apply `.section-padding`
- Reuses the **exact same icon lookup map** as `OfferBenefits.tsx` — import the map from there or from a shared `src/lib/iconMap.ts` utility if it has been extracted. Do not duplicate the map.

### Header (centered)

- Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase mb-3`
- Headline: `font-heading text-4xl md:text-5xl font-bold text-white text-center`

### Values Grid

- `grid grid-cols-3 gap-4 mt-12 max-w-5xl mx-auto` on desktop, `md:grid-cols-2`, `sm:grid-cols-1`
- Each value card: identical markup to `OfferBenefits` cards
  - `bg-bg-surface rounded-xl p-6 border border-graphite hover:border-accent/40 transition-colors duration-300`
  - Icon container: `w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4`
  - Icon: from lookup map, `text-accent`, size `20`
  - Title: `font-heading text-base font-semibold text-white mt-2`
  - Description: `font-body text-sm text-silver mt-1 leading-relaxed`

### GSAP

- Scroll-triggered: header `y: 30 → 0`, `opacity: 0 → 1`, `duration: 0.7`
- Cards stagger: `y: 40 → 0`, `opacity: 0 → 1`, `stagger: 0.07`, `duration: 0.6`

---

## Section 4 — `ProcessTimeline` (reused)

- Import directly from `src/components/sections/ProcessTimeline.tsx`
- No changes — same component used on home page and offer pages
- Data fetched from `siteSettings.processTimeline` in `page.tsx` alongside other queries
- Background alternates naturally: Values is `bg-bg-mid`, ProcessTimeline is `bg-bg-mid` — wrap it in a `bg-bg-deep` container on this page to create the alternating rhythm:

```tsx
<div className="bg-bg-deep">
  <ProcessTimeline {...processTimelineProps} />
</div>
```

---

## Section 5 — `AboutTeam.tsx`

- File: `src/components/about/AboutTeam.tsx`
- Props: `teamEyebrow`, `teamHeadline`, `teamSubheadline`, `teamMembers[]`
- Background: `bg-bg-mid`
- Apply `.section-padding`
- If `teamMembers` is empty, render nothing (`return null`)

### Header (centered)

- Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase mb-3`
- Headline: `font-heading text-4xl font-bold text-white text-center`
- Subheadline: `font-body text-base text-silver text-center max-w-xl mx-auto mt-4`

### Team Cards

- `grid grid-cols-2 gap-8 mt-14 max-w-3xl mx-auto` on desktop, `grid-cols-1` on mobile
- Intentionally narrow max-width — 2 members look better slightly centered than stretched across full width
- Each card: `glass` utility + `rounded-2xl p-8 border border-graphite flex flex-col items-center text-center`
  - Photo: `next/image`, `width={120}`, `height={120}`, `className="rounded-full object-cover ring-2 ring-accent/30 mb-5"`
  - Name: `font-heading text-xl font-bold text-white`
  - Role: `font-body text-sm text-accent font-medium mt-1`
  - Thin rule: `w-12 h-px bg-graphite mx-auto my-4`
  - Bio: `font-body text-sm text-silver leading-relaxed`
- If no photo is uploaded in Sanity: render a fallback initials avatar — `w-[120px] h-[120px] rounded-full bg-bg-surface border-2 border-graphite flex items-center justify-center font-heading text-2xl text-silver`

### GSAP

- Scroll-triggered header: `y: 30 → 0`, `opacity: 0 → 1`, `duration: 0.7`
- Cards: `y: 40 → 0`, `opacity: 0 → 1`, `stagger: 0.15`, `duration: 0.7`

---

## Section 6 — `AboutCta.tsx`

- File: `src/components/about/AboutCta.tsx`
- Background: `bg-bg-deep`
- `py-24`
- No Sanity fields — content is hardcoded since it's a standard closing CTA that won't need editing

### Layout

- `max-w-3xl mx-auto px-6 text-center`
- Top accent bar: `h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent mb-16` — same pattern as `OfferFormCta`
- Eyebrow pill: same glass pill style — "Zacznijmy współpracę"
- Headline: `font-heading text-4xl md:text-5xl font-bold text-white mt-6` — "Masz pytania lub chcesz poznać naszą ofertę?"
- Subheadline: `font-body text-lg text-silver mt-4 max-w-xl mx-auto` — "Skontaktuj się z nami — odpiszemy w ciągu 24 godzin i umówimy bezpłatną wizytę pomiarową."
- Two buttons: `flex gap-4 justify-center mt-10 flex-wrap`
  - Primary green: "Skontaktuj się" → `/kontakt`
  - Secondary ghost: "Formularz wyceny" → `/wycena/zadaszenie`
- Bottom accent bar: same gradient line
- Bottom accent bar: `h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent mt-16`

### GSAP

- Same staggered upward reveal as `OfferFormCta`: `y: 40 → 0`, `opacity: 0 → 1`, `stagger: 0.1`, `duration: 0.7`, scroll-triggered

---

## References

- `@context/complex-project-spec.md` — O nas section, Sanity Schemas, Design System
- `@src/components/sections/ProcessTimeline.tsx` — reuse directly, no changes
- `@src/components/sections/TrustSection.tsx` — reference for stats display pattern in story section
- `@src/components/offer/OfferBenefits.tsx` — reference for icon lookup map and card style (reuse map)
- `@src/components/offer/OfferFormCta.tsx` — reference for accent bar and eyebrow pill pattern
- `@src/app/globals.css` — CSS variables and utility classes (`glass`, `.section-padding`)
- `@sanity/schemas/` — create `aboutPage.ts` and `teamMember.ts` here
- `src/app/o-nas/page.tsx` — file to create
- `src/components/about/AboutHero.tsx` — file to create
- `src/components/about/AboutStory.tsx` — file to create
- `src/components/about/AboutValues.tsx` — file to create
- `src/components/about/AboutTeam.tsx` — file to create
- `src/components/about/AboutCta.tsx` — file to create
