# Offer Pages — Part 7 of 7: Contact Section

## Overview

This spec covers the `OfferContact` component — the seventh and final section on every offer page. It is a premium contact block present on all 7 offer pages, including Elewacje kompozytowe which has no quotation form. For pages with a form CTA (spec 6), this section acts as a softer secondary touchpoint — a personal, human closing. For Elewacje kompozytowe it is the primary conversion point. It displays direct contact details, a showroom callout, and a map pin. Content is pulled from `siteSettings` — not per-service — so the client manages it in one place. All visible text in Polish.

---

## Sanity Schema

No new `service` fields needed. This component reads from the existing `siteSettings.footer` fields established in `footer-spec.md`:

- `siteSettings.footer.contactName`
- `siteSettings.footer.contactPhone`
- `siteSettings.footer.contactEmail`
- `siteSettings.footer.contactAddress`

Additionally, add the following fields to `siteSettings` (at the root level, not inside `footer`) if not already present:

- `showroomHeading` — string — default: "Odwiedź nasz salon wystawowy"
- `showroomDescription` — string — default: "Zapraszamy do naszego salonu w Opolu, gdzie możesz obejrzeć próbniki materiałów, gotowe rozwiązania i porozmawiać z naszym doradcą."
- `showroomOpeningHours` — string — default: "Pon–Pt: 8:00–16:00"

---

## Component Requirements

- File: `src/components/offer/OfferContact.tsx`
- Props: `contactName`, `contactPhone`, `contactEmail`, `contactAddress`, `showroomHeading`, `showroomDescription`, `showroomOpeningHours`
- Fetch `siteSettings` data in `src/app/oferta/[slug]/page.tsx` alongside the service query and pass relevant fields to `OfferPage` → `OfferContact`
- Background: `bg-bg-deep` (`#0B0B0C`)
- Apply `.section-padding`

---

### Top accent bar

- Same gradient line as in `OfferFormCta`: `h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent mb-16`
- Creates visual continuity between this section and the one above it

---

### Header Block (centered)

- Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase mb-3` — hardcoded: "Skontaktuj się"
- Headline: `font-heading text-4xl md:text-5xl font-bold text-white text-center`
- Hardcoded: "Porozmawiajmy o Twoim projekcie"
- Subheadline: `font-body text-base text-silver text-center max-w-xl mx-auto mt-4`
- Hardcoded: "Chętnie odpowiemy na wszystkie pytania, doradzimy w wyborze rozwiązania i umówimy bezpłatną wizytę pomiarową."

---

### Three-column content grid

- `grid grid-cols-3 gap-6 mt-14 max-w-5xl mx-auto` on desktop
- `md:grid-cols-1` on mobile, stacked
- Each column is a `glass` card: `rounded-xl p-8 border border-graphite flex flex-col`

#### Column 1 — Direct Contact

- Icon at top: `Phone` Lucide, `w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-5`, icon `text-accent` size `20`
- Card title: `font-heading text-lg font-semibold text-white mb-4` — "Zadzwoń lub napisz"
- Phone number: `<a href="tel:[contactPhone]">` — `font-heading text-2xl font-bold text-accent hover:text-accent-hover transition-colors`
- Email: `<a href="mailto:[contactEmail]">` — `font-body text-sm text-silver hover:text-white transition-colors mt-2 block`
- Opening hours note: `font-body text-xs text-silver mt-4` — from `showroomOpeningHours`
- Bottom of card: pinned with `mt-auto pt-6`, a secondary ghost link: `text-sm text-accent hover:text-accent-hover flex items-center gap-1` — "Napisz wiadomość →" linking to `/kontakt`

#### Column 2 — Showroom

- Icon at top: `MapPin` Lucide, same container style as column 1
- Card title: `font-heading text-lg font-semibold text-white mb-4` — from `showroomHeading`
- Description: `font-body text-sm text-silver leading-relaxed` — from `showroomDescription`
- Address: `font-body text-sm text-white font-medium mt-3` — from `contactAddress`
- Opening hours: `font-body text-xs text-silver mt-2` — from `showroomOpeningHours`
- Bottom: ghost link "Otwórz w Mapach →" — `href="https://www.google.com/maps/dir/?api=1&destination=K%C4%99pska+12%2C+46-020+Opole"`, `target="_blank" rel="noopener noreferrer"`, same style as column 1 secondary link

#### Column 3 — Quick Quote

- Icon at top: `FileText` Lucide, same container style
- Card title: `font-heading text-lg font-semibold text-white mb-4` — "Szybka wycena online"
- Description: `font-body text-sm text-silver leading-relaxed` — "Wypełnij krótki formularz wyceny — odpiszemy w ciągu 24 godzin z propozycją i terminem wizyty."
- Bullet list `mt-4 flex flex-col gap-2`:
  - "Bez zobowiązań"
  - "Odpowiedź w ciągu 24h"
  - "Bezpłatna wizyta pomiarowa"
  - Each: `flex items-center gap-2 text-sm text-silver`, green dot `w-1.5 h-1.5 rounded-full bg-accent`
- Bottom: primary green button `mt-auto pt-6`: `bg-accent text-black font-semibold rounded-lg px-6 py-3 text-sm hover:bg-accent-hover transition-colors inline-flex items-center gap-2 w-full justify-center`
  - Label: "Formularz wyceny" + `ArrowRight` icon
  - If `relatedFormSlug` is not null: links to `/wycena/[relatedFormSlug]`
  - If `relatedFormSlug` is null (Elewacje kompozytowe): links to `/kontakt`
  - Pass `relatedFormSlug` as a prop to `OfferContact` from `OfferPage`

---

### Embedded Map (below the three columns)

- Reuse `ShowroomMap` component from `src/components/ShowroomMap.tsx` — already built in `bottom-cta-spec.md`
- Import with `dynamic(() => import('@/components/ShowroomMap'), { ssr: false })`
- Container: `mt-10 rounded-xl overflow-hidden border border-graphite h-72 max-w-5xl mx-auto`
- Same marker, same popup, same "Nawiguj" button behaviour as in `BottomCtaSection`
- No duplicate implementation needed — reuse exactly

---

## GSAP Animations

- Register `ScrollTrigger`
- Animate header block on scroll entry (`start: "top 85%"`): `y: 30` → `y: 0`, `opacity: 0` → `1`, `stagger: 0.1`, `duration: 0.7`, `ease: "power3.out"`
- Animate three cards with stagger: `y: 40` → `y: 0`, `opacity: 0` → `1`, `stagger: 0.12`, `duration: 0.6`, `ease: "power3.out"`
- Animate map container: `opacity: 0` → `1`, `duration: 0.8`, `delay: 0.3` after cards
- Use `gsap.context()` for cleanup

---

## Final Composition Check — `OfferPage.tsx`

Once all 7 specs are implemented, `OfferPage.tsx` should render the following in order:

```tsx
<OfferHero />           {/* spec 1 */}
<OfferBenefits />       {/* spec 2 */}
<OfferGallery />        {/* spec 3 — returns null if no projects */}
<OfferBrands />         {/* spec 4 — returns null if no brands */}
<OfferTechSpecs />      {/* spec 5 — returns null if no specs */}
{relatedFormSlug && <OfferFormCta />}  {/* spec 6 — conditional */}
<OfferContact />        {/* spec 7 — always rendered */}
```

Verify this order is correct in `OfferPage.tsx` after implementing this spec.

---

## References

- `@context/complex-project-spec.md` — Kontakt section, Design System
- `@src/components/sections/BottomCtaSection.tsx` — reference for showroom map and gradient accent bar pattern
- `@src/components/ShowroomMap.tsx` — reuse existing SSR-safe Leaflet map, do not recreate
- `@src/components/offer/OfferFormCta.tsx` — reference for gradient accent bar and eyebrow pill style
- `@sanity/schemas/siteSettings.ts` — add `showroomHeading`, `showroomDescription`, `showroomOpeningHours` fields
- `@src/components/offer/OfferPage.tsx` — add `<OfferContact />` as seventh and final child, pass `relatedFormSlug`
- `@src/app/oferta/[slug]/page.tsx` — add `siteSettings` fetch alongside service query
- `@src/app/globals.css` — CSS variables and utility classes (`glass`, CSS vars)
- `src/components/offer/OfferContact.tsx` — file to create
