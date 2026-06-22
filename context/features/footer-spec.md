# Footer — Spec

## Overview

Build the `Footer` component for the Complex website. It sits at the bottom of every page and contains the company logo, a short tagline, social media icon links, four columns of navigation links matching the site structure, contact details, and a bottom bar with copyright and legal links. All content is managed via Sanity `siteSettings`. All visible text in Polish.

## Sanity Schema

Add a `footer` object to the `siteSettings` document with the following fields:

- `logo` — object — reuse or reference the same `navbar.logo` object (same `text`, `iconLetter`, `href` fields) so both logo instances are managed from one place. If Sanity does not support cross-field references within the same document easily, duplicate the fields under `footer.logo`
- `tagline` — string — short description below the logo, default: "Aluminiowe zadaszenia i nowoczesne przestrzenie zewnętrzne. Wykonane z precyzją dla wymagających klientów."
- `socialLinks` — array of objects, each with:
  - `platform` — string — must be one of the allowed values below, rendered as `select` dropdown using `options.list`
  - `href` — url — link to the profile page
- `contactName` — string — company legal name, default: "Complex sp. z o.o."
- `contactAddress` — string — full address, default: "Kępska 12, 46-020 Opole"
- `contactPhone` — string — default: "+48 000 000 000"
- `contactEmail` — string — default: "biuro@complex.pl"
- `copyrightText` — string — bottom bar left text, default: "© 2026 Complex sp. z o.o. Wszelkie prawa zastrzeżone."

### Allowed Social Platform Values (`options.list`)

Map these string values to Lucide React icons in the component:

| Value         | Lucide Icon                           |
| ------------- | ------------------------------------- |
| `"instagram"` | `Instagram`                           |
| `"facebook"`  | `Facebook`                            |
| `"linkedin"`  | `Linkedin`                            |
| `"youtube"`   | `Youtube`                             |
| `"x"`         | `Twitter`                             |
| `"tiktok"`    | `Music` (closest available in Lucide) |

Render each as a square icon button: `w-10 h-10 rounded-lg bg-bg-surface border border-graphite flex items-center justify-center text-silver hover:text-accent hover:border-accent transition-all duration-200`.

---

## Component Requirements

- File: `src/components/layout/Footer.tsx`
- Background: `bg-bg-deep` (`#0B0B0C`)
- Top divider: `border-t border-graphite`
- Bottom bar divider: `border-t border-graphite`
- Max width container: `max-w-7xl mx-auto px-6`

### Main Footer Grid

- `pt-16 pb-12`
- 5-column grid on desktop: `grid grid-cols-5 gap-12`
  - Column 1 (wider): logo + tagline + social icons — `col-span-1`
  - Columns 2–5: nav link groups — one column each
- On tablet (`md`): `grid-cols-2`
- On mobile: `grid-cols-1` stacked

---

### Column 1 — Brand

- Logo: same markup as `Navbar` — green square icon (`bg-accent rounded-md w-8 h-8`) with `iconLetter` in black bold, brand `text` in white `font-heading font-bold` next to it, wrapped in a `<Link>` to `logo.href`
- Tagline: `font-body text-sm text-silver mt-4 max-w-xs leading-relaxed`
- Social icons row: `flex gap-2 mt-6 flex-wrap` — each rendered as described above, `href` opens in `target="_blank" rel="noopener noreferrer"`

---

### Column 2 — Oferta

Heading: `font-heading text-sm font-semibold text-white mb-4`
Links (all in Polish, `text-sm text-silver hover:text-white transition-colors`):

- Zadaszenia aluminiowe — `/oferta/zadaszenia-aluminiowe`
- Żaluzje tarasowe — `/oferta/zaluzje-tarasowe`
- Tarasy kompozytowe — `/oferta/tarasy-kompozytowe`
- Tarasy z płyt gresowych — `/oferta/tarasy-gresowe`
- Tarasy drewniane — `/oferta/tarasy-drewniane`
- Elewacje kompozytowe — `/oferta/elewacje-kompozytowe`
- Schody modułowe — `/oferta/schody-modulowe`

---

### Column 3 — Firma

Heading: `font-heading text-sm font-semibold text-white mb-4`
Links:

- O nas — `/o-nas`
- Realizacje — `/realizacje`
- Kierownik budowy — `/kierownik-budowy`
- Kontakt — `/kontakt`

---

### Column 4 — Narzędzia

Heading: `font-heading text-sm font-semibold text-white mb-4`
Links:

- Formularz wyceny tarasu — `/wycena/taras`
- Formularz wyceny zadaszenia — `/wycena/zadaszenie`
- Formularz wyceny żaluzji — `/wycena/zaluzje`
- Formularz wyceny schodów — `/wycena/schody`

---

### Column 5 — Kontakt

Heading: `font-heading text-sm font-semibold text-white mb-4`
Content (not links, just text blocks — `font-body text-sm text-silver leading-relaxed`):

- Company name: `contactName` — render in white (`text-white font-medium`)
- Address: `contactAddress` — with `MapPin` Lucide icon (size 14, `text-accent`) inline before the text
- Phone: `contactPhone` — with `Phone` Lucide icon (size 14, `text-accent`) inline, wrapped in `<a href="tel:...">` with `hover:text-white transition-colors`
- Email: `contactEmail` — with `Mail` Lucide icon (size 14, `text-accent`) inline, wrapped in `<a href="mailto:...">` with `hover:text-white transition-colors`
- Each contact item: `flex items-start gap-2 mt-3`

---

### Bottom Bar

- `py-6 flex flex-col md:flex-row items-center justify-between gap-4`
- Left: `copyrightText` — `font-body text-xs text-silver`
- Right: three legal text links, `text-xs text-silver hover:text-white transition-colors gap-6 flex`:
  - Polityka prywatności — `/polityka-prywatnosci`
  - Regulamin — `/regulamin`
  - Polityka cookies — `/polityka-cookies`

---

## References

- `@context/screenshots/footer.png` — visual reference
- `@context/complex-project-spec.md` — Pages & Structure, Navigation Structure, Design System
- `@src/app/globals.css` — CSS variables and utility classes
- `@sanity/schemas/siteSettings.ts` — add `footer` fields here
- `@src/components/layout/Navbar.tsx` — reference for logo markup to keep consistent
- `src/components/layout/Footer.tsx` — file to create
