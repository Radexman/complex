import type { Metadata } from 'next';

import { sanityFetch } from '@/sanity/lib/live';
import { buildSeoMetadata } from '@/app/lib/buildSeoMetadata';
import { wycenaPageQuery } from '@/sanity/lib/queries';
import WycenaFormList from '@/app/components/wycena/WycenaFormList';

export async function generateMetadata(): Promise<Metadata> {
  // Metadata should never contain stega
  const { data } = await sanityFetch({ query: wycenaPageQuery, stega: false });

  // The root layout appends the site name via its `title.template`.
  return buildSeoMetadata(data?.seo, {
    title: 'Wycena',
    description:
      'Wybierz formularz bezpłatnej wyceny: taras, zadaszenie tarasowe, żaluzje lub schody modułowe. Wypełnienie zajmuje kilka minut i do niczego nie zobowiązuje.',
  });
}

export default async function WycenaIndexPage() {
  const { data: page } = await sanityFetch({ query: wycenaPageQuery });

  if (!page) return null;

  return <WycenaFormList page={page} />;
}
