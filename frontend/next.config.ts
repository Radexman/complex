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
    ];
  },
};

export default nextConfig;
