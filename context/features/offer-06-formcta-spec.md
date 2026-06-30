# Offer Pages — Part 6 of 7: Quotation Form CTA Section

## Overview

This spec covers the `OfferFormCta` component — the sixth section on every offer page. It is a strong, visually distinct lead generation banner that directs the customer to the relevant quotation form. It is conditionally rendered — only shown on offer pages where `relatedFormSlug` is not null (6 out of 7 pages). Elewacje kompozytowe skips this section entirely and goes straight to the contact section (spec 7). All content managed via Sanity. All visible text in Polish.

---

## Pages where this section renders

| Offer page | Form target |
|---|---|
| Zadaszenia aluminiowe | `/wycena/zadaszenie` |
| Żaluzje tarasowe | `/wycena/zaluzje` |
| Tarasy kompozytowe | `/wycena/taras` |
| Tarasy z płyt gresowych | `/wycena/taras` |
| Tarasy drewniane | `/wycena/taras` |
| Schody modułowe | `/wycena/schody` |
| Elewacje kompozytowe | ❌ not rendered |

Rendering condition in `OfferPage.tsx`:
```tsx
{service.relatedFormSlug && <OfferFormCta {...formCtaProps} />}
```

---

## Sanity Schema — additions to `service` document

Append the following fields to `sanity/schemas/service.ts`:

- `formCtaHeadline` — string — main headline, e.g. "Gotowy na bezpłatną wycenę?"
- `formCtaSubheadline` — string — supporting sentence, e.g. "Wypełnij formularz wyceny — odpiszemy w ciągu 24 godzin."
- `formCtaButtonLabel` — string — CTA button label, e.g. "Wypełnij formularz wyceny"
- `formCtaBullets` — array of strings — 3 short reassurance points shown below the button

Note: `relatedFormSlug` is already defined in the `service` schema from spec 1. The button href is derived from it: `/wycena/[relatedFormSlug]`. No separate href field is needed.

---

## Component Requirements

- File: `src/components/offer/OfferFormCta.tsx`
- Props: `formCtaHeadline`, `formCtaSubheadline`, `formCtaButtonLabel`, `formCtaBullets[]`, `relatedFormSlug`
- Background: `bg-bg-mid` (`#111111`)
- Full-width section, `py-24`

### Layout

- Max width container: `max-w-4xl mx-auto px-6 text-center`
- Everything centered

### Top accent bar

- Full-width `div` at the very top of the section: `h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent mb-16`
- Decorative horizontal line that fades from transparent to green and back — creates a visual separator that feels architectural rather than generic `<hr>`

### Eyebrow pill

- Same pill style as `BottomCtaSection`: `inline-flex items-center gap-2 bg-bg-surface border border-graphite rounded-full px-4 py-1.5 text-sm text-silver mb-6`
- Green dot: `w-2 h-2 rounded-full bg-accent`
- Hardcoded text: "Bezpłatna wycena"

### Headline

- `font-heading text-4xl md:text-5xl font-bold text-white leading-tight`
- Content from `formCtaHeadline`

### Subheadline

- `font-body text-lg text-silver max-w-xl mx-auto mt-4`
- Content from `formCtaSubheadline`

### CTA Button

- Single large green button: `bg-accent text-black font-semibold rounded-lg px-10 py-5 text-base hover:bg-accent-hover transition-colors mt-10 inline-flex items-center gap-3`
- Label from `formCtaButtonLabel` + `ArrowRight` Lucide icon, size `18`
- Links to `/wycena/[relatedFormSlug]` via Next.js `<Link>`

### Bullet row

- `flex gap-8 justify-center flex-wrap mt-6`
- Each bullet: `flex items-center gap-2 text-sm text-silver`
- Green dot: `w-2 h-2 rounded-full bg-accent flex-shrink-0`
- Content from `formCtaBullets` array

### Bottom accent bar

- Identical to top accent bar: `h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent mt-16`

---

## Seed Initial Content

### Zadaszenia aluminiowe

- `formCtaHeadline`: "Gotowy na bezpłatną wycenę zadaszenia?"
- `formCtaSubheadline`: "Wypełnij formularz — przyjedziemy, zmierzymy i przedstawimy szczegółową wycenę bez zobowiązań."
- `formCtaButtonLabel`: "Wypełnij formularz wyceny zadaszenia"
- `formCtaBullets`: "Bez zobowiązań", "Odpowiedź w ciągu 24h", "Bezpłatna wizyta pomiarowa"

### Żaluzje tarasowe

- `formCtaHeadline`: "Zamów bezpłatną wycenę żaluzji"
- `formCtaSubheadline`: "Wypełnij formularz — skontaktujemy się i umówimy bezpłatną wizytę pomiarową w Twoim domu."
- `formCtaButtonLabel`: "Wypełnij formularz wyceny żaluzji"
- `formCtaBullets`: "Bez zobowiązań", "Pomiar w Twoim domu", "Szybka realizacja"

### Tarasy kompozytowe

- `formCtaHeadline`: "Wyceń swój taras kompozytowy"
- `formCtaSubheadline`: "Podaj wymiary i wybrane materiały — przygotujemy szczegółową wycenę i doradzimy w wyborze systemu."
- `formCtaButtonLabel`: "Wypełnij formularz wyceny tarasu"
- `formCtaBullets`: "Bez zobowiązań", "Wycena w ciągu 24h", "Bezpłatna wizyta na miejscu"

### Tarasy z płyt gresowych

- `formCtaHeadline`: "Zapytaj o wycenę tarasu gresowego"
- `formCtaSubheadline`: "Wypełnij formularz — dobierzemy odpowiednie płyty i przygotujemy indywidualną wycenę montażu."
- `formCtaButtonLabel`: "Wypełnij formularz wyceny tarasu"
- `formCtaBullets`: "Bez zobowiązań", "Indywidualna wycena", "Bezpłatna konsultacja"

### Tarasy drewniane

- `formCtaHeadline`: "Zapytaj o wycenę tarasu drewnianego"
- `formCtaSubheadline`: "Powiedz nam o swoich oczekiwaniach — dobierzemy gatunek drewna i przygotujemy wycenę na miarę Twojego ogrodu."
- `formCtaButtonLabel`: "Wypełnij formularz wyceny tarasu"
- `formCtaBullets`: "Bez zobowiązań", "Bezpłatna wizyta pomiarowa", "Szeroki wybór gatunków drewna"

### Schody modułowe

- `formCtaHeadline`: "Wyceń schody modułowe do swojego tarasu"
- `formCtaSubheadline`: "Podaj liczbę stopni i różnicę poziomów — szybko przygotujemy wycenę i zaproponujemy optymalne rozwiązanie."
- `formCtaButtonLabel`: "Wypełnij formularz wyceny schodów"
- `formCtaBullets`: "Bez zobowiązań", "Szybka wycena", "Montaż w jeden dzień"

---

## GSAP Animations

- Register `ScrollTrigger`
- Animate entire content block as one group on scroll entry (`start: "top 80%"`):
  - Staggered upward reveal: eyebrow pill, headline, subheadline, button, bullet row
  - `y: 40` → `y: 0`, `opacity: 0` → `1`, `stagger: 0.1`, `duration: 0.7`, `ease: "power3.out"`
- Top and bottom accent bars animate separately: `opacity: 0` → `1`, `scaleX: 0` → `scaleX: 1`, `duration: 0.8`, `transformOrigin: "center"`, triggered at same scroll point
- Use `gsap.context()` for cleanup

---

## References

- `@context/complex-project-spec.md` — Lead Generation CTA Banner, Design System
- `@src/components/sections/BottomCtaSection.tsx` — reference for pill eyebrow and bullet row pattern
- `@sanity/schemas/service.ts` — append fields here
- `@src/components/offer/OfferPage.tsx` — render `<OfferFormCta />` as sixth child, conditionally on `service.relatedFormSlug`
- `@src/app/globals.css` — CSS variables and utility classes
- `src/components/offer/OfferFormCta.tsx` — file to create
