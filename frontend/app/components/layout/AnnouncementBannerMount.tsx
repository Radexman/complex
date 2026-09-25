'use client';

import dynamic from 'next/dynamic';

import type { AnnouncementBannerProps } from './AnnouncementBanner';

// The dismissal check depends on `localStorage`, so there is nothing useful to
// render on the server — mounting client-only avoids a hydration mismatch
// between the SSR guess and the browser's actual dismissal state.
const AnnouncementBanner = dynamic(() => import('./AnnouncementBanner'), { ssr: false });

export default function AnnouncementBannerMount(props: AnnouncementBannerProps) {
  return <AnnouncementBanner {...props} />;
}
