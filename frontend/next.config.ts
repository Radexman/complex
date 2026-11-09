import type { NextConfig } from 'next';

/** Parent path of every offer page on the old WordPress site. */
const WP_OFFER = '/oferta-zadaszenia-aluminiowe-tarasy-uslugi-kierownik-budowy';

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
      // Addresses from the old WordPress site, which are still indexed by Google and
      // linked from elsewhere. Pages with no equivalent (news posts, tags) stay 404 on
      // purpose: sending them to an unrelated page would only produce soft 404s.
      { source: '/formularze-wycen', destination: '/wycena', permanent: true },
      {
        source: '/formularze-wycen/formularz-wyceny-tarasu',
        destination: '/wycena/taras',
        permanent: true,
      },
      {
        source: '/formularze-wycen/formularz-wyceny-zadaszenia',
        destination: '/wycena/zadaszenie',
        permanent: true,
      },
      {
        source: '/formularze-wycen/formularz-wyceny-zaluzji',
        destination: '/wycena/zaluzje',
        permanent: true,
      },
      {
        source: '/formularze-wycen/formularz-wyceny-schodow',
        destination: '/wycena/schody',
        permanent: true,
      },
      {
        source: '/formularze-wycen/formularz-kontaktowy',
        destination: '/#kontakt',
        permanent: true,
      },
      { source: '/kontakt', destination: '/#kontakt', permanent: true },
      { source: '/wyslij-zapytanie', destination: '/wycena', permanent: true },
      { source: '/realizacje/:path+', destination: '/realizacje', permanent: true },
      { source: WP_OFFER, destination: '/oferta', permanent: true },
      // `:path*` also covers the old per-brand subpages (deponti, silvadec, …).
      {
        source: `${WP_OFFER}/zadaszenia-aluminiowe/:path*`,
        destination: '/oferta/zadaszenia-tarasowe',
        permanent: true,
      },
      {
        source: `${WP_OFFER}/zaluzje-tarasowe`,
        destination: '/oferta/akcesoria-do-zadaszen',
        permanent: true,
      },
      {
        source: `${WP_OFFER}/tarasy-kompozytowe/:path*`,
        destination: '/oferta/tarasy-kompozytowe',
        permanent: true,
      },
      {
        source: `${WP_OFFER}/tarasy-z-plyt-gresowych`,
        destination: '/oferta/tarasy-gresowe',
        permanent: true,
      },
      {
        source: `${WP_OFFER}/tarasy-drewniane`,
        destination: '/oferta/tarasy-drewniane',
        permanent: true,
      },
      {
        source: `${WP_OFFER}/schody-modulowe`,
        destination: '/oferta/schody-modulowe',
        permanent: true,
      },
      { source: `${WP_OFFER}/elewacje-kompozytowe`, destination: '/oferta', permanent: true },
      // The construction-site manager service is no longer offered (client, 9.11.2026).
      { source: '/kierownik-budowy', destination: '/oferta', permanent: true },
      { source: '/kierownik-budowy/:path+', destination: '/oferta', permanent: true },
    ];
  },
};

export default nextConfig;
