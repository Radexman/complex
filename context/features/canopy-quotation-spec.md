# Formularz Wyceny Zadaszenia — Spec

## Overview

Build the `/wycena/zadaszenie` page — the roof/canopy quotation form. Reuses all shared form components from `src/components/forms/shared/` established in `wycena-taras-spec.md`. The server action pattern is identical — console log for now, Resend later. Two-column layout. All visible text in Polish.

---

## File Structure

```
src/
  app/
    wycena/
      zadaszenie/
        page.tsx                    ← page wrapper, SSR metadata
  components/
    forms/
      ZadaszenieForm.tsx            ← main form component for this page
  lib/
    actions/
      submitZadaszenieForm.ts       ← server action (same pattern as taras)
    validations/
      zadaszenieForm.ts             ← Zod schema
```

All shared components (`FormInput`, `FormSelect`, `FormTextarea`, `FormCheckbox`, `FormFileDropzone`) are imported from `src/components/forms/shared/` — do not recreate them.

---

## Page Requirements

- File: `src/app/wycena/zadaszenie/page.tsx`
- SSR page with metadata:
  - `title`: "Formularz Wyceny Zadaszenia — Complex"
  - `description`: "Wypełnij formularz wyceny zadaszenia aluminiowego i otrzymaj bezpłatną ofertę w ciągu 24 godzin."
- Background: `bg-bg-deep`
- Same page hero pattern as `/wycena/taras`:
  - Eyebrow: "Formularze wycen"
  - Headline: "Formularz Wyceny Zadaszenia"
  - Subheadline: "Wypełnij poniższy formularz, a my przygotujemy bezpłatną wycenę i skontaktujemy się z Tobą w ciągu 24 godzin roboczych."

---

## Form Layout

- File: `src/components/forms/ZadaszenieForm.tsx`
- `"use client"` directive
- Same two-column grid as `TarasForm`: `grid grid-cols-2 gap-12 items-start max-w-6xl mx-auto px-6 py-16`
- **Left column**: roof type, colour, width, depth, additional equipment, terrace blinds
- **Right column**: location, installation service, contact fields, notes, photo upload, consents, submit
- Single column on mobile

---

## Zod Schema — `src/lib/validations/zadaszenieForm.ts`

```ts
import { z } from 'zod'

export const zadaszenieFormSchema = z.object({
  // Product config
  roofType: z.string().min(1, 'Wybierz rodzaj zadaszenia'),
  frameColor: z.string().min(1, 'Wybierz kolor konstrukcji'),
  width: z.coerce.number()
    .positive('Podaj szerokość zadaszenia')
    .max(20, 'Maksymalna szerokość to 20 m'),
  depth: z.coerce.number()
    .positive('Podaj głębokość zadaszenia')
    .max(10, 'Maksymalna głębokość to 10 m'),

  // Additional equipment (optional checkboxes, any combination)
  equip_triangleSide: z.boolean().default(false),
  equip_ledLighting: z.boolean().default(false),
  equip_polyWallFixed_right: z.boolean().default(false),
  equip_polyWallFixed_left: z.boolean().default(false),
  equip_glasslessDoorsSliding_right: z.boolean().default(false),
  equip_glasslessDoorsSliding_left: z.boolean().default(false),
  equip_glasslessDoorsSliding_front: z.boolean().default(false),

  // Terrace blinds (optional)
  terraceBlinds: z.string().optional(),

  // Contact & location
  postalCode: z.string()
    .min(6, 'Podaj kod pocztowy')
    .regex(/^\d{2}-\d{3}$/, 'Format: 00-000'),
  name: z.string().min(2, 'Podaj swoje imię i nazwisko'),
  phone: z.string().min(9, 'Podaj numer telefonu'),
  email: z.string().email('Podaj poprawny adres e-mail'),

  // Extras
  installationService: z.boolean().default(false),
  notes: z.string().optional(),
  photo: z.any().optional(),

  // Consents
  consentRodo: z.boolean().refine(val => val === true, {
    message: 'Zgoda jest wymagana',
  }),
  consentMarketing: z.boolean().default(false),
})

export type ZadaszenieFormData = z.infer<typeof zadaszenieFormSchema>
```

---

## Left Column Fields

### Roof Type — `FormSelect`

- Label: "Wybierz rodzaj zadaszenia" — required
- Options (exact values from screenshot dropdown):
  - Dach stały poliwęglan, model przyścienny, ALUM /wym. standardowe i na wymiar
  - Dach stały poliwęglan, model wolnostojący, ALUM /wym. standardowe i na wymiar
  - Dach z lameli, model przyścienny Pinela, ALUM /wym. standardowe
  - Dach z lameli, model wolnostojący Pinela, ALUM /wym. standardowe
  - Dach z materiałem, model przyścienny Verdeca, ALUM /wym. standardowe
  - Dach z roletą rzymską, model przyścienny Ekonomiczny, ALUM /wym. standardowe
  - Dach z roletą rzymską, model wolnostojący Ekonomiczny, ALUM /wym. standardowe

### Frame Colour — `FormSelect`

- Label: "Kolor konstrukcji ALUM" — required
- Options:
  - antracyt
  - czarny
  - biały krem

### Width — `FormInput`

- Label: "Szerokość zadaszenia [m]" — required
- Type: `number`, step `0.1`, min `0.5`
- Placeholder: "np. 3.0"
- Helper: `text-xs text-silver` — "Podaj szerokość w metrach"

### Depth — `FormInput`

- Label: "Głębokość zadaszenia (wysięg) [m]" — required
- Type: `number`, step `0.1`, min `0.5`
- Placeholder: "np. 2.5"
- Helper: `text-xs text-silver` — "Podaj głębokość/wysięg w metrach"

### Additional Equipment — checkboxes group

- Section label: `font-body text-sm font-medium text-white mb-3` — "Wyposażenie dodatkowe"
- Helper: `text-xs text-silver mb-3` — "Zaznacz opcje, które Cię interesują"
- All optional, any combination allowed
- Each rendered as `FormCheckbox`, layout: `flex flex-col gap-2`
- Checkboxes in this exact order:
  - `equip_triangleSide` — "Trójkąt boczny, poliwęglan (kpl/2szt)"
  - `equip_ledLighting` — "Oświetlenie punktowe LED + pilot"
  - `equip_polyWallFixed_right` — "Poliwęglan, ściana stała / prawa strona"
  - `equip_polyWallFixed_left` — "Poliwęglan, ściana stała / lewa strona"
  - `equip_glasslessDoorsSliding_right` — "Szyby bezramowe, drzwi przesuwne / prawa strona"
  - `equip_glasslessDoorsSliding_left` — "Szyby bezramowe, drzwi przesuwne / lewa strona"
  - `equip_glasslessDoorsSliding_front` — "Szyby bezramowe, drzwi przesuwne / front"

### Terrace Blinds — `FormTextarea`

- Visually separated from equipment section with `border-t border-graphite pt-4 mt-4`
- Section label: `font-body text-sm font-medium text-white mb-1` — "Żaluzje tarasowe (opcjonalne)"
- Helper: `text-xs text-silver mb-2` — "Podaj wymiary otworu do zabudowy: szerokość x wysokość [cm]"
- `FormTextarea`, rows 2, placeholder: "np. 250 x 220"
- Not required

---

## Right Column Fields

### Contact & Location

Same pattern and field set as `TarasForm`, in this order:

- `name`: `FormInput`, label "Imię i nazwisko", required
- `phone`: `FormInput`, label "Numer telefonu", type `tel`, required
- `email`: `FormInput`, label "Adres e-mail", type `email`, required
- `postalCode`: `FormInput`, label "Kod pocztowy", placeholder "00-000", required

### Installation Service

- `FormCheckbox`
- Label: "Usługa montażu"
- Helper: `text-xs text-silver mt-1` — "Zaznacz jeśli chcesz wycenić montaż wraz z zadaszenieiem"

### Notes — `FormTextarea`

- Label: "Uwagi"
- Helper: `text-xs text-silver mt-1` — "Określ dodatkowe wymagania dotyczące zadaszenia: np. niestandardowe wymiary, specjalne wykończenia itp."
- Rows: 4

### Photo Upload — `FormFileDropzone`

- Same configuration as `TarasForm`
- Helper text adjusted: "Dodaj zdjęcie miejsca montażu — pomoże nam lepiej przygotować wycenę."

### Consent Checkboxes

Identical to `TarasForm` — reuse exactly:
- `consentRodo` (required) with Polityki prywatności link
- `consentMarketing` (optional)

### Submit Button

Identical pattern to `TarasForm`:
- Label: "Wyślij zapytanie"
- Loading: "Wysyłanie..."
- Notes below button identical to `TarasForm`

---

## Server Action — `src/lib/actions/submitZadaszenieForm.ts`

Same pattern as `submitTarasForm.ts`. Validate with `zadaszenieFormSchema.safeParse`, then log structured data:

```ts
'use server'

import { zadaszenieFormSchema } from '@/lib/validations/zadaszenieForm'

export async function submitZadaszenieForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const result = zadaszenieFormSchema.safeParse(raw)

  if (!result.success) {
    return { success: false, errors: result.error.flatten() }
  }

  const data = result.data

  // TODO: Replace with Resend HTML email (future spec)
  console.log('=== FORMULARZ WYCENY ZADASZENIA ===')
  console.log('Rodzaj zadaszenia:', data.roofType)
  console.log('Kolor konstrukcji:', data.frameColor)
  console.log('Wymiary:', { szerokość: data.width, głębokość: data.depth })
  console.log('Wyposażenie dodatkowe:', {
    trójkąt_boczny: data.equip_triangleSide,
    oświetlenie_LED: data.equip_ledLighting,
    poliwęglan_prawa: data.equip_polyWallFixed_right,
    poliwęglan_lewa: data.equip_polyWallFixed_left,
    szyby_przesuwne_prawa: data.equip_glasslessDoorsSliding_right,
    szyby_przesuwne_lewa: data.equip_glasslessDoorsSliding_left,
    szyby_przesuwne_front: data.equip_glasslessDoorsSliding_front,
  })
  console.log('Żaluzje tarasowe:', data.terraceBlinds)
  console.log('Montaż:', data.installationService)
  console.log('Kontakt:', { name: data.name, phone: data.phone, email: data.email })
  console.log('Kod pocztowy:', data.postalCode)
  console.log('Uwagi:', data.notes)
  console.log('Zgody:', { rodo: data.consentRodo, marketing: data.consentMarketing })
  console.log('===================================')

  return { success: true }
}
```

### Success State

Identical to `TarasForm` success state — `CheckCircle` icon, thank you headline, 24h response note, link back to homepage.

---

## References

- `@context/screenshots/screencapture-ccomplex-pl-formularze-wycen-formularz-wyceny-zadaszenia-2026-07-13-09_32_30.png` — full page visual reference
- `@context/screenshots/Zrzut_ekranu_2026-07-13_093352.png` — roof type dropdown options reference
- `@context/complex-project-spec.md` — Quotation Forms section, Design System
- `@src/components/forms/shared/` — all shared input components, import from here
- `@src/components/forms/TarasForm.tsx` — reference for two-column layout, success state, submit pattern
- `@src/lib/actions/submitTarasForm.ts` — reference for server action pattern
- `@src/app/globals.css` — CSS variables and utility classes
- `src/app/wycena/zadaszenie/page.tsx` — file to create
- `src/components/forms/ZadaszenieForm.tsx` — file to create
- `src/lib/actions/submitZadaszenieForm.ts` — file to create
- `src/lib/validations/zadaszenieForm.ts` — file to create
