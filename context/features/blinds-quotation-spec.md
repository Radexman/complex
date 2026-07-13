# Blinds Quotation Form — Spec

## Overview

Build the `/wycena/zaluzje` page — the terrace blinds quotation form. The simplest of the four quotation forms. No shape selector, no dropdowns — just dimension inputs, contact fields, and the standard shared components. Fully reuses everything from `src/components/forms/shared/`. All visible text in Polish.

---

## File Structure

```
src/
  app/
    wycena/
      zaluzje/
        page.tsx
  components/
    forms/
      ZaluzjeForm.tsx
  lib/
    actions/
      submitZaluzjeForm.ts
    validations/
      zaluzjeForm.ts
```

All shared components imported from `src/components/forms/shared/` — do not recreate.

---

## Page Requirements

- File: `src/app/wycena/zaluzje/page.tsx`
- Metadata:
  - `title`: "Formularz Wyceny Żaluzji — Complex"
  - `description`: "Wypełnij formularz wyceny żaluzji tarasowych i otrzymaj bezpłatną ofertę w ciągu 24 godzin."
- Same page hero pattern as previous quotation pages:
  - Eyebrow: "Formularze wycen"
  - Headline: "Formularz Wyceny Żaluzji"
  - Subheadline: "Wypełnij poniższy formularz, a my przygotujemy bezpłatną wycenę i skontaktujemy się z Tobą w ciągu 24 godzin roboczych."

---

## Form Layout

- File: `src/components/forms/ZaluzjeForm.tsx`
- `"use client"` directive
- Same two-column grid: `grid grid-cols-2 gap-12 items-start max-w-6xl mx-auto px-6 py-16`
- **Left column**: opening dimensions (height + width)
- **Right column**: location, installation service, contact fields, notes, photo upload, consents, submit
- Single column on mobile

---

## Zod Schema — `src/lib/validations/zaluzjeForm.ts`

```ts
import { z } from 'zod';

export const zaluzjeFormSchema = z.object({
  // Opening dimensions
  openingHeight: z.coerce
    .number()
    .positive('Podaj wysokość otworu')
    .max(500, 'Maksymalna wysokość to 500 cm'),
  openingWidth: z.coerce
    .number()
    .positive('Podaj szerokość otworu')
    .max(1000, 'Maksymalna szerokość to 1000 cm'),

  // Contact & location
  postalCode: z
    .string()
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
  consentRodo: z.boolean().refine((val) => val === true, {
    message: 'Zgoda jest wymagana',
  }),
  consentMarketing: z.boolean().default(false),
});

export type ZaluzjeFormData = z.infer<typeof zaluzjeFormSchema>;
```

---

## Left Column Fields

### Opening Dimensions

- Section label: `font-body text-sm font-medium text-white mb-1` — "Podaj wymiary otworu do zabudowy" — required
- Helper: `text-xs text-silver mb-4` — "Podaj wymiary otworu okiennego lub drzwiowego w centymetrach"
- Two inputs stacked:
  - `openingHeight`: `FormInput`, label "Wysokość [cm]", type `number`, step `1`, min `1`, placeholder "np. 220", required
  - `openingWidth`: `FormInput`, label "Szerokość [cm]", type `number`, step `1`, min `1`, placeholder "np. 250", required
- Both marked required with `*`

Left column has intentionally minimal content — two inputs only. This is fine; the column naturally uses the space without needing filler. Add a glass info card below the dimension inputs:

### Info Card (left column, below dimensions)

- `glass` utility class + `rounded-xl p-5 border border-graphite mt-6`
- `Info` Lucide icon, `text-accent`, size 18, inline before heading
- Heading: `font-heading text-sm font-semibold text-white mb-2` — "Jak mierzyć otwór?"
- Body: `font-body text-xs text-silver leading-relaxed` — "Zmierz szerokość i wysokość otworu okiennego lub drzwiowego, w którym ma być zamontowana żaluzja. Pomiar wykonaj wewnątrz ościeżnicy."
- This card is purely informational — no form fields inside

---

## Right Column Fields

Same order and pattern as previous quotation forms:

- `name`: `FormInput`, label "Imię i nazwisko", required
- `phone`: `FormInput`, label "Numer telefonu", type `tel`, required
- `email`: `FormInput`, label "Adres e-mail", type `email`, required
- `postalCode`: `FormInput`, label "Kod pocztowy", placeholder "00-000", required
- `installationService`: `FormCheckbox`, label "Usługa montażu", helper "Zaznacz jeśli chcesz wycenić montaż wraz z żaluzjami"
- `notes`: `FormTextarea`, label "Uwagi", rows 4, helper "Określ dodatkowe wymagania: kolor, rodzaj sterowania (ręczne/elektryczne), ilość sztuk itp."
- Photo upload: `FormFileDropzone`, helper "Dodaj zdjęcie okna lub miejsca montażu — pomoże nam przygotować dokładną wycenę."
- `consentRodo`: `FormCheckbox`, required, with Polityki prywatności link
- `consentMarketing`: `FormCheckbox`, optional
- Submit button: identical pattern to previous forms — "Wyślij zapytanie", loading "Wysyłanie...", notes below

---

## Server Action — `src/lib/actions/submitZaluzjeForm.ts`

```ts
'use server';

import { zaluzjeFormSchema } from '@/lib/validations/zaluzjeForm';

export async function submitZaluzjeForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const result = zaluzjeFormSchema.safeParse(raw);

  if (!result.success) {
    return { success: false, errors: result.error.flatten() };
  }

  const data = result.data;

  // TODO: Replace with Resend HTML email (future spec)
  console.log('=== FORMULARZ WYCENY ŻALUZJI ===');
  console.log('Wymiary otworu:', { wysokość: data.openingHeight, szerokość: data.openingWidth });
  console.log('Montaż:', data.installationService);
  console.log('Kontakt:', { name: data.name, phone: data.phone, email: data.email });
  console.log('Kod pocztowy:', data.postalCode);
  console.log('Uwagi:', data.notes);
  console.log('Zgody:', { rodo: data.consentRodo, marketing: data.consentMarketing });
  console.log('================================');

  return { success: true };
}
```

### Success State

Identical to previous forms — `CheckCircle` icon, "Dziękujemy za zapytanie!", 24h response note, homepage link.

---

## References

- `@src/components/forms/shared/` — all shared input components, import from here
- `@src/components/forms/TarasForm.tsx` — reference for two-column layout, success state, submit pattern
- `@src/components/forms/ZadaszenieForm.tsx` — reference for right column field order
- `@src/lib/actions/submitZadaszenieForm.ts` — reference for server action pattern
- `@src/app/globals.css` — CSS variables and utility classes
- `src/app/wycena/zaluzje/page.tsx` — file to create
- `src/components/forms/ZaluzjeForm.tsx` — file to create
- `src/lib/actions/submitZaluzjeForm.ts` — file to create
- `src/lib/validations/zaluzjeForm.ts` — file to create
