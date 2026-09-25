'use client';

import { useState } from 'react';
import Link from 'next/link';
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

export type AnnouncementBannerProps = {
  text: string;
  endsAt: string;
  ctaLabel?: string;
  ctaHref?: string;
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

  const formattedDate = new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(endsAt));

  return (
    <div
      role="banner"
      aria-label="Baner promocyjny"
      className="relative z-10 w-full animate-[nav-slide-down_0.45s_cubic-bezier(0.22,1,0.36,1)] border-b border-graphite bg-white/4 backdrop-blur-xl"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center gap-3 px-4 py-2.5 md:px-8">
        <Megaphone className="hidden h-4 w-4 shrink-0 text-accent sm:block" aria-hidden="true" />

        <div className="flex flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm">
          <span className="font-medium text-white/90">{text}</span>
          <span className="hidden text-xs text-white/40 sm:inline">· do {formattedDate}</span>
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="ml-1 inline-flex items-center rounded-full border border-accent/60 bg-accent/10 px-3 py-0.5 font-heading text-xs font-semibold text-accent transition-colors duration-200 hover:bg-accent hover:text-black"
            >
              {ctaLabel}
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Zamknij baner"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/40 transition-colors duration-200 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
