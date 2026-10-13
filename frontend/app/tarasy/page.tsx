import type { Metadata } from 'next';

import { tarasyPageQuery, terraceServicesQuery } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';
import { buildSeoMetadata } from '@/app/lib/buildSeoMetadata';
import TarasyLanding from '@/app/components/tarasy/TarasyLanding';

export async function generateMetadata(): Promise<Metadata> {
  // Metadata should never contain stega
  const { data } = await sanityFetch({ query: tarasyPageQuery, stega: false });

  // The root layout appends the site name via its `title.template`.
  return buildSeoMetadata(data?.seo, {
    title: 'Tarasy kompozytowe, gresowe i drewniane',
    description:
      'Tarasy kompozytowe, gresowe i drewniane — wybierz rodzaj tarasu, zobacz realizacje i zamów bezpłatną wycenę. Śląsk i Opolszczyzna.',
  });
}

export default async function TarasyPage() {
  const [{ data: page }, { data: services }] = await Promise.all([
    sanityFetch({ query: tarasyPageQuery }),
    sanityFetch({ query: terraceServicesQuery }),
  ]);

  return <TarasyLanding page={page} services={services} />;
}
