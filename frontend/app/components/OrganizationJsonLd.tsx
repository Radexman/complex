import { stegaClean } from 'next-sanity';

import { resolveSiteUrl } from '@/app/lib/siteUrl';
import { sanityFetch } from '@/sanity/lib/live';
import { footerQuery, settingsQuery } from '@/sanity/lib/queries';
import { urlForImage } from '@/sanity/lib/utils';

/**
 * Organization structured data for the homepage and knowledge-panel eligibility.
 * Sourced from the `footer`/`settings` singletons already rendered elsewhere on
 * the page (Header/Footer) — `sanityFetch` dedupes identical queries within a
 * single request, same pattern already used for `serviceBySlugQuery` on the
 * offer detail page.
 */
export default async function OrganizationJsonLd() {
  const [{ data: settings }, { data: footer }] = await Promise.all([
    sanityFetch({ query: settingsQuery, stega: false }),
    sanityFetch({ query: footerQuery, stega: false }),
  ]);

  if (!footer) return null;

  const siteUrl = resolveSiteUrl({ configuredUrl: process.env.NEXT_PUBLIC_SITE_URL });
  const name = stegaClean(settings?.title) || stegaClean(footer.contactName) || 'Complex';
  const logoUrl = footer.logo?.logoImage?.asset
    ? urlForImage(footer.logo.logoImage).width(512).url()
    : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: siteUrl,
    ...(logoUrl && { logo: logoUrl }),
    ...(footer.contactPhone && { telephone: stegaClean(footer.contactPhone) }),
    ...(footer.contactEmail && { email: stegaClean(footer.contactEmail) }),
    ...(footer.contactAddress && { address: stegaClean(footer.contactAddress) }),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
