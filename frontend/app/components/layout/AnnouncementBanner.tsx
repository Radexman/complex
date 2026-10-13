'use client';

import { useState } from 'react';
import Link from 'next/link';
import { stegaClean } from 'next-sanity';
import { Megaphone, X } from 'lucide-react';

const STORAGE_KEY = 'announcement_dismissed_until';

function isDismissed(): boolean {
  try {
    const dismissedUntil = localStorage.getItem(STORAGE_KEY);
    return Boolean(dismissedUntil && new Date(dismissedUntil) > new Date());
  } catch {
    // localStorage unavailable (private mode, blocked) — fall through and show the banner
    return false;
  }
}

type BannerTheme = {
  bar: string;
  icon: string;
  text: string;
  date: string;
  cta: string;
  close: string;
};

/**
 * Colour presets picked in the Studio („Kolor banera”). Full class literals so
 * Tailwind can see them. `brand` is the original glass strip; the others are
 * solid fills, each with text and CTA colours that stay readable on it.
 */
const BANNER_THEMES: Record<string, BannerTheme> = {
  brand: {
    bar: 'border-graphite bg-white/4 backdrop-blur-xl',
    icon: 'text-accent',
    text: 'text-white/90',
    date: 'text-white/40',
    cta: 'border-accent/60 bg-accent/10 text-accent hover:bg-accent hover:text-black',
    close: 'text-white/40 hover:bg-white/10 hover:text-white',
  },
  red: {
    bar: 'border-red-900 bg-red-700',
    icon: 'text-white',
    text: 'text-white',
    date: 'text-white/80',
    cta: 'border-white/70 bg-white/10 text-white hover:bg-white hover:text-red-700',
    close: 'text-white/80 hover:bg-white/15 hover:text-white',
  },
  orange: {
    bar: 'border-orange-900 bg-orange-700',
    icon: 'text-white',
    text: 'text-white',
    date: 'text-white/80',
    cta: 'border-white/70 bg-white/10 text-white hover:bg-white hover:text-orange-700',
    close: 'text-white/80 hover:bg-white/15 hover:text-white',
  },
  yellow: {
    bar: 'border-yellow-600 bg-yellow-400',
    icon: 'text-black',
    text: 'text-black',
    date: 'text-black/70',
    cta: 'border-black/60 bg-black/5 text-black hover:bg-black hover:text-yellow-400',
    close: 'text-black/70 hover:bg-black/10 hover:text-black',
  },
  blue: {
    bar: 'border-blue-900 bg-blue-700',
    icon: 'text-white',
    text: 'text-white',
    date: 'text-white/80',
    cta: 'border-white/70 bg-white/10 text-white hover:bg-white hover:text-blue-700',
    close: 'text-white/80 hover:bg-white/15 hover:text-white',
  },
  graphite: {
    bar: 'border-white/10 bg-graphite',
    icon: 'text-silver',
    text: 'text-white',
    date: 'text-white/60',
    cta: 'border-white/60 bg-white/5 text-white hover:bg-white hover:text-black',
    close: 'text-white/60 hover:bg-white/10 hover:text-white',
  },
};

export type AnnouncementBannerProps = {
  text: string;
  endsAt: string;
  ctaLabel?: string;
  ctaHref?: string;
  color?: string;
};

/**
 * Sits inside the same fixed top strip as the Navbar (see layout.tsx) — a
 * dismissed/inactive banner simply isn't in the DOM, so the Navbar moves up
 * to fill the gap with no coordination needed between the two components.
 *
 * Mounted client-only via `AnnouncementBannerMount` (`dynamic(..., { ssr: false })`)
 * so the dismissal check can read `localStorage` in a lazy `useState` initializer
 * instead of a `useEffect` — this repo's `react-hooks/set-state-in-effect` rule is
 * an error, and there is nothing useful to render on the server for state that
 * only exists in the browser anyway.
 */
export default function AnnouncementBanner({
  text,
  endsAt,
  ctaLabel,
  ctaHref,
  color,
}: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(isDismissed);

  if (dismissed) return null;

  function dismiss() {
    try {
      const until = new Date();
      until.setHours(until.getHours() + 24);
      localStorage.setItem(STORAGE_KEY, until.toISOString());
    } catch {
      // ignore — the banner still hides for this session
    }
    setDismissed(true);
  }

  // stegaClean strips Visual Editing markers; unset or unknown values (the
  // existing document predates the field) keep the original brand look.
  const theme = BANNER_THEMES[stegaClean(color) ?? 'brand'] ?? BANNER_THEMES.brand;

  const formattedDate = new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(endsAt));

  return (
    <div
      role="banner"
      aria-label="Baner promocyjny"
      className={`relative z-10 w-full animate-[nav-slide-down_0.45s_cubic-bezier(0.22,1,0.36,1)] border-b ${theme.bar}`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center gap-3 px-4 py-2.5 md:px-8">
        <Megaphone
          className={`hidden h-4 w-4 shrink-0 sm:block ${theme.icon}`}
          aria-hidden="true"
        />

        <div className="flex flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm">
          <span className={`font-medium ${theme.text}`}>{text}</span>
          <span className={`hidden text-xs sm:inline ${theme.date}`}>· do {formattedDate}</span>
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className={`ml-1 inline-flex items-center rounded-full border px-3 py-0.5 font-heading text-xs font-semibold transition-colors duration-200 ${theme.cta}`}
            >
              {ctaLabel}
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Zamknij baner"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${theme.close}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
