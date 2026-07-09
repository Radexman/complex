# Formularz Wyceny Tarasu — Spec

## Overview

Build the `/wycena/taras` page — the terrace quotation form. This is the most complex of the four quotation forms and establishes the shared patterns, abstractions, and server action that all other quotation forms (`/wycena/zadaszenie`, `/wycena/zaluzje`, `/wycena/schody`) will reuse. Built with `react-hook-form` + Zod. UI primitives from Ark UI. All visible text in Polish. For now the server action logs structured data to the console — Resend HTML email is a future task handled in a separate spec.

---

## File Structure

```
src/
  app/
    wycena/
      taras/
        page.tsx                  ← page wrapper, SSR metadata
  components/
    forms/
      TarasForm.tsx               ← main form component for this page
      shared/
        FormInput.tsx             ← reusable labeled text/number input
        FormSelect.tsx            ← reusable labeled select dropdown
        FormTextarea.tsx          ← reusable labeled textarea
        FormFileDropzone.tsx      ← Ark UI file upload dropzone
        FormCheckbox.tsx          ← Ark UI checkbox with label
        FormRadioGroup.tsx        ← Ark UI radio group
        ShapeSelector.tsx         ← shape image radio buttons
        DimensionInputs.tsx       ← dynamic dimension fields per shape
  lib/
    actions/
      submitTarasForm.ts          ← server action
    validations/
      tarasForm.ts                ← Zod schema
```

---

## Page Requirements

- File: `src/app/wycena/taras/page.tsx`
- SSR page with metadata:
  - `title`: "Formularz Wyceny Tarasu — Complex"
  - `description`: "Wypełnij formularz wyceny tarasu i otrzymaj bezpłatną ofertę w ciągu 24 godzin."
- Background: `bg-bg-deep`
- Renders the page hero (see below) and `<TarasForm />`

### Page Hero (simple, not fullscreen)

- `bg-bg-mid py-16 border-b border-graphite`
- Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase` — "Formularze wycen"
- Headline: `font-heading text-4xl font-bold text-white mt-2` — "Formularz Wyceny Tarasu"
- Subheadline: `font-body text-base text-silver mt-3 max-w-xl` — "Wypełnij poniższy formularz, a my przygotujemy bezpłatną wycenę i skontaktujemy się z Tobą w ciągu 24 godzin roboczych."

---

## Form Layout

- File: `src/components/forms/TarasForm.tsx`
- `"use client"` directive
- Outer wrapper: `max-w-6xl mx-auto px-6 py-16`
- **Two-column grid on desktop**: `grid grid-cols-2 gap-12 items-start`
  - **Left column**: shape selector + dynamic dimension inputs + building position
  - **Right column**: material, installation service, location, notes, photo upload, consents, submit button
- Single column on mobile (`grid-cols-1`)

---

## Zod Schema — `src/lib/validations/tarasForm.ts`

```ts
import { z } from 'zod'

export const tarasFormSchema = z.object({
  // Shape & dimensions
  shape: z.enum(['1', '2', '3', '4'], {
    required_error: 'Wybierz kształt tarasu',
  }),
  sideA: z.coerce.number().positive('Podaj długość boku A').optional(),
  sideB: z.coerce.number().positive('Podaj długość boku B').optional(),
  sideC: z.coerce.number().positive('Podaj długość boku C').optional(),
  sideD: z.coerce.number().positive('Podaj długość boku D').optional(),
  sideE: z.coerce.number().positive('Podaj długość boku E').optional(),
  sideF: z.coerce.number().positive('Podaj długość boku F').optional(),
  sideG: z.coerce.number().positive('Podaj długość boku G').optional(),
  sideH: z.coerce.number().positive('Podaj długość boku H').optional(),

  // Building position
  buildingPosition: z.array(z.string()).min(1, 'Określ położenie budynku'),

  // Product options
  material: z.string().min(1, 'Wybierz materiał tarasowy'),
  installationService: z.boolean().default(false),

  // Contact & location
  postalCode: z.string()
    .min(6, 'Podaj kod pocztowy')
    .regex(/^\d{2}-\d{3}$/, 'Format: 00-000'),
  name: z.string().min(2, 'Podaj swoje imię i nazwisko'),
  phone: z.string().min(9, 'Podaj numer telefonu'),
  email: z.string().email('Podaj poprawny adres e-mail'),

  // Notes & photo
  notes: z.string().optional(),
  photo: z.any().optional(), // File object, validated separately in component

  // Consents
  consentRodo: z.boolean().refine(val => val === true, {
    message: 'Zgoda jest wymagana',
  }),
  consentMarketing: z.boolean().default(false),
})

export type TarasFormData = z.infer<typeof tarasFormSchema>
```

### Dynamic side validation with `.superRefine`

Add a `.superRefine` block after the base schema to enforce that dimension fields required by the selected shape are present:

```ts
// Sides required per shape:
// Shape 1: A, B, C
// Shape 2: A, B, C, D, E, F
// Shape 3: A, B, C, D, E, F, G, H
// Shape 4: A, B, C, D, E, F, G, H
const REQUIRED_SIDES: Record<string, string[]> = {
  '1': ['A', 'B', 'C'],
  '2': ['A', 'B', 'C', 'D', 'E', 'F'],
  '3': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  '4': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
}
```

For each required side for the selected shape, add a Zod issue if the value is missing or not a positive number.

---

## Sanity Schema — shape images

The 4 shape SVG diagrams are uploaded by the editor in Sanity Studio. Add a `tarasShapes` object to `siteSettings`:

- `tarasShapes` — array of exactly 4 objects, each with:
  - `shapeNumber` — string — `"1"`, `"2"`, `"3"`, `"4"` (used to match form value)
  - `label` — string — e.g. "Kształt 1"
  - `image` — image — the SVG or PNG diagram uploaded by the editor
  - `sides` — array of strings — the side labels for this shape, e.g. `["A", "B", "C"]` — drives which dimension inputs render

Fetch `tarasShapes` from `siteSettings` in `src/app/wycena/taras/page.tsx` and pass as props to `TarasForm`.

---

## Left Column Components

### `ShapeSelector.tsx`

- Props: `shapes[]` (from Sanity), `value`, `onChange`, `error`
- Use Ark UI `RadioGroup` (`RadioGroup.Root`, `RadioGroup.Item`, `RadioGroup.ItemControl`, `RadioGroup.ItemText`) as the headless base
- Layout: `grid grid-cols-2 gap-3`
- Each shape item:
  - `RadioGroup.Item` styled as a card: `relative cursor-pointer rounded-xl border-2 border-graphite bg-bg-surface p-3 flex flex-col items-center gap-2 transition-all duration-200`
  - Selected state (via `data-state="checked"`): `border-accent bg-accent/5`
  - Hover: `hover:border-accent/50`
  - Shape image: `next/image` from Sanity CDN, `width={120}`, `height={100}`, `objectFit="contain"`, rendered inside the card
  - Label: `font-body text-xs text-silver text-center` — "Kształt 1" etc.
  - The hidden `RadioGroup.ItemHiddenInput` ensures the value is registered with react-hook-form via `Controller`
- Error message below the grid: `text-xs text-red-400 mt-1`

### `DimensionInputs.tsx`

- Props: `sides[]` (derived from selected shape's `sides` array from Sanity), `register`, `errors`
- Renders only the dimension inputs for the sides belonging to the currently selected shape
- Animates in/out with a simple `opacity` + `height` CSS transition when shape changes — use a `key` prop on the container tied to `selectedShape` to trigger remount + GSAP fade-in
- Each input: `FormInput` component (see shared components below), type `number`, step `0.01`, min `0`, label e.g. "Długość boku A [m]", placeholder "np. 3.5"
- Grid: `grid grid-cols-2 gap-3`

### Building Position (checkboxes)

- Label: `font-body text-sm font-medium text-white mb-2` — "Określ położenie budynku względem tarasu"
- Helper text: `text-xs text-silver mb-3` — "Zaznacz boki, przy których przylega ściana budynku"
- Renders one `FormCheckbox` per side in the current shape (same dynamic set as dimension inputs)
- Layout: `flex flex-wrap gap-2`
- Each checkbox shows the side letter as its label (A, B, C...)
- Validation error: `text-xs text-red-400 mt-1`

---

## Right Column Components

### Material Select

- `FormSelect` component
- Label: "Wybierz materiał tarasowy"
- Required field
- Options (matching screenshot dropdown exactly):
  - Kompozyt Komorowy
  - Kompozyt Pełny (Premium)
  - Płyty Gresowe gr. 2 cm
  - Thermo Jesion (Termojesion)
  - Thermo Sosna (Thermososna)
  - Świerk
  - Bangkirai
  - Angelim Amargoso

### Installation Service

- `FormCheckbox` component
- Label: "Usługa montażu"
- Helper: `text-xs text-silver mt-1` — "Zaznacz jeśli chcesz wycenić montaż wraz z materiałem"

### Contact & Location Fields

- `name`: `FormInput`, label "Imię i nazwisko", required
- `phone`: `FormInput`, label "Numer telefonu", type `tel`, required
- `email`: `FormInput`, label "Adres e-mail", type `email`, required
- `postalCode`: `FormInput`, label "Kod pocztowy", placeholder "00-000", required

### Notes

- `FormTextarea` component
- Label: "Uwagi"
- Helper: `text-xs text-silver mt-1` — "Określ dodatkowe wymagania: kolor, producent, nazwa produktu itp."
- Rows: 4

### Photo Upload — `FormFileDropzone.tsx`

- Use Ark UI `FileUpload` component (`FileUpload.Root`, `FileUpload.Dropzone`, `FileUpload.Trigger`, `FileUpload.ItemGroup`, `FileUpload.Item`)
- Label: "Zdjęcie miejsca montażu (opcjonalne)"
- Helper: `text-xs text-silver mt-1` — "Dodaj zdjęcie ogrodu lub miejsca, gdzie ma powstać taras. Ułatwi nam przygotowanie wyceny."
- Accepted formats: `image/jpeg`, `image/png`, `image/webp`
- Max file size: 10MB
- Max files: 3
- Dropzone style: `border-2 border-dashed border-graphite rounded-xl p-8 text-center bg-bg-surface cursor-pointer hover:border-accent/50 transition-colors duration-200`
- Drag-over state: `border-accent bg-accent/5`
- Icon: `ImagePlus` Lucide, `text-silver mx-auto mb-3`, size 32
- Text: `font-body text-sm text-silver` — "Przeciągnij zdjęcia tutaj lub kliknij, aby wybrać"
- Sub-text: `text-xs text-silver/60` — "JPG, PNG, WEBP • max. 10 MB • do 3 zdjęć"
- Uploaded file preview: thumbnail grid below dropzone, each with filename and remove button

### Consent Checkboxes

Both use `FormCheckbox`. Separated by a thin `border-t border-graphite pt-4 mt-2`:

- `consentRodo` (required):
  - Label: `"Zapoznałem/am się z treścią Polityki prywatności i wyrażam zgodę na przetwarzanie moich danych osobowych przez Complex sp. z o.o. w celu przygotowania oferty."` — "Polityki prywatności" is a `<Link href="/polityka-prywatnosci">` in `text-accent`
  - Error shown inline below checkbox
- `consentMarketing` (optional):
  - Label: `"Wyrażam zgodę na przetwarzanie moich danych w celach marketingowych i przesyłanie ofert drogą e-mailową lub telefoniczną."`

### Submit Button

- Full-width: `w-full bg-accent text-black font-semibold rounded-lg py-4 text-base hover:bg-accent-hover transition-colors mt-6 flex items-center justify-center gap-2`
- Default label: "Wyślij zapytanie" + `Send` Lucide icon
- Loading state: spinner + "Wysyłanie..."
- Disabled while submitting

---

## Shared Input Components — `src/components/forms/shared/`

These components abstract the label + input + error pattern. All other quotation forms import from here.

### `FormInput.tsx`

Props: `label`, `name`, `register`, `error`, `type?`, `placeholder?`, `helperText?`, `required?`

```tsx
// Structure:
<div className="flex flex-col gap-1">
  <label className="font-body text-sm font-medium text-white">
    {label} {required && <span className="text-accent">*</span>}
  </label>
  {helperText && <p className="text-xs text-silver">{helperText}</p>}
  <input
    className="bg-bg-surface border border-graphite rounded-lg px-4 py-3 text-sm text-white
               placeholder:text-silver/50 focus:outline-none focus:border-accent
               transition-colors duration-200
               aria-invalid:border-red-500"
    {...register(name)}
  />
  {error && <p className="text-xs text-red-400">{error.message}</p>}
</div>
```

### `FormSelect.tsx`

Props: `label`, `name`, `options[]` (`{ value: string, label: string }`), `register`, `error`, `required?`

- Same label/error wrapper pattern as `FormInput`
- `<select>` styled: `bg-bg-surface border border-graphite rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-accent transition-colors w-full appearance-none cursor-pointer`
- Custom chevron: wrap in a relative div, add `ChevronDown` Lucide icon absolutely positioned right

### `FormTextarea.tsx`

Props: `label`, `name`, `register`, `error`, `rows?`, `placeholder?`, `helperText?`

- Same pattern as `FormInput` but `<textarea>`, `resize-none`

### `FormCheckbox.tsx`

Props: `label`, `name`, `control` (react-hook-form Controller), `error`, `helperText?`

- Use Ark UI `Checkbox` (`Checkbox.Root`, `Checkbox.Control`, `Checkbox.Label`, `Checkbox.HiddenInput`)
- Wrap in react-hook-form `Controller`
- Custom control: `w-5 h-5 rounded border-2 border-graphite bg-bg-surface flex items-center justify-center transition-all`
- Checked state: `bg-accent border-accent` + `Check` Lucide icon `text-black` size 12
- Label: `font-body text-sm text-silver leading-relaxed`

### `FormRadioGroup.tsx`

Generic reusable radio group for future forms (e.g. zadaszenie roof type).

Props: `label`, `name`, `options[]` (`{ value: string, label: string }`), `control`, `error`

- Use Ark UI `RadioGroup`
- Renders options as styled pill buttons: `rounded-full border border-graphite px-4 py-2 text-sm text-silver cursor-pointer transition-all`
- Selected: `border-accent text-accent bg-accent/5`

### `FormFileDropzone.tsx`

Already described above under Photo Upload. Exported from `shared/` for reuse.

---

## Server Action — `src/lib/actions/submitTarasForm.ts`

```ts
'use server'

import { tarasFormSchema } from '@/lib/validations/tarasForm'

export async function submitTarasForm(formData: FormData) {
  // Parse and validate
  const raw = Object.fromEntries(formData.entries())
  const result = tarasFormSchema.safeParse(raw)

  if (!result.success) {
    return { success: false, errors: result.error.flatten() }
  }

  const data = result.data

  // TODO: Replace with Resend HTML email (future spec)
  console.log('=== FORMULARZ WYCENY TARASU ===')
  console.log('Kształt:', data.shape)
  console.log('Wymiary:', {
    A: data.sideA, B: data.sideB, C: data.sideC, D: data.sideD,
    E: data.sideE, F: data.sideF, G: data.sideG, H: data.sideH,
  })
  console.log('Położenie budynku:', data.buildingPosition)
  console.log('Materiał:', data.material)
  console.log('Montaż:', data.installationService)
  console.log('Kontakt:', { name: data.name, phone: data.phone, email: data.email })
  console.log('Kod pocztowy:', data.postalCode)
  console.log('Uwagi:', data.notes)
  console.log('Zgody:', { rodo: data.consentRodo, marketing: data.consentMarketing })
  console.log('===============================')

  return { success: true }
}
```

The action uses `FormData` so it is compatible with both client-side `handleSubmit` and future progressive enhancement. Call it from `TarasForm.tsx` inside react-hook-form's `handleSubmit` callback:

```ts
const onSubmit = async (data: TarasFormData) => {
  const fd = new FormData()
  // append all fields to fd, including photo files
  const result = await submitTarasForm(fd)
  if (result.success) {
    // show success state
  }
}
```

### Success State

After successful submission, replace the form with a centered confirmation panel:

- `CheckCircle` Lucide icon, `text-accent`, size 48
- Headline: `font-heading text-2xl font-bold text-white mt-4` — "Dziękujemy za zapytanie!"
- Body: `font-body text-base text-silver mt-2` — "Skontaktujemy się z Tobą w ciągu 24 godzin roboczych na podany adres e-mail lub numer telefonu."
- CTA link back to homepage: `text-accent hover:text-accent-hover text-sm mt-6`

---

## Form UX Details

- All required fields marked with `*` in `text-accent`
- Validation fires `onBlur` for individual fields, `onSubmit` for the full form — set `mode: 'onBlur'` in `useForm`
- Error messages appear directly below each field in `text-xs text-red-400`
- The left column (shape + dimensions) and right column (contact, etc.) scroll independently on tall viewports — use `md:sticky md:top-24` on the right column header if needed
- Note below submit button: `text-xs text-silver text-center mt-3` — "* Pola obowiązkowe. Oferta zostanie przesłana w ciągu 7 dni roboczych."
- Second note: `text-xs text-silver text-center mt-1` — "Usługi montażowe wykonujemy na terenie województw śląskiego i opolskiego."

---

## References

- `@context/screenshots/quotation-options.png` — material dropdown visual reference
- `@context/complex-project-spec.md` — Quotation Forms section, Design System
- `@src/app/globals.css` — CSS variables and utility classes
- `@sanity/schemas/siteSettings.ts` — add `tarasShapes` array
- `src/app/wycena/taras/page.tsx` — file to create
- `src/components/forms/TarasForm.tsx` — file to create
- `src/components/forms/shared/` — all shared input components, files to create
- `src/lib/actions/submitTarasForm.ts` — file to create
- `src/lib/validations/tarasForm.ts` — file to create
