# Featured Projects Section — Spec

## Overview

Build the `FeaturedProjectsSection` component for the Complex home page. It displays a filterable grid of completed project photos organized by service category. Clicking a category tab filters the visible cards. Clicking a card opens the image in a fullscreen lightbox. All content is managed via Sanity. All visible text must be in Polish. Use the Ark UI `Tabs` component as the headless base for the filter tabs.

## Sanity Schema

### `project` document (add or extend if it already exists)

Each project is a standalone Sanity document with the following fields:

- `title` — string — project name, e.g. "Nowoczesny taras z zadaszenem"
- `city` — string — city name only, no street or full address, e.g. "Katowice" — this is the only location info shown on cards
- `category` — string — must be one of the allowed values below, rendered as a `select` dropdown in Sanity Studio using `options.list`
- `coverImage` — image — main photo shown in the grid card and lightbox
- `isFeatured` — boolean — if true, this project appears in the home page featured section

### Allowed Category Values (`options.list`)

These match the company's offer structure exactly:

| Value                     | Polish Label            |
| ------------------------- | ----------------------- |
| `"zadaszenia-aluminiowe"` | Zadaszenia aluminiowe   |
| `"zaluzje-tarasowe"`      | Żaluzje tarasowe        |
| `"tarasy-kompozytowe"`    | Tarasy kompozytowe      |
| `"tarasy-gresowe"`        | Tarasy z płyt gresowych |
| `"tarasy-drewniane"`      | Tarasy drewniane        |
| `"elewacje-kompozytowe"`  | Elewacje kompozytowe    |
| `"schody-modulowe"`       | Schody modułowe         |

### `featuredProjectsSection` object (add to `homePage` document)

- `eyebrow` — string — default: "Nasze realizacje"
- `headline` — string — default: "Wybrane projekty"
- `subheadline` — string — default: "Poznaj nasze realizacje — tarasy, zadaszenia i schody modułowe wykonane z dbałością o każdy detal."

### Seed Initial Values (in Polish)

Create 6 sample `project` documents in the Sanity Studio initial values or as fixture data, one per major category, all with `isFeatured: true`:

| Title                                     | City        | Category                |
| ----------------------------------------- | ----------- | ----------------------- |
| Taras kompozytowy z zadaszenem            | Katowice    | `tarasy-kompozytowe`    |
| Zadaszenie aluminiowe — dom jednorodzinny | Gliwice     | `zadaszenia-aluminiowe` |
| Taras gresowy z oświetleniem              | Opole       | `tarasy-gresowe`        |
| Żaluzje tarasowe — apartament             | Wrocław     | `zaluzje-tarasowe`      |
| Elewacja kompozytowa                      | Rybnik      | `elewacje-kompozytowe`  |
| Schody modułowe — nowoczesna willa        | Częstochowa | `schody-modulowe`       |

## Component Requirements

- File: `src/components/sections/FeaturedProjectsSection.tsx`
- Section background: `bg-bg-deep` (`#0B0B0C`)
- Apply `.section-padding` utility class for vertical spacing
- Data: fetch all `project` documents where `isFeatured == true` from Sanity using GROQ

### Header Block (left-aligned)

- Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase`
- Headline: `font-heading text-4xl md:text-5xl font-bold text-white mt-2`
- Subheadline: `font-body text-base text-silver mt-3 max-w-xl`
- No "See all" button or link

### Category Tabs (Ark UI `Tabs`)

- Use Ark UI `Tabs` component (`Tabs.Root`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`) as the headless base
- First tab is always "Wszystkie" (value: `"all"`) and is active by default
- Remaining tabs are generated dynamically from the unique categories present in the fetched `isFeatured` projects — only show a tab if at least one project with that category exists
- Tab trigger style (default): `text-sm font-medium text-silver bg-bg-surface border border-graphite rounded-full px-4 py-2 cursor-pointer transition-all duration-200 hover:text-white`
- Tab trigger style (active / selected): `bg-accent text-black border-accent`
- Tab list: horizontal flex row, `gap-2 flex-wrap`, `mt-8`
- No `Tabs.Content` panels needed — tab selection drives a React state filter on the card grid instead of swapping content panels. Set `activationMode="manual"` on `Tabs.Root`

### Project Card Grid

- Single `3-column` grid below the tabs (`grid-cols-3`, `md:grid-cols-2`, `sm:grid-cols-1`), `gap-4`, `mt-6`
- Cards are filtered by the active tab value. When "Wszystkie" is active, all `isFeatured` projects are shown
- Each card:
  - Aspect ratio: `aspect-[4/3]`, `rounded-xl overflow-hidden relative cursor-pointer`
  - Background image: `next/image` with `fill` and `object-cover`
  - Dark gradient overlay at the bottom: `absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent`
  - **Category badge**: top-left corner, `absolute top-3 left-3`, `text-accent text-xs font-semibold tracking-widest uppercase` — displays the Polish label for the project's category
  - **City name**: bottom-left, `absolute bottom-3 left-3`, `font-heading text-lg font-bold text-white` — displays `city` field only, no street or region
  - Hover state: slight scale `hover:scale-[1.02]` on the image, `transition-transform duration-300`

### Lightbox

- On card click, open a fullscreen lightbox overlay
- Lightbox: fixed full-screen `div`, `z-50`, `bg-black/90 backdrop-blur-md`, centered
- Displays the `coverImage` at large size (`max-w-4xl max-h-[85vh] object-contain`)
- Shows `title` and `city` below the image in white
- Close button: top-right `X` icon, `text-white hover:text-accent`
- Close on overlay click or `Escape` key
- If Ark UI has a `Dialog` primitive, use it as the headless base for the lightbox
- Trap focus inside lightbox when open

## GSAP Animations

- Register `ScrollTrigger` at the top of the file
- Animate header block on scroll entry (`start: "top 80%"`): `y: 30` → `y: 0`, `opacity: 0` → `1`, `duration: 0.7`, `ease: "power3.out"`
- Animate tab list: `y: 20` → `y: 0`, `opacity: 0` → `1`, `duration: 0.5`, triggered after header
- Animate cards with stagger: `y: 40` → `y: 0`, `opacity: 0` → `1`, `stagger: 0.08`, `duration: 0.6`, `ease: "power3.out"`
- Re-run card animation when active tab changes (re-trigger on filtered set)
- Use `gsap.context()` for cleanup on unmount

## References

- `@context/screenshots/featured.png` — visual reference
- `@context/complex-project-spec.md` — Realizacje section, Pages & Structure, Sanity Schemas
- `@src/app/globals.css` — CSS variables and utility classes
- `@sanity/schemas/project.ts` — create or extend this schema
- `@sanity/schemas/homePage.ts` — add `featuredProjectsSection` fields here
- `src/components/sections/FeaturedProjectsSection.tsx` — file to create
- `screenshots/featured.png` - design reference
