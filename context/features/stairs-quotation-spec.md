# Stairs Quotation Form — Spec

## Overview

Build the `/wycena/schody` page — the modular stairs quotation form. One fixed stair diagram image (uploaded via Sanity) displayed prominently on the left column with its labelled dimension inputs A–h below it. Contact fields and the rest on the right. No shape selector, no dropdowns. Fully reuses shared components. All visible text in Polish.

---

## File Structure

```
src/
  app/
    wycena/
      schody/
        page.tsx
  components/
    forms/
      SchodForms.tsx
  lib/
    actions/
      submitSchodForm.ts
    validations/
      schodForm.ts
```

All shared components imported from `src/components/forms/shared/` — do not recreate.

---

## Page Requirements

- File: `src/app/wycena/schody/page.tsx`
- Metadata:
  - `title`: "Formularz Wyceny Schodów — Complex"
  - `description`: "Wypełnij formularz wyceny schodów modułowych i otrzymaj bezpłatną ofertę w ciągu 24 godzin."
- Same page hero pattern as previous quotation pages:
  - Eyebrow: "Formularze wycen"
  - Headline: "Formularz Wyceny Schodów"
  - Subheadline: "Wypełnij poniższy formularz, a my przygotujemy bezpłatną wycenę i skontaktujemy się z Tobą w ciągu 24 godzin roboczych."
- Fetch `schodDiagram` from `siteSettings` and pass to `SchodForm` as prop

---

## Sanity Schema

Add a `schodDiagram` object to `siteSettings`:

- `schodDiagram` — object with:
  - `image` — image — the stair dimension diagram (the 3D technical drawing visible in the screenshot), uploaded by the editor
  - `alt` — string — alt text for accessibility, default: "Schemat wymiarów schodów modułowych"

This is the only Sanity addition needed — no new document types. Fetch it in `page.tsx` alongside other `siteSettings` data.

---

## Form Layout

- File: `src/components/forms/SchodForm.tsx`
- `"use client"` directive
- Props: `diagramImage` (Sanity image object), `diagramAlt` (string)
- Same two-column grid: `grid grid-cols-2 gap-12 items-start max-w-6xl mx-auto px-6 py-16`
- **Left column**: stair diagram image + all dimension inputs (A through h)
- **Right column**: insulation question, contact fields, notes, photo upload, consents, submit
- Single column on mobile — diagram appears above dimension inputs, which appear above right column fields

---

## Zod Schema — `src/lib/validations/schodForm.ts`

```ts
import { z } from 'zod'

export const schodFormSchema = z.object({
  // Insulation
  isInsulated: z.enum(['tak', 'nie'], {
    required_error: 'Określ czy budynek jest ocieplony',
  }),

  // Dimensions (all in cm, all required)
  dimA: z.coerce.number().positive('Podaj wymiar A — szerokość otworu'),
  dimB: z.coerce.number().positive('Podaj wymiar B — głębokość otworu'),
  dimC: z.coerce.number().positive('Podaj wymiar C — grubość stropu'),
  dimD: z.coerce.number().positive('Podaj wymiar D — długość schodów'),
  dimE: z.coerce.number().positive('Podaj wymiar E — szerokość stopni'),
  dimH: z.coerce.number().positive('Podaj wymiar H — wysokość od podłoża wraz ze stropem'),
  dimh: z.coerce.number().positive('Podaj wymiar h — wysokość od podłoża do stropu'),

  // Contact & location
  postalCode: z.string()
    .min(6, 'Podaj kod pocztowy')
    .regex(/^\d{2}-\d{3}$/, 'Format: 00-000'),
  name: z.string().min(2, 'Podaj swoje imię i nazwisko'),
  phone: z.string().min(9, 'Podaj numer telefonu'),
  email: z.string().email('Podaj poprawny adres e-mail'),

  // Extras
  notes: z.string().optional(),
  photo: z.any().optional(),

  // Consents
  consentRodo: z.boolean().refine(val => val === true, {
    message: 'Zgoda jest wymagana',
  }),
  consentMarketing: z.boolean().default(false),
})

export type SchodFormData = z.infer<typeof schodFormSchema>
```

---

## Left Column

### Stair Diagram Image

- Rendered via `next/image` using the Sanity image from `diagramImage` prop
- Container: `rounded-xl overflow-hidden border border-graphite bg-bg-surface`
- `width={600}`, `height={450}`, `objectFit="contain"`, `className="w-full"`
- Alt text from `diagramAlt` prop
- Helper below image: `text-xs text-silver text-center mt-2` — "Schemat wymiarów schodów (zgodnie z rysunkiem)"

### Insulation Question

- Visually separated with a thin `border-t border-graphite pt-5 mt-5`
- Label: `font-body text-sm font-medium text-white mb-1` — "Dane do wyceny"
- Sub-label: `font-body text-sm text-silver mb-3` — "Czy budynek jest ocieplony? (w przypadku schodów zewnętrznych)"
- Use `FormRadioGroup` component (already in `src/components/forms/shared/`)
- Options rendered as two pill buttons side by side:
  - value `"tak"` — label "Tak"
  - value `"nie"` — label "Nie"
- Required field, error shown below

### Dimension Inputs

- Section label: `font-body text-sm font-medium text-white mt-5 mb-3` — "Wymiary [cm]"
- Helper: `text-xs text-silver mb-4` — "Podaj wymiary zgodnie z rysunkiem powyżej"
- All inputs use `FormInput`, type `number`, step `1`, min `1`, all required
- Layout: `flex flex-col gap-3`
- Inputs in this exact order, labels matching the diagram labels:
  - `dimA` — "A — szerokość otworu [cm]"
  - `dimB` — "B — głębokość otworu [cm]"
  - `dimC` — "C — grubość stropu [cm]"
  - `dimD` — "D — długość schodów [cm]"
  - `dimE` — "E — szerokość stopni [cm]"
  - `dimH` — "H — wysokość od podłoża wraz ze stropem [cm]"
  - `dimh` — "h — wysokość od podłoża do stropu [cm]"
- Note: `dimH` uses uppercase H and `dimh` uses lowercase h — these are two distinct measurements as shown on the original diagram. Preserve this distinction in labels and field names.

---

## Right Column Fields

Same order and pattern as previous quotation forms:

- `name`: `FormInput`, label "Imię i nazwisko", required
- `phone`: `FormInput`, label "Numer telefonu", type `tel`, required
- `email`: `FormInput`, label "Adres e-mail", type `email`, required
- `postalCode`: `FormInput`, label "Kod pocztowy", placeholder "00-000", required
- `notes`: `FormTextarea`, label "Uwagi", rows 4, no helper text (original form has a plain textarea with no helper)
- Photo upload: `FormFileDropzone`, helper "Zdjęcie miejsca, w którym mają znajdować się schody lub projekt techniczny."
- `consentRodo`: `FormCheckbox`, required, with Polityki prywatności link
- `consentMarketing`: `FormCheckbox`, optional
- Submit button: identical pattern — "Wyślij zapytanie", loading "Wysyłanie...", notes below

Note: no `installationService` checkbox on this form — not present on the original and stairs are always installed as part of the product.

---

## Server Action — `src/lib/actions/submitSchodForm.ts`

```ts
'use server'

import { schodFormSchema } from '@/lib/validations/schodForm'

export async function submitSchodForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const result = schodFormSchema.safeParse(raw)

  if (!result.success) {
    return { success: false, errors: result.error.flatten() }
  }

  const data = result.data

  // TODO: Replace with Resend HTML email (future spec)
  console.log('=== FORMULARZ WYCENY SCHODÓW ===')
  console.log('Budynek ocieplony:', data.isInsulated)
  console.log('Wymiary:', {
    'A — szerokość otworu': data.dimA,
    'B — głębokość otworu': data.dimB,
    'C — grubość stropu': data.dimC,
    'D — długość schodów': data.dimD,
    'E — szerokość stopni': data.dimE,
    'H — wys. od podłoża ze stropem': data.dimH,
    'h — wys. od podłoża do stropu': data.dimh,
  })
  console.log('Kontakt:', { name: data.name, phone: data.phone, email: data.email })
  console.log('Kod pocztowy:', data.postalCode)
  console.log('Uwagi:', data.notes)
  console.log('Zgody:', { rodo: data.consentRodo, marketing: data.consentMarketing })
  console.log('================================')

  return { success: true }
}
```

### Success State

Identical to previous forms — `CheckCircle` icon, "Dziękujemy za zapytanie!", 24h response note, homepage link.

---

## References

- `@context/screenshots/screencapture-ccomplex-pl-formularze-wycen-formularz-wyceny-schodow-2026-07-13-09_48_25.png` — visual reference
- `@src/components/forms/shared/` — all shared input components, import from here
- `@src/components/forms/TarasForm.tsx` — reference for two-column layout, success state, submit pattern
- `@src/lib/actions/submitZaluzjeForm.ts` — reference for server action pattern
- `@sanity/schemas/siteSettings.ts` — add `schodDiagram` fields here
- `@src/app/globals.css` — CSS variables and utility classes
- `src/app/wycena/schody/page.tsx` — file to create
- `src/components/forms/SchodForm.tsx` — file to create
- `src/lib/actions/submitSchodForm.ts` — file to create
- `src/lib/validations/schodForm.ts` — file to create
