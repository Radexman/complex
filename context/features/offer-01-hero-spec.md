# Offer Pages — Part 1 of 7: Boilerplate & Hero Section

## Overview & Architecture

This is spec 1 of 7 for the offer subpage system. Each of the 7 offer pages lives at `/oferta/[slug]` and is generated as a dynamic Next.js route from a shared `service` Sanity document. All 7 pages share the same component structure and layout — they differ only in content fetched from Sanity. This spec establishes the page boilerplate, the dynamic route, the Sanity `service` schema foundation, and the hero section component. Specs 2–7 each cover one additional section that is composed into every offer page.

All visible text in Polish. All content editable from Sanity Studio.

---

## Offer Pages & Their Slugs

The following 7 offer pages must exist. Each is a `service` document in Sanity with a unique slug:

| Polish Name | Slug | Related Form |
|---|---|---|
| Zadaszenia aluminiowe | `zadaszenia-aluminiowe` | `/wycena/zadaszenie` |
| Żaluzje tarasowe | `zaluzje-tarasowe` | `/wycena/zaluzje` |
| Tarasy kompozytowe | `tarasy-kompozytowe` | `/wycena/taras` |
| Tarasy z płyt gresowych | `tarasy-gresowe` | `/wycena/taras` |
| Tarasy drewniane | `tarasy-drewniane` | `/wycena/taras` |
| Schody modułowe | `schody-modulowe` | `/wycena/schody` |
| Elewacje kompozytowe | `elewacje-kompozytowe` | `null` — no form, contact section only |

---

## Sanity Schema — `service` Document

Create `sanity/schemas/service.ts`. This document powers all 7 offer pages. Each section spec (2–7) will add its own fields to this schema — this spec defines the foundation fields only.

```ts
// Fields defined in this spec (part 1):
name: 'service',
type: 'document',
fields: [
  title,         // string — Polish page title, e.g. "Zadaszenia aluminiowe"
  slug,          // slug — generated from title, used in /oferta/[slug] route
  seoDescription,// text — meta description for this page
  heroImage,     // image — main fullscreen hero photo
  heroHeadline,  // string — hero headline
  heroSubheadline, // text — one or two sentences below headline
  relatedFormSlug, // string — one of: 'zadaszenie' | 'zaluzje' | 'taras' | 'schody' | null
                 //   rendered as options.list dropdown in Studio
  category,      // string — must match one of the 7 category values from project schema
                 //   used to pull matching projects from the shared pool
]
// Fields added in specs 2–7 will be appended to this schema file
```

### `relatedFormSlug` allowed values (`options.list`):

| Value | Label |
|---|---|
| `"zadaszenie"` | Formularz Wyceny Zadaszenia |
| `"zaluzje"` | Formularz Wyceny Żaluzji |
| `"taras"` | Formularz Wyceny Tarasu |
| `"schody"` | Formularz Wyceny Schodów |
| `null` | Brak formularza |

### `category` allowed values (`options.list`):

Must match the category values in the `project` schema exactly so gallery filtering works:

| Value | Label |
|---|---|
| `"zadaszenia-aluminiowe"` | Zadaszenia aluminiowe |
| `"zaluzje-tarasowe"` | Żaluzje tarasowe |
| `"tarasy-kompozytowe"` | Tarasy kompozytowe |
| `"tarasy-gresowe"` | Tarasy z płyt gresowych |
| `"tarasy-drewniane"` | Tarasy drewniane |
| `"elewacje-kompozytowe"` | Elewacje kompozytowe |
| `"schody-modulowe"` | Schody modułowe |

---

## Dynamic Route — Page Boilerplate

- File: `src/app/oferta/[slug]/page.tsx`
- `generateStaticParams`: fetch all `service` slugs from Sanity and return them for static generation at build time
- `generateMetadata`: use `service.title` and `service.seoDescription` to set `title` and `description` per page
- Page is an `async` Server Component with `revalidate: 60`
- GROQ query fetches one `service` document by slug — include all fields. As new fields are added in specs 2–7, extend this query accordingly
- Page renders a single `<OfferPage />` client component wrapper that receives the full `service` object as props
- File: `src/components/offer/OfferPage.tsx` — this is the composition root that renders all section components in order:
  1. `<OfferHero />` ← this spec
  2. `<OfferBenefits />` ← spec 2
  3. `<OfferGallery />` ← spec 3
  4. `<OfferBrands />` ← spec 4
  5. `<OfferTechSpecs />` ← spec 5
  6. `<OfferFormCta />` ← spec 6 (only rendered if `relatedFormSlug` is not null)
  7. `<OfferContact />` ← spec 7

---

## Hero Section Component

- File: `src/components/offer/OfferHero.tsx`
- Props: `heroImage`, `heroHeadline`, `heroSubheadline`, `title`, `relatedFormSlug`

### Layout

- Full viewport height: `min-h-screen`
- Background: `heroImage` via `next/image` with `fill` and `object-cover`
- Overlay: `bg-black/50` — slightly lighter than the main hero (`/60`) so the product image reads clearly
- Content: left-aligned, vertically centered, `max-w-7xl mx-auto px-6`

### Breadcrumb

- Above the headline: `text-sm text-silver flex items-center gap-2`
- "Oferta" → `ChevronRight` icon → current page `title`
- "Oferta" is a `<Link href="/oferta">` (future offer index page), `title` is plain text in white
- Separator: `ChevronRight` Lucide icon, size 14, `text-graphite`

### Headline

- `font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mt-6`
- Content from `heroHeadline` Sanity field

### Subheadline

- `font-body text-lg text-silver max-w-xl mt-4`
- Content from `heroSubheadline` Sanity field

### CTA Button (conditional)

- Only rendered if `relatedFormSlug` is not null
- Single green primary button: `bg-accent text-black font-semibold rounded-lg px-8 py-4 text-base hover:bg-accent-hover transition-colors mt-8 inline-flex items-center gap-2`
- Label: "Bezpłatna wycena" + arrow icon `→`
- Links to `/wycena/[relatedFormSlug]`

### Scroll Indicator

- Animated bouncing chevron at the bottom center of the hero: `ChevronDown` Lucide icon, `text-white/50`, `animate-bounce`
- Positioned `absolute bottom-8 left-1/2 -translate-x-1/2`

## GSAP Animations

- On mount, staggered upward reveal for: breadcrumb, headline, subheadline, CTA button
- `y: 40` → `y: 0`, `opacity: 0` → `1`, `stagger: 0.12`, `duration: 0.8`, `ease: "power3.out"`
- Use `gsap.context()` for cleanup

## Seed Initial Content

Create 7 `service` documents in Sanity with the following hero field defaults. Remaining fields (added in specs 2–7) will be seeded in their respective specs.

| Slug | heroHeadline | heroSubheadline |
|---|---|---|
| `zadaszenia-aluminiowe` | "Zadaszenia aluminiowe — elegancja i ochrona przez cały rok" | "Nowoczesne zadaszenia tarasowe z aluminium. Projektujemy i montujemy na terenie Śląska i Opolszczyzny." |
| `zaluzje-tarasowe` | "Żaluzje tarasowe — komfort i prywatność na zewnątrz" | "Wysokiej jakości żaluzje zewnętrzne dopasowane do każdej architektury." |
| `tarasy-kompozytowe` | "Tarasy kompozytowe — trwałość i nowoczesny design" | "Deski kompozytowe odporne na warunki atmosferyczne. Estetyka drewna bez jego wad." |
| `tarasy-gresowe` | "Tarasy z płyt gresowych — premium pod stopami" | "Płyty gresowe 2 cm — wyjątkowa trwałość i elegancja dla wymagających." |
| `tarasy-drewniane` | "Tarasy drewniane — naturalne piękno przestrzeni" | "Klasyczne tarasy z drewna egzotycznego i krajowego. Ciepło natury w Twoim ogrodzie." |
| `elewacje-kompozytowe` | "Elewacje kompozytowe — nowoczesny wygląd budynku" | "Trwałe i estetyczne elewacje z desek kompozytowych. Odporność na warunki zewnętrzne." |
| `schody-modulowe` | "Schody modułowe — innowacyjne i szybkie w montażu" | "Funkcjonalne schody modułowe idealnie komponujące się z tarasem i nowoczesną architekturą." |

## References

- `@context/complex-project-spec.md` — Offer Pages section, Sanity Schemas, Design System
- `@context/screenshots/screencapture-ccomplex-pl-oferta-zadaszenia-aluminiowe-...png` — original page reference
- `@src/app/globals.css` — CSS variables and utility classes
- `@src/components/sections/HeroSection.tsx` — reference for hero pattern
- `@sanity/schemas/service.ts` — file to create
- `src/app/oferta/[slug]/page.tsx` — file to create
- `src/components/offer/OfferPage.tsx` — composition root, file to create
- `src/components/offer/OfferHero.tsx` — file to create
