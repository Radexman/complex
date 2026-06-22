import type { Metadata } from 'next';

import { allProjectsQuery } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';
import ProjectsGrid from '@/app/components/sections/ProjectsGrid';

export const metadata: Metadata = {
  title: 'Realizacje — Complex',
  description:
    'Przeglądaj nasze zrealizowane projekty tarasów, zadaszeń, żaluzji i schodów modułowych na terenie Śląska i Opolszczyzny.',
};

export default async function RealizacjePage() {
  const { data: projects } = await sanityFetch({ query: allProjectsQuery });

  return <ProjectsGrid projects={projects} />;
}
