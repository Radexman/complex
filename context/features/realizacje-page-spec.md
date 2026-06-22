# Realizacje Page — Spec

## Overview

Build the `/realizacje` page and its `ProjectsGrid` component. Projects are fetched from the same shared Sanity `project` document pool used by `FeaturedProjectsSection` on the home page — there is one source of truth in Sanity Studio. On this page all projects are shown (not filtered by `isFeatured`). Filtering is by category only. Clicking a card opens the same fullscreen lightbox already implemented in `FeaturedProjectsSection.tsx`. No star ratings. All visible text in Polish.

## Sanity

No new schema needed. This page queries the existing `project` document with all existing fields:

- `title`
- `city`
- `category`
- `coverImage`
- `isFeatured` (exists but is ignored on this page — all projects are shown regardless)

If the `project` schema does not yet have a `surface` field (m²), add it now:

- `surface` — number — optional, area in m², e.g. `42` — displayed on cards as "42 m²"

GROQ query for this page — fetch all projects ordered by `_createdAt` descending:

```groq
*[_type == "project"] | order(_createdAt desc) {
  _id,
  title,
  city,
  category,
  surface,
  coverImage
}
```

## Page Requirements

- File: `src/app/realizacje/page.tsx`
- Page is SSR (`async` Server Component), fetches all projects from Sanity at request time with `revalidate: 60`
- Passes project data as props to the client component `ProjectsGrid`
- Page metadata (via Next.js `generateMetadata`):
  - `title`: "Realizacje — Complex"
  - `description`: "Przeglądaj nasze zrealizowane projekty tarasów, zadaszeń, żaluzji i schodów modułowych na terenie Śląska i Opolszczyzny."

## Component Requirements

- File: `src/components/sections/ProjectsGrid.tsx`
- `"use client"` directive — handles filter state and lightbox state
- Receives `projects` array as props from the page Server Component
- Background: `bg-bg-deep`
- Apply `.section-padding`

### Page Header (centered)

- Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase` — "Nasze portfolio"
- Headline: `font-heading text-5xl md:text-6xl font-bold text-white mt-2` — "Realizacje"
- Subheadline: `font-body text-base text-silver text-center max-w-2xl mx-auto mt-4` — "Przeglądaj nasze projekty tarasów, zadaszeń, żaluzji i schodów modułowych. Każda realizacja to indywidualne podejście i dbałość o każdy detal."

### Category Filter Tabs (Ark UI `Tabs`)

- Use the same Ark UI `Tabs` pattern as in `FeaturedProjectsSection.tsx` — same component API, same styling
- `activationMode="manual"`, tab selection drives a React state filter on the grid
- Tab list: `flex gap-2 flex-wrap justify-center mt-10`
- Tabs in this exact order:
  1. Wszystkie — value: `"all"` — active by default
  2. Zadaszenia aluminiowe — value: `"zadaszenia-aluminiowe"`
  3. Żaluzje tarasowe — value: `"zaluzje-tarasowe"`
  4. Tarasy kompozytowe — value: `"tarasy-kompozytowe"`
  5. Tarasy z płyt gresowych — value: `"tarasy-gresowe"`
  6. Tarasy drewniane — value: `"tarasy-drewniane"`
  7. Elewacje kompozytowe — value: `"elewacje-kompozytowe"`
  8. Schody modułowe — value: `"schody-modulowe"`
- All tabs are always rendered regardless of whether projects with that category exist — unlike the home page section which generates tabs dynamically
- Tab trigger styles: identical to `FeaturedProjectsSection.tsx` — reuse the same Tailwind classes

### Results Count

- Below the tab row: `text-sm text-silver text-center mt-4`
- Text: "Wyświetlono {n} realizacji" where `{n}` is the count of currently filtered projects

### Project Card Grid

- `grid grid-cols-3 gap-4 mt-8` — same 3-column layout as the home page featured section
- Responsive: `md:grid-cols-2 sm:grid-cols-1`
- Each card — same structure as in `FeaturedProjectsSection.tsx`:
  - `aspect-[4/3] rounded-xl overflow-hidden relative cursor-pointer`
  - `next/image` with `fill` and `object-cover`
  - Gradient overlay: `absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent`
  - **Category badge**: `absolute top-3 left-3 text-accent text-xs font-semibold tracking-widest uppercase` — Polish label for the category
  - **Bottom info row**: `absolute bottom-3 left-3 right-3 flex items-end justify-between`
    - Left: city name — `font-heading text-lg font-bold text-white`
    - Right: surface area if available — `text-sm text-silver` — rendered as "42 m²", omitted if `surface` is null
  - No star rating badge
  - Hover: `hover:scale-[1.02] transition-transform duration-300` on the image

### Lightbox

- Reuse the exact same lightbox implementation from `FeaturedProjectsSection.tsx`
- Extract the lightbox into a shared component `src/components/ui/ProjectLightbox.tsx` if not already done, and import it in both `FeaturedProjectsSection.tsx` and `ProjectsGrid.tsx`
- On open: show `coverImage` fullscreen, display `title` and `city` below the image
- Close on overlay click or `Escape` key
- Use Ark UI `Dialog` as the headless base

## GSAP Animations

- Register `ScrollTrigger` at top of file
- Animate page header on mount (not scroll — it's above the fold): `y: 30` → `y: 0`, `opacity: 0` → `1`, `stagger: 0.12`, `duration: 0.7`, `ease: "power3.out"`
- Animate cards on initial render and on every filter change: `y: 40` → `y: 0`, `opacity: 0` → `1`, `stagger: 0.07`, `duration: 0.5`, `ease: "power3.out"`
- Use `gsap.context()` for cleanup

## References

- `@context/screenshots/projects-subpage.png` — visual reference
- `@context/complex-project-spec.md` — Realizacje section, Sanity Schemas
- `@src/components/sections/FeaturedProjectsSection.tsx` — reuse lightbox, card markup, and Tabs pattern
- `@sanity/schemas/project.ts` — add `surface` field if missing
- `@src/app/globals.css` — CSS variables and utility classes
- `src/app/realizacje/page.tsx` — file to create
- `src/components/sections/ProjectsGrid.tsx` — file to create
- `src/components/ui/ProjectLightbox.tsx` — extract from FeaturedProjectsSection if not already a standalone component
