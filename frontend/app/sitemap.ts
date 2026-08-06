import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

import { resolveSiteUrl } from '@/app/lib/siteUrl';
import { client } from '@/sanity/lib/client';
import { sitemapQuery } from '@/sanity/lib/queries';

/**
 * This file creates a sitemap (sitemap.xml) for the application. Learn more about sitemaps in Next.js here: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 *
 * Every indexable route is listed: the CMS-driven pages, the four quotation
 * forms and one entry per `service` document behind `/oferta/[slug]`. The
 * `/wycena/*​/przeslany-formularz` confirmations are deliberately absent — they
 * carry `robots: noindex` and only render after a real submission.
 */

/**
 * The four form pages render entirely from code, so there is no document date to
 * report. `lastModified` is optional — omitting it beats inventing a build
 * timestamp that changes on every deploy.
 */
const FORM_ROUTES = ['/wycena/taras', '/wycena/zadaszenie', '/wycena/zaluzje', '/wycena/schody'];

/** Sanity returns ISO strings; `null` means the singleton has not been created. */
function lastModified(updatedAt: string | null | undefined) {
  return updatedAt ? new Date(updatedAt) : undefined;
}

async function getBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  // Only touch the request headers when there is no pinned URL — reading them
  // opts the whole sitemap out of static rendering.
  if (configuredUrl?.trim()) return resolveSiteUrl({ configuredUrl });

  const headersList = await headers();
  return resolveSiteUrl({
    host: headersList.get('host'),
    forwardedProto: headersList.get('x-forwarded-proto'),
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [baseUrl, data] = await Promise.all([
    getBaseUrl(),
    // `client` (published perspective) rather than `sanityFetch` — a sitemap must
    // never surface draft-only content, same reasoning as `generateStaticParams`.
    client.fetch(sitemapQuery),
  ]);

  const offerPages: MetadataRoute.Sitemap = data.services.map((service) => ({
    url: `${baseUrl}/oferta/${service.slug}`,
    lastModified: lastModified(service._updatedAt),
    priority: 0.8,
    changeFrequency: 'monthly',
  }));

  const formPages: MetadataRoute.Sitemap = FORM_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    priority: 0.7,
    changeFrequency: 'yearly',
  }));

  return [
    {
      url: baseUrl,
      lastModified: lastModified(data.home),
      priority: 1,
      changeFrequency: 'monthly',
    },
    {
      url: `${baseUrl}/oferta`,
      lastModified: lastModified(data.oferta),
      priority: 0.9,
      changeFrequency: 'monthly',
    },
    ...offerPages,
    {
      url: `${baseUrl}/tarasy`,
      lastModified: lastModified(data.tarasy),
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${baseUrl}/realizacje`,
      lastModified: lastModified(data.realizacje),
      priority: 0.8,
      changeFrequency: 'weekly',
    },
    {
      url: `${baseUrl}/wycena`,
      lastModified: lastModified(data.wycena),
      priority: 0.9,
      changeFrequency: 'monthly',
    },
    ...formPages,
    {
      url: `${baseUrl}/o-nas`,
      lastModified: lastModified(data.oNas),
      priority: 0.7,
      changeFrequency: 'yearly',
    },
  ];
}
