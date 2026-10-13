import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { stegaClean } from 'next-sanity';

import { client } from '@/sanity/lib/client';
import { sanityFetch } from '@/sanity/lib/live';
import {
  bottomCtaQuery,
  galleryProjectsByCategoryQuery,
  processTimelineQuery,
  serviceBySlugQuery,
  serviceSlugsQuery,
  vatHighlightQuery,
} from '@/sanity/lib/queries';
import { buildSeoMetadata } from '@/app/lib/buildSeoMetadata';
import OfferPage from '@/app/components/offer/OfferPage';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await client.fetch(serviceSlugsQuery);
  return slugs.map(({ slug }) => ({ slug: slug as string }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: service } = await sanityFetch({
    query: serviceBySlugQuery,
    params: { slug },
    stega: false,
  });

  if (!service) return {};

  // New `seo` fields first, then the service's own title, older SEO description
  // and hero image. The root layout appends the site name via its `title.template`.
  return buildSeoMetadata(service.seo, {
    title: service.title,
    description: service.seoDescription,
    ogImage: service.heroImage,
  });
}

export default async function OfferRoutePage({ params }: PageProps) {
  const { slug } = await params;
  const { data: service } = await sanityFetch({
    query: serviceBySlugQuery,
    params: { slug },
  });

  if (!service) notFound();

  // Gallery projects share the `project` pool, filtered to this service's category.
  // Process timeline, VAT highlight and contact/showroom data are shared with the
  // home page (single `processTimeline` / `vatHighlightSection` /
  // `bottomCtaSection` sources).
  const [
    { data: galleryProjects },
    { data: processTimeline },
    { data: vatHighlight },
    { data: contact },
  ] = await Promise.all([
    sanityFetch({
      query: galleryProjectsByCategoryQuery,
      params: { category: stegaClean(service.category) },
    }),
    sanityFetch({ query: processTimelineQuery }),
    sanityFetch({ query: vatHighlightQuery }),
    sanityFetch({ query: bottomCtaQuery }),
  ]);

  return (
    <OfferPage
      service={service}
      galleryProjects={galleryProjects}
      processTimeline={processTimeline}
      vatHighlight={vatHighlight}
      contact={contact}
    />
  );
}
