import { stegaClean } from 'next-sanity';

import { parsePolishAddress } from '@/app/lib/parsePolishAddress';
import { resolveSiteUrl } from '@/app/lib/siteUrl';
import { sanityFetch } from '@/sanity/lib/live';
import { footerQuery, settingsQuery } from '@/sanity/lib/queries';
import { urlForImage } from '@/sanity/lib/utils';

// Operating region named throughout the site's own copy (form fine print, ServiceAreaNotice) —
// not CMS-managed, since it's the same two-voivodeship fact repeated everywhere in hardcoded text.
const AREA_SERVED = ['województwo opolskie', 'województwo śląskie'];

/**
 * Organization + LocalBusiness structured data for the homepage, knowledge-panel eligibility and
 * AI-model discoverability. Sourced from the `footer`/`settings` singletons already rendered
 * elsewhere on the page (Header/Footer) — `sanityFetch` dedupes identical queries within a single
 * request, same pattern already used for `serviceBySlugQuery` on the offer detail page.
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

  const rawAddress = footer.contactAddress ? stegaClean(footer.contactAddress) : undefined;
  const parsedAddress = rawAddress ? parsePolishAddress(rawAddress) : null;
  const address = parsedAddress
    ? {
        '@type': 'PostalAddress',
        streetAddress: parsedAddress.streetAddress,
        postalCode: parsedAddress.postalCode,
        addressLocality: parsedAddress.addressLocality,
        addressCountry: 'PL',
      }
    : rawAddress;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    name,
    'url': siteUrl,
    ...(logoUrl && { logo: logoUrl }),
    ...(footer.contactPhone && { telephone: stegaClean(footer.contactPhone) }),
    ...(footer.contactEmail && { email: stegaClean(footer.contactEmail) }),
    ...(address && { address }),
    areaServed: AREA_SERVED,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
