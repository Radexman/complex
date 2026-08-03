import type { Metadata } from 'next';

import { sanityFetch } from '@/sanity/lib/live';
import { wycenaPageQuery } from '@/sanity/lib/queries';
import WycenaIndexGrid from '@/app/components/wycena/WycenaIndexGrid';

export const metadata: Metadata = {
  // The root layout's title template appends the brand — repeating it here
  // would print it twice.
  title: 'Wycena',
  description:
    'Wybierz formularz bezpłatnej wyceny: taras, zadaszenie tarasowe, żaluzje lub schody modułowe. Wypełnienie zajmuje kilka minut i do niczego nie zobowiązuje.',
};

export default async function WycenaIndexPage() {
  const { data: page } = await sanityFetch({ query: wycenaPageQuery });

  if (!page) return null;

  return <WycenaIndexGrid page={page} />;
}
