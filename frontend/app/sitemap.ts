import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

/**
 * This file creates a sitemap (sitemap.xml) for the application. Learn more about sitemaps in Next.js here: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const domain = headersList.get('host') as string;

  return [
    {
      url: domain,
      lastModified: new Date(),
      priority: 1,
      changeFrequency: 'monthly',
    },
  ];
}
