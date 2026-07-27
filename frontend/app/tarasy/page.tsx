import type { Metadata } from 'next';

import { tarasyPageQuery, terraceServicesQuery } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';
import TarasyLanding from '@/app/components/tarasy/TarasyLanding';

export const metadata: Metadata = {
  title: 'Tarasy kompozytowe, gresowe i drewniane',
  description:
    'Tarasy kompozytowe, gresowe i drewniane — wybierz rodzaj tarasu, zobacz realizacje i zamów bezpłatną wycenę. Śląsk i Opolszczyzna.',
};

export default async function TarasyPage() {
  const [{ data: page }, { data: services }] = await Promise.all([
    sanityFetch({ query: tarasyPageQuery }),
    sanityFetch({ query: terraceServicesQuery }),
  ]);

  return <TarasyLanding page={page} services={services} />;
}
