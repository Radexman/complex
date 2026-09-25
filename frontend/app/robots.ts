import { MetadataRoute } from 'next';

import { resolveSiteUrl } from '@/app/lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolveSiteUrl({ configuredUrl: process.env.NEXT_PUBLIC_SITE_URL });

  return {
    // The wildcard rule already allows everything, including OAI-SearchBot — this entry is
    // just an explicit confirmation the client asked for in her AI-visibility SEO notes.
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
