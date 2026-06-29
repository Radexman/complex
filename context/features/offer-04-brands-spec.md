# Offer Pages — Part 4 of 7: Brands & Models Section

## Overview

This spec covers the `OfferBrands` component — the fourth section on every offer page. It presents available manufacturer brands and product models as a secondary reference for customers who want to research further. Since the client confirmed brand names are not a primary decision factor for their customers, this section is intentionally de-emphasized — rendered as a collapsed Ark UI `Accordion` list below the gallery. Each accordion item reveals a brief product description and optional spec highlights. The section is entirely optional — if no brands are added in Sanity for a given service, the section is hidden. All content managed via Sanity. All visible text in Polish.

---

## Sanity Schema — additions to `service` document

Append the following fields to `sanity/schemas/service.ts`:

- `brandsHeadline` — string — section headline, default: "Dostępne systemy i producenci"
- `brandsDescription` — string — one sentence below the headline, default: "Współpracujemy z renomowanymi producentami, dobierając systemy do indywidualnych potrzeb każdej realizacji."
- `brands` — array of objects (optional, can be empty), each with:
  - `name` — string — brand/model name, e.g. "Deponti — Noble"
  - `shortDescription` — string — one sentence shown in the collapsed trigger row, e.g. "Elegancki system aluminiowy z regulowanymi lamelami"
  - `fullDescription` — text — 2–4 sentences shown when accordion item is expanded
  - `image` — image — optional product/brand photo shown when expanded
  - `specs` — array of strings — optional short spec bullet points shown as a list when expanded, e.g. "Szerokość do 7 m", "Kolor RAL na zamówienie"

---

## Component Requirements

- File: `src/components/offer/OfferBrands.tsx`
- Props: `brandsHeadline`, `brandsDescription`, `brands[]`
- If `brands` array is empty or undefined, render nothing (`return null`)
- Background: `bg-bg-mid` (`#111111`)
- Apply `.section-padding`

### Header Block (left-aligned)

- Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase mb-3` — hardcoded: "Producenci i systemy"
- Headline: `font-heading text-4xl font-bold text-white`
- Description: `font-body text-base text-silver max-w-2xl mt-3`

### Accordion (Ark UI)

- Use Ark UI `Accordion` component (`Accordion.Root`, `Accordion.Item`, `Accordion.ItemTrigger`, `Accordion.ItemContent`)
- `Accordion.Root` props: `collapsible`, `multiple={false}` — only one item open at a time
- Container: `mt-10 flex flex-col gap-2 max-w-4xl`

#### Accordion Item Trigger (collapsed state)

- `w-full flex items-center justify-between px-6 py-5 bg-bg-surface rounded-xl border border-graphite cursor-pointer group transition-all duration-200`
- Hover: `hover:border-accent/40`
- When item is open: `border-accent/60 bg-bg-surface`
- Left side:
  - Brand `name`: `font-heading text-lg font-semibold text-white`
  - `shortDescription`: `font-body text-sm text-silver mt-0.5`
- Right side: `ChevronDown` Lucide icon, `text-silver group-hover:text-accent transition-colors`, rotates `180deg` when open via `data-state="open"` selector: `[data-state=open]:rotate-180 transition-transform duration-200`

#### Accordion Item Content (expanded state)

- Ark UI handles the expand/collapse animation — use `Accordion.ItemContent` with a wrapping `div` for padding
- Inner content: `px-6 pb-6 pt-2`
- Two-column layout on desktop if `image` is present: `grid grid-cols-2 gap-8 items-start`, single column if no image
- **Left column** (or full width if no image):
  - `fullDescription`: `font-body text-sm text-silver leading-relaxed`
  - If `specs` array is not empty, render below description:
    - Label: `font-heading text-xs font-semibold text-white uppercase tracking-wider mt-4 mb-2` — "Specyfikacja"
    - Spec items: `ul` with `li` items — each `flex items-center gap-2 text-sm text-silver` with a `w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0` dot bullet
- **Right column** (only if `image` is present):
  - `next/image` with `fill={false}`, `width={400}`, `height={280}`, `objectFit="cover"`, `className="rounded-lg w-full"`

---

## Seed Initial Content

Add the following brand data to the relevant `service` documents. Only services that have known manufacturer partnerships need this data — omit for services where brands are not relevant.

### Zadaszenia aluminiowe

- `brandsHeadline`: "Dostępne systemy zadaszeń"
- `brandsDescription`: "Realizujemy zadaszenia w oparciu o sprawdzone systemy renomowanych producentów europejskich."
- Brands:
  - Name: "Deponti — Noble" / Short: "Klasyczny system aluminiowy z szybą lub poliwęglanem" / Specs: "Szerokość do 6 m", "Wysięg do 4 m", "Szkło hartowane 6 mm lub poliwęglan", "Kolor RAL na zamówienie"
  - Name: "Deponti — Varasol" / Short: "Nowoczesne zadaszenie z regulowanymi lamelami" / Specs: "Szerokość do 8 m", "Lamele aluminiowe 80 mm", "Opcja oświetlenia LED", "Sterowanie ręczne lub elektryczne"
  - Name: "Merlot" / Short: "Kompaktowy system bioklimatyczny do małych tarasów" / Specs: "Szerokość do 4 m", "Montaż do ściany lub wolnostojący", "Odporność na wiatr do 120 km/h"
  - Name: "Pergole Ekonomiczne" / Short: "Praktyczne rozwiązanie w przystępnej cenie" / Specs: "Szerokość do 5 m", "Pokrycie poliwęglanowe", "Szybki montaż"

### Żaluzje tarasowe

- `brandsHeadline`: "Dostępne systemy żaluzji"
- `brandsDescription`: "Dobieramy systemy żaluzji zewnętrznych do architektury budynku i oczekiwań klienta."
- Brands:
  - Name: "Żaluzje zewnętrzne aluminiowe" / Short: "Trwałe lamele aluminiowe do każdego okna i drzwi" / Specs: "Lamele 80 mm lub 100 mm", "Kolor RAL na zamówienie", "Prowadnice linkowo-sznurkowe lub kasetonowe"
  - Name: "Żaluzje z napędem elektrycznym" / Short: "Komfortowe sterowanie pilotem lub aplikacją" / Specs: "Silnik 240V lub solarny", "Integracja z systemem smart home", "Timer i czujnik wiatru opcjonalnie"

### Tarasy kompozytowe

- `brandsHeadline`: "Dostępne systemy tarasów kompozytowych"
- `brandsDescription`: "Oferujemy deski kompozytowe wiodących producentów w szerokiej gamie kolorów i faktur."
- Brands:
  - Name: "Deski kompozytowe pełne" / Short: "Klasyczna deska bez otworów, maksymalna wytrzymałość" / Specs: "Grubość 25 mm", "Szerokość 145 mm", "Długość do 6 m", "Faktura drewna lub gładka"
  - Name: "Deski kompozytowe drążone" / Short: "Lżejsza konstrukcja, szybszy montaż" / Specs: "Grubość 22 mm", "Szerokość 140 mm", "Ukryty system montażu"

---

## GSAP Animations

- Register `ScrollTrigger`
- Animate header block on scroll entry (`start: "top 85%"`): `y: 30` → `y: 0`, `opacity: 0` → `1`, `duration: 0.7`, `ease: "power3.out"`
- Animate accordion items with stagger: `y: 20` → `y: 0`, `opacity: 0` → `1`, `stagger: 0.08`, `duration: 0.5`, `ease: "power3.out"`
- Do not animate the expand/collapse interaction — Ark UI handles that internally
- Use `gsap.context()` for cleanup

---

## References

- `@context/complex-project-spec.md` — Offer Pages, Design System
- `@context/screenshots/screencapture-ccomplex-pl-oferta-zadaszenia-aluminiowe-...png` — original brand/model section reference
- `@src/components/sections/TrustSection.tsx` — reference for card and border hover pattern
- `@sanity/schemas/service.ts` — append fields here
- `@src/components/offer/OfferPage.tsx` — add `<OfferBrands />` as fourth child
- `@src/app/globals.css` — CSS variables and utility classes
- `src/components/offer/OfferBrands.tsx` — file to create
