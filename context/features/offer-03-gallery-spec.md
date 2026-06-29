# Offer Pages — Part 3 of 7: Bento Gallery Section

## Overview

This spec covers the `OfferGallery` component — the third section on every offer page. It displays a curated bento grid of project photos pulled from the shared Sanity `project` document pool, filtered by the `category` field of the current `service` document. Clicking any photo opens the shared `ProjectLightbox` component. No new Sanity fields are needed — the gallery is driven entirely by the existing `project` schema and the `service.category` field established in spec 1. All visible text in Polish.

---

## Sanity

No new schema fields. The gallery fetches all `project` documents where `category` matches `service.category`.

GROQ query to run on the page level (add to the existing `oferta/[slug]/page.tsx` query or as a secondary fetch):

```groq
*[_type == "project" && category == $category] | order(_createdAt desc) {
  _id,
  title,
  city,
  category,
  coverImage
}
```

Pass `$category` as the `service.category` value from the already-fetched service document. Pass the resulting `galleryProjects` array as a prop to `OfferPage` and down to `OfferGallery`.

---

## Component Requirements

- File: `src/components/offer/OfferGallery.tsx`
- Props: `projects[]` — array of project documents filtered by category, `categoryLabel` — Polish display name of the category (derived from the `category` value using the same label map as in `ProjectsGrid`)
- Background: `bg-bg-deep` (`#0B0B0C`)
- Apply `.section-padding`
- If `projects` array is empty, render nothing (`return null`) — section is hidden when no matching projects exist yet

---

### Header Block (left-aligned)

- Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase mb-3` — hardcoded: "Nasze realizacje"
- Headline: `font-heading text-4xl md:text-5xl font-bold text-white`
- Content: `"Galeria — {categoryLabel}"` where `categoryLabel` is the Polish name of the current offer, e.g. "Galeria — Zadaszenia aluminiowe"
- No subheadline in this section

---

### Bento Grid Layout

The grid uses CSS Grid with named template areas to create a visually varied, asymmetric layout. The pattern repeats every 6 items. If more than 6 projects exist, the remaining items fall into a standard uniform `grid-cols-3` overflow row below the bento block.

#### Bento pattern (first 6 items):

```
[ A: large landscape ] [ B: portrait  ] [ C: portrait  ]
[ D: portrait        ] [ E: portrait  ] [ F: large land ]
```

Implement using CSS Grid:

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 12px;
}

/* Item A — large landscape, spans 2 columns */
.bento-item:nth-child(1) {
  grid-column: span 2;
  aspect-ratio: 16/9;
}

/* Item B — portrait */
.bento-item:nth-child(2) {
  aspect-ratio: 3/4;
}

/* Item C — portrait */
.bento-item:nth-child(3) {
  aspect-ratio: 3/4;
}

/* Item D — portrait */
.bento-item:nth-child(4) {
  aspect-ratio: 3/4;
}

/* Item E — portrait */
.bento-item:nth-child(5) {
  aspect-ratio: 3/4;
}

/* Item F — large landscape, spans 2 columns */
.bento-item:nth-child(6) {
  grid-column: span 2;
  aspect-ratio: 16/9;
}
```

Use Tailwind utility classes where possible. For the `grid-column: span 2` and aspect ratio overrides, use Tailwind's `col-span-2`, `aspect-video` (16/9), and `aspect-[3/4]`. Apply conditionally based on item index:

```tsx
const getBentoClass = (index: number) => {
  const position = index % 6
  if (position === 0 || position === 5) return 'col-span-2 aspect-video'
  return 'col-span-1 aspect-[3/4]'
}
```

#### Overflow items (7th project onwards):

- Rendered below the bento block in a separate `grid grid-cols-3 gap-3 mt-3` uniform grid
- Each item: `aspect-[4/3] rounded-xl overflow-hidden`

---

### Each Bento Cell

- `rounded-xl overflow-hidden relative cursor-pointer group`
- Background image: `next/image` with `fill` and `object-cover`
- Gradient overlay: `absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300` — overlay only appears on hover
- On hover: scale image subtly `group-hover:scale-[1.03] transition-transform duration-500` on the `next/image` wrapper div
- **City label**: `absolute bottom-3 left-3 font-heading text-base font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300` — appears on hover only, same as lightbox location display

---

### Lightbox

- On cell click, open `ProjectLightbox` component (`src/components/ui/ProjectLightbox.tsx`) — reuse exactly as established in `FeaturedProjectsSection.tsx` and `ProjectsGrid.tsx`
- Pass `coverImage`, `title`, `city` to the lightbox
- No changes to `ProjectLightbox` needed

---

### Mobile Behaviour

- Below `md` breakpoint: collapse bento grid to a standard 2-column uniform grid
- `grid-cols-2 gap-3`, all items `aspect-[4/3]`, no `col-span-2` overrides
- Overflow items join the same 2-column grid

---

## GSAP Animations

- Register `ScrollTrigger`
- Animate header block on scroll entry (`start: "top 85%"`): `y: 30` → `y: 0`, `opacity: 0` → `1`, `duration: 0.7`, `ease: "power3.out"`
- Animate bento cells with stagger on scroll entry: `y: 50` → `y: 0`, `opacity: 0` → `1`, `stagger: 0.06`, `duration: 0.7`, `ease: "power3.out"`
- Each cell animates independently — do not group by row
- Use `gsap.context()` for cleanup

---

## References

- `@context/complex-project-spec.md` — Realizacje section, Sanity Schemas, Design System
- `@src/components/sections/FeaturedProjectsSection.tsx` — reference for card markup and lightbox usage
- `@src/components/sections/ProjectsGrid.tsx` — reference for category label map
- `@src/components/ui/ProjectLightbox.tsx` — reuse existing lightbox component
- `@sanity/schemas/project.ts` — existing schema, no changes needed
- `@src/app/oferta/[slug]/page.tsx` — add secondary GROQ query for gallery projects
- `@src/components/offer/OfferPage.tsx` — add `<OfferGallery />` as third child, pass `galleryProjects` and `categoryLabel`
- `@src/app/globals.css` — CSS variables and utility classes
- `src/components/offer/OfferGallery.tsx` — file to create
