import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  async redirects() {
    return [
      // The offer was renamed „Zadaszenia aluminiowe” → „Zadaszenia tarasowe”, which
      // changed its slug. Keep the old URL working for existing links and search results.
      {
        source: '/oferta/zadaszenia-aluminiowe',
        destination: '/oferta/zadaszenia-tarasowe',
        permanent: true,
      },
      // Same again: „Żaluzje tarasowe” → „Akcesoria do zadaszeń”. The quotation form
      // itself (/wycena/zaluzje) keeps its name — only the offer was renamed.
      {
        source: '/oferta/zaluzje-tarasowe',
        destination: '/oferta/akcesoria-do-zadaszen',
        permanent: true,
      },
      // Elewacje kompozytowe was removed from the offer entirely (client request,
      // Round 7) — send any existing links/search results to the offer index.
      {
        source: '/oferta/elewacje-kompozytowe',
        destination: '/oferta',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
