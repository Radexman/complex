import { MetadataRoute } from 'next';

import { resolveSiteUrl } from '@/app/lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolveSiteUrl({ configuredUrl: process.env.NEXT_PUBLIC_SITE_URL });

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
