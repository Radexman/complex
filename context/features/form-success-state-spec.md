# Form Success State — Spec

## Overview

Build a shared `FormSuccessState` component that replaces the minimal success message currently specified in all five form specs (`TarasForm`, `ZadaszenieForm`, `ZaluzjeForm`, `SchodForm`, `ContactForm`). After a successful submission, the form is replaced by a confirmation panel that acknowledges the submission, summarises what happens next using an inline version of the `ProcessTimeline` steps, and offers two navigation CTAs. The timeline steps are fetched from `siteSettings.processTimeline` at the page level and passed down as props — no additional Sanity schema needed. All visible text in Polish.

---

## File Structure

```
src/
  components/
    forms/
      shared/
        FormSuccessState.tsx      ← new shared component
```

Imported and used in: `TarasForm.tsx`, `ZadaszenieForm.tsx`, `ZaluzjeForm.tsx`, `SchodForm.tsx`, `ContactForm.tsx` — replacing the inline success state currently described in each of those specs.

---

## Sanity

No new schema. Reuses `siteSettings.processTimeline.steps[]` — already defined in `process-timeline-spec.md`. Each page already fetches `siteSettings` — extend those fetches to include `processTimeline.steps` if not already included, and pass the steps array down to the form component → `FormSuccessState`.

---

## Component Requirements

- File: `src/components/forms/shared/FormSuccessState.tsx`
- Props:
  - `formType` — `'taras' | 'zadaszenie' | 'zaluzje' | 'schody' | 'kontakt'` — drives the contextual headline
  - `submittedEmail` — `string` — the email address the customer entered, shown in the confirmation so they know where to expect a reply
  - `steps` — array of `{ number: string, icon: string, title: string, description: string }` — from `siteSettings.processTimeline`
  - `primaryCtaLabel?` — string — optional override for the primary CTA button label
  - `primaryCtaHref?` — string — optional override for the primary CTA href
- `"use client"` is not needed — this is a pure presentational component with no interactivity
- Background: inherits from parent form section — no background set on this component itself
- Entrance: GSAP `y: 30 → 0`, `opacity: 0 → 1`, `duration: 0.8`, `ease: power3.out` on mount via `useEffect` with `gsap.context()`

---

## Layout

Centered column: `max-w-2xl mx-auto text-center py-8`

### 1. Confirmation Header

- `CheckCircle` Lucide icon — `text-accent mx-auto`, size 56, `mb-6`
- Headline: `font-heading text-3xl font-bold text-white` — contextual per `formType`:
  - `taras`: "Zapytanie o taras wysłane!"
  - `zadaszenie`: "Zapytanie o zadaszenie wysłane!"
  - `zaluzje`: "Zapytanie o żaluzje wysłane!"
  - `schody`: "Zapytanie o schody wysłane!"
  - `kontakt`: "Wiadomość wysłana!"
- Subheadline: `font-body text-base text-silver mt-3 max-w-lg mx-auto leading-relaxed`
  - For all quotation forms: `"Dziękujemy! Twoje zapytanie zostało przyjęte. Skontaktujemy się z Tobą na adres {submittedEmail} lub telefonicznie w ciągu 24 godzin roboczych."`
  - For `kontakt`: `"Dziękujemy za wiadomość! Odpiszemy na adres {submittedEmail} najszybciej jak to możliwe."`
- `submittedEmail` rendered as `<span className="text-accent font-medium">{submittedEmail}</span>` inline in the sentence

---

### 2. Divider

- `border-t border-graphite my-10`

---

### 3. "Co dalej?" Process Steps

- Section label above the steps: `font-body text-sm font-semibold text-white mb-6 text-left` — "Co dalej? Oto co możesz oczekiwać:"

- Renders the first **3 steps** from the `steps` array — not all 6. The customer has just completed step 1 (Zapytanie), so showing steps 2, 3, and 4 (Wycena wstępna → Wycena końcowa → Umowa) is the most relevant "what happens next" window. Steps 5–6 (Montaż, Gwarancja) are the distant future and would make the panel feel overwhelming.

- Steps list: `flex flex-col gap-4 text-left`
- Each step row: `flex items-start gap-4`
  - **Left**: step indicator combining number + icon
    - Outer circle: `w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center`
    - Step 1 of the shown 3 (i.e. `steps[1]` — Wycena wstępna): `bg-accent/20 border-2 border-accent` — highlighted as the immediate next step
    - Steps 2–3 of the shown 3: `bg-bg-surface border-2 border-graphite`
    - Icon inside: resolved from `icon` string via the same lookup map used in `ProcessTimeline.tsx` — import the map from `src/lib/iconMap.ts` (or wherever it was extracted), do not duplicate it
    - Icon color: `text-accent` for the highlighted step, `text-silver` for the rest
    - Size: `16`
  - **Right**: text content
    - Step number + title on one line: `font-heading text-sm font-semibold text-white` — e.g. "02 — Wycena wstępna"
    - Description: `font-body text-xs text-silver leading-relaxed mt-0.5`

- Note below the steps: `text-xs text-silver/60 mt-6 italic` — "Oferta zostanie przesłana na adres e-mail podany w formularzu do 7 dni roboczych. Usługi montażowe wykonujemy na terenie województw śląskiego i opolskiego."

---

### 4. CTA Buttons

- `flex gap-4 justify-center mt-10 flex-wrap`
- **Primary** (green): `bg-accent text-black font-semibold rounded-lg px-6 py-3 text-sm hover:bg-accent-hover transition-colors`
  - Default label: "Wróć na stronę główną" → `/`
  - Overridable via `primaryCtaLabel` / `primaryCtaHref` props — e.g. offer pages might pass "Wróć do oferty" → `/oferta`
- **Secondary** (ghost): `border border-graphite text-silver rounded-lg px-6 py-3 text-sm hover:border-accent/50 hover:text-white transition-colors`
  - Label: "Zobacz nasze realizacje" → `/realizacje`
  - Always the same — not overridable

---

## Integration — Updating Existing Form Specs

Update the success state section in each of the following files, replacing the current minimal inline success block with `<FormSuccessState />`:

### `TarasForm.tsx`
```tsx
// replace current inline success state with:
<FormSuccessState
  formType="taras"
  submittedEmail={submittedEmail}
  steps={steps}
  primaryCtaLabel="Wróć na stronę główną"
  primaryCtaHref="/"
/>
```
- `submittedEmail`: captured from form data before the state resets on success (store in a `useState`)
- `steps`: passed as prop from `src/app/wycena/taras/page.tsx` — extend the page's `siteSettings` GROQ query to include `processTimeline.steps`

### `ZadaszenieForm.tsx`, `ZaluzjeForm.tsx`, `SchodForm.tsx`
Same pattern as `TarasForm` with their respective `formType` values. Extend each quotation page's GROQ query to include `processTimeline.steps` and pass to the form component.

### `ContactForm.tsx`
```tsx
<FormSuccessState
  formType="kontakt"
  submittedEmail={submittedEmail}
  steps={steps}
  primaryCtaLabel="Wróć na stronę główną"
  primaryCtaHref="/"
/>
```
Extend `src/app/kontakt/page.tsx` GROQ query to include `processTimeline.steps`.

---

## GSAP Animation

- On mount (when `FormSuccessState` appears after form replacement), run a staggered entrance:
  - Header block (icon + headline + subheadline): `y: 30 → 0`, `opacity: 0 → 1`, `duration: 0.7`, `ease: power3.out`
  - Divider: `opacity: 0 → 1`, `scaleX: 0 → 1`, `transformOrigin: "left"`, `duration: 0.6`, after header
  - Step rows: `x: -20 → 0`, `opacity: 0 → 1`, `stagger: 0.1`, `duration: 0.5`, after divider
  - CTA buttons: `y: 20 → 0`, `opacity: 0 → 1`, `stagger: 0.1`, `duration: 0.5`, last
- Use `gsap.context()` for cleanup

---

## References

- `@context/process-timeline-spec.md` — step data structure, icon lookup map
- `@src/components/sections/ProcessTimeline.tsx` — reference for step rendering and icon map usage
- `@src/components/forms/TarasForm.tsx` — replace existing success state
- `@src/components/forms/ZadaszenieForm.tsx` — replace existing success state
- `@src/components/forms/ZaluzjeForm.tsx` — replace existing success state
- `@src/components/forms/SchodForm.tsx` — replace existing success state
- `@src/components/contact/ContactForm.tsx` — replace existing success state
- `@src/app/wycena/taras/page.tsx` — extend siteSettings GROQ query
- `@src/app/wycena/zadaszenie/page.tsx` — extend siteSettings GROQ query
- `@src/app/wycena/zaluzje/page.tsx` — extend siteSettings GROQ query
- `@src/app/wycena/schody/page.tsx` — extend siteSettings GROQ query
- `@src/app/kontakt/page.tsx` — extend siteSettings GROQ query
- `@src/lib/iconMap.ts` — shared icon lookup map (extract here if not done already)
- `@src/app/globals.css` — CSS variables and utility classes
- `src/components/forms/shared/FormSuccessState.tsx` — file to create
