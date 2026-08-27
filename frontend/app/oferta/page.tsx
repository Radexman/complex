import type { Metadata } from 'next';

import { allServicesQuery, ofertaPageQuery } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';
import OfferIndexGrid from '@/app/components/offer/OfferIndexGrid';

export const metadata: Metadata = {
  // The root layout appends the site name via its `title.template`.
  title: 'Oferta',
  description:
    'Poznaj pełną ofertę CComplex — zadaszenia tarasowe, tarasy kompozytowe, gresowe i drewniane, żaluzje tarasowe oraz schody modułowe na terenie Śląska i Opolszczyzny.',
};

export default async function OfertaPage() {
  const [{ data: page }, { data: services }] = await Promise.all([
    sanityFetch({ query: ofertaPageQuery }),
    sanityFetch({ query: allServicesQuery }),
  ]);

  return <OfferIndexGrid page={page} services={services} />;
}
