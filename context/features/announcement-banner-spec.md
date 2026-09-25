# Announcement Banner Spec

## Overview

A thin sticky announcement bar displayed above the Navbar. Fully controlled from Sanity Studio —
toggled on/off, text editable, end date required. Auto-hides when the end date passes. User can
dismiss it manually; dismissal is stored in localStorage and the banner stays hidden for 24 hours.

Design: glassmorphism, consistent with the site's dark design system.

---

## Sanity Schema

**File:** `sanity/schemas/siteSettings.ts` — add `announcementBanner` object field to the existing
`siteSettings` singleton document (do not create a separate document type).

```ts
defineField({
  name: 'announcementBanner',
  title: 'Baner promocyjny',
  type: 'object',
  fields: [
    defineField({
      name: 'isEnabled',
      title: 'Włącz baner',
      type: 'boolean',
      initialValue: false,
      description: 'Odznacz, aby ręcznie ukryć baner niezależnie od daty zakończenia.',
    }),
    defineField({
      name: 'text',
      title: 'Treść banera',
      type: 'string',
      description: 'Np. „Promocja Jesienna — rabat do 15% na zadaszenia tarasowe"',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'endsAt',
      title: 'Data zakończenia promocji',
      type: 'datetime',
      description: 'Baner zostanie automatycznie ukryty po tej dacie.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Przycisk CTA — etykieta (opcjonalnie)',
      type: 'string',
      description: 'Np. „Zapytaj o wycenę". Zostaw puste, aby nie wyświetlać przycisku.',
    }),
    defineField({
      name: 'ctaHref',
      title: 'Przycisk CTA — link',
      type: 'string',
      description: 'Np. /wycena/zadaszenie. Wymagane jeśli podano etykietę CTA.',
    }),
  ],
})
```

Seed initial values in `sanity/lib/initialValues/siteSettings.ts`:

```ts
announcementBanner: {
  isEnabled: false,
  text: 'Promocja Jesienna — rabat do 15% na zadaszenia tarasowe',
  endsAt: '2026-11-30T23:59:00.000Z',
  ctaLabel: 'Zapytaj o wycenę',
  ctaHref: '/wycena/zadaszenie',
}
```

---

## GROQ Query

**File:** `src/sanity/lib/queries.ts` — extend the existing `siteSettingsQuery` to include:

```ts
export const announcementBannerQuery = groq`
  *[_type == "siteSettings"][0].announcementBanner{
    isEnabled,
    text,
    endsAt,
    ctaLabel,
    ctaHref,
  }
`
```

Or add the fields inline to the existing `siteSettingsQuery` if that query is already used in the
root layout — avoid a second fetch.

---

## Data Fetching

**File:** `src/app/layout.tsx`

- Fetch `announcementBanner` data server-side in the root layout alongside existing `siteSettings`
  fetch
- Pass the result as props to `<AnnouncementBanner />` — the component itself is a Client Component
- Compute `isActive` server-side before passing:

```ts
const banner = await sanityFetch({ query: announcementBannerQuery })

const isActive =
  banner?.isEnabled === true &&
  banner?.endsAt != null &&
  new Date(banner.endsAt) > new Date()
```

- Pass `isActive`, `text`, `endsAt`, `ctaLabel`, `ctaHref` as props
- If `isActive` is `false`, render `null` immediately (no HTML output, no hydration)

---

## Component

**File:** `src/components/layout/AnnouncementBanner.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const STORAGE_KEY = 'announcement_dismissed_until'

type Props = {
  isActive: boolean
  text: string
  endsAt: string
  ctaLabel?: string
  ctaHref?: string
}

export function AnnouncementBanner({ isActive, text, endsAt, ctaLabel, ctaHref }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isActive) return
    try {
      const dismissedUntil = localStorage.getItem(STORAGE_KEY)
      if (dismissedUntil && new Date(dismissedUntil) > new Date()) return
    } catch {}
    setVisible(true)
  }, [isActive])

  if (!visible) return null

  function dismiss() {
    try {
      const until = new Date()
      until.setHours(until.getHours() + 24)
      localStorage.setItem(STORAGE_KEY, until.toISOString())
    } catch {}
    setVisible(false)
  }

  const formattedDate = new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(endsAt))

  return (
    <div
      role="banner"
      aria-label="Baner promocyjny"
      className="relative z-50 w-full"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2.5">
        {/* Left spacer — mirrors close button width for visual centering */}
        <div className="w-7 shrink-0 hidden sm:block" aria-hidden />

        {/* Main content */}
        <div className="flex flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm">
          <span className="text-white/90 font-medium">{text}</span>
          <span className="text-white/40 text-xs hidden sm:inline">
            · do {formattedDate}
          </span>
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="ml-1 inline-flex items-center rounded-full border border-accent/50 bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors duration-200"
            >
              {ctaLabel}
            </Link>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="Zamknij baner"
          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
```

---

## Layout Integration

**File:** `src/app/layout.tsx`

Place `<AnnouncementBanner />` as the very first child inside `<body>`, before `<Navbar />`:

```tsx
<body>
  <AnnouncementBanner
    isActive={isActive}
    text={banner?.text ?? ''}
    endsAt={banner?.endsAt ?? ''}
    ctaLabel={banner?.ctaLabel}
    ctaHref={banner?.ctaHref}
  />
  <Navbar />
  {children}
  <Footer />
</body>
```

- Banner sits above Navbar, pushes the entire page down — Navbar is not fixed relative to banner
- Navbar's own `position: sticky top-0` stays unchanged; when banner is visible, Navbar sticks below
  it naturally

---

## Navbar scroll offset adjustment

- The Navbar currently becomes sticky at `top: 0` — this remains correct because the banner is a
  normal flow element above it; when banner is hidden (or user dismissed it), Navbar returns to top
  of viewport as expected
- If any section uses `scroll-mt-*` for anchor link offset (e.g. `#kontakt`, `#wycena`), verify the
  value accounts for Navbar height only — the banner is ephemeral and its height should not be baked
  into scroll offsets

---

## Behaviour Summary

| Condition | Result |
|---|---|
| `isEnabled: false` in Sanity | Banner never renders (server returns `null`) |
| `endsAt` is in the past | `isActive = false` computed server-side; no render |
| `isEnabled: true`, date in future | Banner renders on first visit |
| User clicks ✕ | `localStorage` set for 24h; banner hides immediately |
| User returns within 24h | Banner stays hidden (localStorage check in `useEffect`) |
| User returns after 24h | Banner shows again (if still `isEnabled` and date not passed) |
| User opens new tab | Same localStorage → same 24h window applies |
| End date passes mid-session | Banner stays visible until page reload (acceptable) |

---

## Styling Notes

- `backdrop-filter: blur(12px)` — glassmorphism consistent with `.glass` utility elsewhere
- `background: rgba(255,255,255,0.04)` — same opacity as glass cards on dark background
- `border-bottom: 1px solid rgba(255,255,255,0.08)` — subtle separator from Navbar
- No accent background fill — keeps it subtle; accent color used only for CTA pill border/text
- Font size `text-sm` (14px) — small enough not to compete with Navbar, large enough to read
- `z-index: 50` — above page content, same layer as Navbar; adjust if Navbar uses higher z-index

---

## TypeScript Types

**File:** `src/types/sanity.ts` (or wherever shared types live) — add:

```ts
export type AnnouncementBannerData = {
  isEnabled: boolean
  text: string
  endsAt: string // ISO datetime string
  ctaLabel?: string
  ctaHref?: string
}
```

---

## References

- `src/app/layout.tsx`
- `src/components/layout/Navbar.tsx`
- `sanity/schemas/siteSettings.ts`
- `sanity/lib/initialValues/siteSettings.ts`
- `src/sanity/lib/queries.ts`
- `@context/project-overview.md` (design system: glass, accent color, dark theme)
- `@context/features/navbar-spec.md`
