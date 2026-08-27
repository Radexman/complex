import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import LegalDocument from '@/app/components/legal/LegalDocument';
import { sanityFetch } from '@/sanity/lib/live';
import { legalPageQuery } from '@/sanity/lib/queries';

export async function generateMetadata(): Promise<Metadata> {
  const { data: page } = await sanityFetch({
    query: legalPageQuery,
    // Metadata should never contain stega
    stega: false,
  });

  return {
    // The root layout appends the site name via its `title.template`.
    title: page?.title ?? 'Polityka prywatności',
    description: page?.seoDescription ?? undefined,
  };
}

export default async function PolitykaPrywatnosciPage() {
  const { data: page } = await sanityFetch({ query: legalPageQuery });

  if (!page) notFound();

  return <LegalDocument page={page} />;
}
