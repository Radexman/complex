import { sanityFetch } from '@/sanity/lib/live';
import { announcementBannerQuery } from '@/sanity/lib/queries';
import AnnouncementBannerMount from '@/app/components/layout/AnnouncementBannerMount';

/**
 * Fetches the CMS-managed announcement banner and computes its active window
 * server-side, so an expired or disabled banner never reaches the client at
 * all — no HTML, no hydration cost.
 */
export default async function AnnouncementBar() {
  const { data: banner } = await sanityFetch({ query: announcementBannerQuery });

  if (!banner || !banner.isEnabled || new Date(banner.endsAt) <= new Date()) {
    return null;
  }

  return (
    <AnnouncementBannerMount
      text={banner.text}
      endsAt={banner.endsAt}
      ctaLabel={banner.ctaLabel}
      ctaHref={banner.ctaHref}
    />
  );
}
