# Offer Index Page — Spec

## Overview

Build the `/oferta` page — a catch-all overview of all services the company offers. Displays all 7 offer categories as a bento grid of clickable cards, each linking to its respective `/oferta/[slug]` subpage. Content is driven by the existing `service` Sanity documents established in `offer-01-hero-spec.md` — no new schema needed. The bento layout follows the same pattern as `OfferGallery` (spec 3) but adapted for service cards rather than project photos. All visible text in Polish.

---

## File Structure

```
src/
  app/
    oferta/
      page.tsx                        ← SSR page
  components/
    offer/
      OfferIndexGrid.tsx              ← bento grid of service cards
```

---

## Page Requirements

- File: `src/app/oferta/page.tsx`
- `async` Server Component, `revalidate: 60`
- Metadata:
  - `title`: "Oferta — Complex"
  - `description`: "Poznaj pełną ofertę Complex — zadaszenia aluminiowe, tarasy kompozytowe, żaluzje tarasowe, elewacje i schody modułowe na terenie Śląska i Opolszczyzny."
- GROQ query — fetch all `service` documents, ordered by a manual `order` field (add `order` — `number` field to `service` schema if not present, used only for display ordering in Studio):

```groq
*[_type == "service"] | order(order asc) {
  _id,
  title,
  slug,
  heroImage,
  heroSubheadline,
  category,
  relatedFormSlug
}
```

- Passes results to `<OfferIndexGrid services={services} />`

---

## Sanity Schema — minor addition

Add one field to the existing `service` document in `sanity/schemas/service.ts`:

- `order` — number — controls display order in the bento grid. Set Studio `initialValue` to match the order below. Editor can reorder services by changing this number.

Seed order values:
| order | service |
|---|---|
| 1 | Zadaszenia aluminiowe |
| 2 | Tarasy kompozytowe |
| 3 | Żaluzje tarasowe |
| 4 | Tarasy z płyt gresowych |
| 5 | Tarasy drewniane |
| 6 | Elewacje kompozytowe |
| 7 | Schody modułowe |

---

## Page Hero

Simple page hero — same pattern as `/realizacje`, quotation pages, and `/kontakt`:

- Background: `bg-bg-mid`, `py-20 border-b border-graphite`
- Layout: two-column `grid grid-cols-2 gap-12 items-end max-w-7xl mx-auto px-6`, stacked on mobile
- **Left**:
  - Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase mb-3` — "Co oferujemy"
  - Headline: `font-heading text-6xl md:text-7xl font-bold text-white leading-none` — "Oferta"
- **Right**:
  - `border-t border-accent/30 pt-6`
  - Body: `font-body text-base text-silver leading-relaxed` — "Specjalizujemy się w kompleksowej realizacji przestrzeni zewnętrznych. Wybierz kategorię, która Cię interesuje, aby poznać szczegóły i zobaczyć nasze realizacje."
- GSAP: on mount, left `x: -30 → 0`, right `x: 30 → 0`, `opacity: 0 → 1`, `duration: 0.8`, `ease: power3.out` — identical to `AboutHero` and `ContactHero`

---

## Component — `OfferIndexGrid.tsx`

- File: `src/components/offer/OfferIndexGrid.tsx`
- Props: `services[]`
- Background: `bg-bg-deep`
- Apply `.section-padding`
- `max-w-7xl mx-auto px-6`

### Bento Grid Layout

Uses the same CSS Grid + index-based sizing pattern as `OfferGallery` (`offer-03-gallery-spec.md`), adapted for 7 items:

```tsx
const getBentoClass = (index: number): string => {
  // Pattern for 7 items:
  // [0] large landscape — col-span-2, row 1
  // [1] portrait — col-span-1, row 1
  // [2] portrait — col-span-1, row 2
  // [3] large landscape — col-span-2, row 2
  // [4] portrait — col-span-1, row 3
  // [5] portrait — col-span-1, row 3
  // [6] full width — col-span-3, row 3 (accent finale)
  const map: Record<number, string> = {
    0: 'col-span-2 aspect-[16/7]',
    1: 'col-span-1 aspect-[3/4]',
    2: 'col-span-1 aspect-[3/4]',
    3: 'col-span-2 aspect-[16/7]',
    4: 'col-span-1 aspect-[4/3]',
    5: 'col-span-1 aspect-[4/3]',
    6: 'col-span-3 aspect-[21/6]',
  }
  return map[index] ?? 'col-span-1 aspect-[4/3]'
}
```

Grid container: `grid grid-cols-3 gap-3 mt-12`

Item 6 (index 6 — Schody modułowe) spans full width as a cinematic wide banner — a strong visual finale to the grid that also makes the odd 7th item look intentional rather than orphaned.

### Each Service Card

- `relative overflow-hidden rounded-xl cursor-pointer group` + bento class
- Entire card is a Next.js `<Link href={/oferta/${service.slug.current}}>` wrapping all content
- **Background image**: `service.heroImage` via `next/image` with `fill` and `object-cover`
- **Gradient overlay**: `absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent`
  - On hover: gradient deepens slightly via `group-hover:from-black/90 transition-all duration-500`
- **Image scale on hover**: apply `group-hover:scale-[1.04] transition-transform duration-700` to the `next/image` wrapper div — slightly slower than gallery cards for a more cinematic feel
- **Content overlay** (pinned bottom-left): `absolute bottom-0 left-0 right-0 p-6`
  - Category badge: `inline-block text-accent text-xs font-semibold tracking-widest uppercase mb-2`— derived from `service.category` using the same Polish label map as `ProjectsGrid` and `FeaturedProjectsSection`
  - Service title: `font-heading text-white font-bold leading-tight`
    - Size varies by bento position:
      - `col-span-3` (index 6): `text-4xl md:text-5xl`
      - `col-span-2` (index 0, 3): `text-2xl md:text-3xl`
      - `col-span-1` (index 1, 2, 4, 5): `text-xl`
  - Subheadline: `font-body text-sm text-white/70 mt-1 leading-snug`
    - Only rendered on `col-span-2` and `col-span-3` cards — too small to fit on portrait cards
    - Content from `service.heroSubheadline`, truncated to 1 line with `line-clamp-1`
  - CTA hint: `flex items-center gap-1 text-accent text-xs font-semibold mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300` — "Dowiedz się więcej" + `ArrowRight` Lucide icon size 14
    - Only on `col-span-2` and `col-span-3` cards
  - Quotation form badge (conditional): if `service.relatedFormSlug` is not null, render a small pill in the top-right corner:
    - `absolute top-3 right-3 bg-accent/90 text-black text-xs font-semibold rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300` — "Formularz wyceny →"
    - Links to `/wycena/[relatedFormSlug]` — use `e.stopPropagation()` on the pill click to prevent the card link from also firing. Wrap pill in its own `<Link>` inside the card `<Link>` using `onClick={e => e.stopPropagation()}`

### Mobile Behaviour

- Below `md`: collapse to a standard `grid-cols-1` stack, all cards `aspect-[16/9]`, no bento sizing
- Below `sm`: same, but `aspect-[4/3]` for more vertical space per card
- Subheadline visible on all cards on mobile (space is no longer constrained)

---

## GSAP Animations

- Register `ScrollTrigger`
- Page hero: on mount `x: ±30 → 0`, `opacity: 0 → 1`, `duration: 0.8` (same as other heroes)
- Grid cards: scroll-triggered, `start: "top 85%"`, stagger reveal: `y: 50 → 0`, `opacity: 0 → 1`, `stagger: 0.07`, `duration: 0.7`, `ease: power3.out`
- Cards animate in reading order (left to right, top to bottom) which naturally follows the DOM order
- Use `gsap.context()` for cleanup

---

## References

- `@context/complex-project-spec.md` — Offer Pages section, Design System, Pages & Structure
- `@src/components/offer/OfferGallery.tsx` — reference for `getBentoClass` pattern and bento grid CSS
- `@src/components/sections/FeaturedProjectsSection.tsx` — reference for category label map (reuse from shared utility if extracted)
- `@src/components/sections/ProjectsGrid.tsx` — reference for category label map
- `@sanity/schemas/service.ts` — add `order` field
- `@src/app/globals.css` — CSS variables and utility classes
- `src/app/oferta/page.tsx` — file to create
- `src/components/offer/OfferIndexGrid.tsx` — file to create
