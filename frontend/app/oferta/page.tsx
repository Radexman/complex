import type { Metadata } from 'next';

import { allServicesQuery, ofertaPageQuery } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';
import { buildSeoMetadata } from '@/app/lib/buildSeoMetadata';
import OfferIndexGrid from '@/app/components/offer/OfferIndexGrid';

export async function generateMetadata(): Promise<Metadata> {
  // Metadata should never contain stega
  const { data } = await sanityFetch({ query: ofertaPageQuery, stega: false });

  // The root layout appends the site name via its `title.template`.
  return buildSeoMetadata(data?.seo, {
    title: 'Oferta',
    description:
      'Poznaj pełną ofertę CComplex — zadaszenia tarasowe, tarasy kompozytowe, gresowe i drewniane, żaluzje tarasowe oraz schody modułowe na terenie Śląska i Opolszczyzny.',
  });
}

export default async function OfertaPage() {
  const [{ data: page }, { data: services }] = await Promise.all([
    sanityFetch({ query: ofertaPageQuery }),
    sanityFetch({ query: allServicesQuery }),
  ]);

  return <OfferIndexGrid page={page} services={services} />;
}
