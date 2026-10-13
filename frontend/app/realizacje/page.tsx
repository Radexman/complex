import type { Metadata } from 'next';

import { allProjectsQuery, facebookUrlQuery, realizacjePageQuery } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';
import { buildSeoMetadata } from '@/app/lib/buildSeoMetadata';
import ProjectsGrid from '@/app/components/sections/ProjectsGrid';

export async function generateMetadata(): Promise<Metadata> {
  // Metadata should never contain stega
  const { data } = await sanityFetch({ query: realizacjePageQuery, stega: false });

  // The root layout appends the site name via its `title.template`.
  return buildSeoMetadata(data?.seo, {
    title: 'Realizacje',
    description:
      'Przeglądaj nasze zrealizowane projekty tarasów, zadaszeń, żaluzji i schodów modułowych na terenie Śląska i Opolszczyzny.',
  });
}

export default async function RealizacjePage() {
  const [{ data: projects }, { data: header }, { data: facebookUrl }] = await Promise.all([
    sanityFetch({ query: allProjectsQuery }),
    sanityFetch({ query: realizacjePageQuery }),
    sanityFetch({ query: facebookUrlQuery }),
  ]);

  return <ProjectsGrid projects={projects} header={header} facebookUrl={facebookUrl} />;
}
