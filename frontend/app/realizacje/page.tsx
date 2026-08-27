import type { Metadata } from 'next';

import { allProjectsQuery, facebookUrlQuery, realizacjePageQuery } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';
import ProjectsGrid from '@/app/components/sections/ProjectsGrid';

export const metadata: Metadata = {
  title: 'Realizacje — Complex',
  description:
    'Przeglądaj nasze zrealizowane projekty tarasów, zadaszeń, żaluzji i schodów modułowych na terenie Śląska i Opolszczyzny.',
};

export default async function RealizacjePage() {
  const [{ data: projects }, { data: header }, { data: facebookUrl }] = await Promise.all([
    sanityFetch({ query: allProjectsQuery }),
    sanityFetch({ query: realizacjePageQuery }),
    sanityFetch({ query: facebookUrlQuery }),
  ]);

  return <ProjectsGrid projects={projects} header={header} facebookUrl={facebookUrl} />;
}
