# Navbar — Spec

## Overview

Build the `Navbar` component for the Complex website. It sits fixed at the top of every page, starts fully transparent over the hero, and transitions to a blurred dark background on scroll. Navigation links match the project structure defined in the project spec — not the placeholder links visible in the screenshot reference. Logo and CTA button text are managed via Sanity. If Ark UI provides a suitable navigation or menu primitive, use it as the headless base.

## Sanity Schema

Add a `navbar` object to the `siteSettings` document with the following fields:

- `logo` — object:
  - `text` — string — brand name displayed next to the icon, default: "Complex"
  - `iconLetter` — string — single letter shown in the green icon square, default: "C"
  - `href` — string — logo link target, default: `/`
- `ctaButton` — object:
  - `label` — string — button label, default: "Darmowa wycena"
  - `href` — string — button link target, default: `/wycena/zadaszenie`

## Component Requirements

- File: `src/components/layout/Navbar.tsx`
- Position: `fixed top-0 left-0 w-full z-50`
- Background: transparent by default, transitions to `bg-bg-mid/80` with `backdrop-blur-md` on scroll (add scroll listener, apply class when `scrollY > 50`)
- Transition: `transition-all duration-300` on background and backdrop-filter
- Height: `h-16` (64px)
- Layout: horizontal flex row — logo on the left, nav links centered, right-side actions on the right

### Logo (left)

- Green square icon (`bg-accent`, rounded `rounded-md`, `w-8 h-8`) containing `iconLetter` in black, bold
- Brand `text` next to it in white, `font-heading`, `font-bold`
- Entire logo is a `<Link>` to `logo.href`

### Navigation Links (center)

All links in Polish, in this exact order:

1. **Strona główna** — `/`
2. **Oferta** — dropdown trigger (chevron icon), contains:
   - Zadaszenia aluminiowe — `/oferta/zadaszenia-aluminiowe`
   - Żaluzje tarasowe — `/oferta/zaluzje-tarasowe`
   - Tarasy kompozytowe — `/oferta/tarasy-kompozytowe`
   - Tarasy z płyt gresowych — `/oferta/tarasy-gresowe`
   - Tarasy drewniane — `/oferta/tarasy-drewniane`
   - Elewacje kompozytowe — `/oferta/elewacje-kompozytowe`
   - Schody modułowe — `/oferta/schody-modulowe`
3. **Realizacje** — `/realizacje`
4. **O nas** — `/o-nas`
5. **Kierownik budowy** — `/kierownik-budowy`
6. **Kontakt** — `/kontakt`

- Link style: `text-sm text-silver hover:text-white transition-colors duration-200`
- Active link: `text-white`
- Use Next.js `<Link>` for all links

### Oferta Dropdown

- If Ark UI has a `Menu` or `Popover` primitive, use it as the headless base for the dropdown
- Dropdown panel: `glass` utility class, `rounded-lg`, `py-2`, `min-w-56`
- Each item: `text-sm text-silver hover:text-white hover:bg-bg-surface px-4 py-2 block transition-colors`
- Chevron icon rotates 180° when dropdown is open (`transition-transform duration-200`)
- Closes on outside click and on link navigation

### Right Side Actions

- **"Formularze wycen"** — text link (`text-sm text-silver hover:text-white`), dropdown with:
  - Formularz Wyceny Tarasu — `/wycena/taras`
  - Formularz Wyceny Zadaszenia — `/wycena/zadaszenie`
  - Formularz Wyceny Żaluzji — `/wycena/zaluzje`
  - Formularz Wyceny Schodów — `/wycena/schody`
- **CTA Button** — solid green (`bg-accent text-black font-semibold rounded-md px-4 py-2 text-sm hover:bg-accent-hover transition-colors`), label and href from Sanity `ctaButton`

### Mobile (below `lg` breakpoint)

- Hide center nav links and right actions
- Show hamburger icon button on the right
- Clicking hamburger opens a full-height slide-in drawer from the left or right:
  - Background: `bg-bg-mid`
  - All nav links listed vertically, same order as desktop
  - Oferta and Formularze wycen expand as accordions (use Ark UI `Accordion` if available)
  - CTA button at the bottom of the drawer
  - Close button or overlay click to dismiss
- If Ark UI has a `Drawer` or `Dialog` primitive, use it for the mobile menu

## References

- `@context/screenshots/navbar.png` — visual reference for layout and style
- `@context/complex-project-spec.md` — Pages & Structure, Navigation Structure, Design System
- `@src/app/globals.css` — CSS variables and utility classes (`glass`, `--color-accent`, etc.)
- `@sanity/schemas/siteSettings.ts` — add `navbar` fields here
- `src/components/layout/Navbar.tsx` — file to create
