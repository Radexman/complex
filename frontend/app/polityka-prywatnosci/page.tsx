import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import LegalDocument from '@/app/components/legal/LegalDocument';
import { sanityFetch } from '@/sanity/lib/live';
import { legalPageQuery } from '@/sanity/lib/queries';
import { buildSeoMetadata } from '@/app/lib/buildSeoMetadata';

export async function generateMetadata(): Promise<Metadata> {
  const { data: page } = await sanityFetch({
    query: legalPageQuery,
    // Metadata should never contain stega
    stega: false,
  });

  // New `seo` fields first, then the page title and its older SEO description.
  // The root layout appends the site name via its `title.template`.
  return buildSeoMetadata(page?.seo, {
    title: page?.title || 'Polityka prywatności',
    description: page?.seoDescription,
  });
}

export default async function PolitykaPrywatnosciPage() {
  const { data: page } = await sanityFetch({ query: legalPageQuery });

  if (!page) notFound();

  return <LegalDocument page={page} />;
}
