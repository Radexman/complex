# Bottom CTA Section — Spec

## Overview

Build the `BottomCtaSection` component for the Complex home page. It is a fullscreen-height lead generation section with a background image (lighter overlay than the hero), centered copy with an accent word, two CTA buttons, reassurance bullet points, and a Leaflet map below showing the company's showroom location in Opole. Clicking the map pin opens a popup with a "Nawiguj" button that opens Google Maps directions in a new tab. All content managed via Sanity. All visible text in Polish.

## Sanity Schema

Add a `bottomCtaSection` object to the `homePage` document with the following fields:

- `backgroundImage` — image — fullscreen background photo
- `eyebrow` — string — small pill label above headline, default: "Bezpłatna konsultacja"
- `headline` — string — main headline text, default: "Zaprojektuj swoją przestrzeń na zewnątrz"
- `headlineAccent` — string — word or phrase within the headline rendered in `--color-accent`, default: "na zewnątrz"
- `subheadline` — string — supporting paragraph, default: "Przekształć swój dom dzięki pergoli zaprojektowanej na miarę — łączącej elegancję architektoniczną z precyzją wykonania. Odwiedź nasze biuro i obejrzyj próbniki materiałów na żywo."
- `primaryCtaLabel` — string — green button label, default: "Zobacz nasze realizacje"
- `primaryCtaHref` — string — default: `/realizacje`
- `secondaryCtaLabel` — string — dark button label, default: "Darmowa wycena"
- `secondaryCtaHref` — string — default: `/wycena/zadaszenie`
- `bullets` — array of strings — reassurance items shown below buttons, defaults:
  - "Bez zobowiązań"
  - "Odpowiedź w ciągu 24h"
  - "Bezpłatna wizyta na miejscu"
- `showroomLabel` — string — heading above the map, default: "Odwiedź nasze biuro i salon wystawowy"
- `showroomDescription` — string — short text below showroom heading, default: "Zapraszamy do obejrzenia próbników materiałów, gotowych rozwiązań i rozmowy z naszym doradcą."
- `showroomAddress` — string — display address shown in map popup, default: "Kępska 12, 46-020 Opole"

## Component Requirements

- File: `src/components/sections/BottomCtaSection.tsx`
- Section background: `bg-bg-deep`
- Apply `.section-padding` for vertical spacing
- Two visual sub-blocks stacked vertically: **CTA block** on top, **Showroom / Map block** below

---

### CTA Block

- Fullscreen-height sub-section (`min-h-screen`) with background image
- Background: `backgroundImage` from Sanity via `next/image` with `fill` and `object-cover`
- Dark overlay: `bg-black/40` — noticeably lighter than the hero overlay (`/60`), so the background image reads through more clearly
- Content: centered column, `max-w-3xl mx-auto text-center`, vertically centered

#### Eyebrow Pill

- Small rounded pill: `inline-flex items-center gap-2 bg-bg-surface border border-graphite rounded-full px-4 py-1.5 text-sm text-silver mb-6`
- Green dot: `w-2 h-2 rounded-full bg-accent` to the left of the text

#### Headline

- `font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight`
- The `headlineAccent` substring is wrapped in a `<span className="text-accent">` — same pattern as HeroSection
- Split and render the accent substring the same way as in `HeroSection.tsx` for consistency

#### Subheadline

- `font-body text-lg text-silver max-w-2xl mx-auto mt-6`

#### CTA Buttons

- Horizontal flex row, `gap-4 justify-center mt-10 flex-wrap`
- Primary (green): `bg-accent text-black font-semibold rounded-lg px-8 py-4 text-base hover:bg-accent-hover transition-colors` + arrow icon `→` on right, links to `primaryCtaHref`
- Secondary (dark): `bg-bg-surface text-white font-semibold rounded-lg px-8 py-4 text-base border border-graphite hover:border-accent hover:text-accent transition-colors`, links to `secondaryCtaHref`

#### Bullet Row

- `flex gap-6 justify-center flex-wrap mt-8`
- Each bullet: green dot (`w-2 h-2 rounded-full bg-accent`) + `text-sm text-silver`

---

### Showroom / Map Block

- Background: `bg-bg-mid`, `py-20`
- Two-column layout on desktop (`grid grid-cols-2 gap-16 items-center max-w-6xl mx-auto px-6`), single column stacked on mobile
- Left column: text content
- Right column: Leaflet map

#### Left Column (text)

- Label: `text-accent text-xs font-semibold tracking-widest uppercase mb-3` — "Showroom"
- Heading: `font-heading text-3xl font-bold text-white` — `showroomLabel` from Sanity
- Description: `font-body text-base text-silver mt-4` — `showroomDescription` from Sanity
- Address line: `font-body text-sm text-white mt-4 flex items-center gap-2` — `MapPin` Lucide icon (color `text-accent`, size 16) + `showroomAddress`

#### Right Column (Leaflet Map)

- Install `leaflet` and `react-leaflet` if not present
- Map container: `rounded-xl overflow-hidden h-80 w-full border border-graphite`
- Center coordinates: `[50.6751, 17.9213]` (Kępska 12, Opole) — hardcoded, not from Sanity
- Zoom level: `15`
- Tile layer: OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`)
- Marker at `[50.6751, 17.9213]` with a custom green marker icon (use a simple `divIcon` with a green filled circle styled with `bg-accent`)
- On marker click, open a Leaflet `Popup` containing:
  - Address text: `"Kępska 12, 46-020 Opole"` in `font-body text-sm text-white font-semibold`
  - "Nawiguj" button: `bg-accent text-black text-sm font-semibold rounded-md px-4 py-2 mt-2 block text-center cursor-pointer`
  - Clicking "Nawiguj" opens this URL in a new tab: `https://www.google.com/maps/dir/?api=1&destination=K%C4%99pska+12%2C+46-020+Opole`
- Leaflet is SSR-incompatible — wrap the map in a dynamic import with `ssr: false`:
  ```ts
  const ShowroomMap = dynamic(() => import('@/components/ShowroomMap'), { ssr: false })
  ```
- Create `src/components/ShowroomMap.tsx` as the extracted client-only map component
- Import Leaflet CSS in `ShowroomMap.tsx`: `import 'leaflet/dist/leaflet.css'`
- Fix the default Leaflet marker icon broken image issue by manually setting `L.Icon.Default.mergeOptions` with the correct CDN paths for `iconUrl`, `iconRetinaUrl`, and `shadowUrl`

---

## GSAP Animations

- Register `ScrollTrigger` at top of file
- Animate CTA block content (eyebrow, headline, subheadline, buttons, bullets) as a staggered upward reveal on scroll entry: `y: 40` → `y: 0`, `opacity: 0` → `1`, `stagger: 0.12`, `duration: 0.8`, `ease: "power3.out"`
- Animate showroom left column text on scroll: `y: 30` → `y: 0`, `opacity: 0` → `1`, `duration: 0.7`
- Animate map container: `opacity: 0` → `1`, `duration: 0.8`, slight `x: 20` → `x: 0` slide from right
- Use `gsap.context()` for cleanup on unmount

## References

- `@context/screenshots/bottom-cta.png` — visual reference
- `@context/complex-project-spec.md` — Lead Generation CTA Banner section, Design System
- `@src/app/globals.css` — CSS variables and utility classes
- `@src/components/sections/HeroSection.tsx` — reference for headlineAccent split pattern
- `@sanity/schemas/homePage.ts` — add `bottomCtaSection` fields here
- `src/components/sections/BottomCtaSection.tsx` — file to create
- `src/components/ShowroomMap.tsx` — SSR-safe Leaflet map, file to create
