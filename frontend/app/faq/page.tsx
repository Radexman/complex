import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { sanityFetch } from '@/sanity/lib/live';
import { faqPageQuery } from '@/sanity/lib/queries';
import { buildSeoMetadata } from '@/app/lib/buildSeoMetadata';
import FaqHero from '@/app/components/faq/FaqHero';
import FaqAccordion from '@/app/components/faq/FaqAccordion';
import FaqCta from '@/app/components/faq/FaqCta';

export async function generateMetadata(): Promise<Metadata> {
  const { data: page } = await sanityFetch({
    query: faqPageQuery,
    // Metadata should never contain stega
    stega: false,
  });

  // New `seo` fields first, then the older dedicated SEO fields. The root
  // layout appends the site name via its `title.template`.
  return buildSeoMetadata(page?.seo, {
    title: page?.seoTitle || 'FAQ — Najczęstsze pytania',
    description: page?.seoDescription,
  });
}

export default async function FaqPage() {
  const { data: page } = await sanityFetch({ query: faqPageQuery });

  if (!page) notFound();

  return (
    <div>
      <FaqHero eyebrow={page.eyebrow} headline={page.headline} subheadline={page.subheadline} />
      <FaqAccordion categories={page.categories} />
      <FaqCta />
    </div>
  );
}
