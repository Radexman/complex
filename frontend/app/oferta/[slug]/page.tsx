import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { stegaClean } from 'next-sanity';

import { client } from '@/sanity/lib/client';
import { sanityFetch } from '@/sanity/lib/live';
import {
  bottomCtaQuery,
  galleryProjectsByCategoryQuery,
  serviceBySlugQuery,
  serviceSlugsQuery,
} from '@/sanity/lib/queries';
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

  return {
    title: `${service.title} — Complex`,
    description: service.seoDescription ?? undefined,
  };
}

export default async function OfferRoutePage({ params }: PageProps) {
  const { slug } = await params;
  const { data: service } = await sanityFetch({
    query: serviceBySlugQuery,
    params: { slug },
  });

  if (!service) notFound();

  // Gallery projects share the `project` pool, filtered to this service's category.
  // Contact/showroom data is shared with the home page (single `bottomCtaSection` source).
  const [{ data: galleryProjects }, { data: contact }] = await Promise.all([
    sanityFetch({
      query: galleryProjectsByCategoryQuery,
      params: { category: stegaClean(service.category) },
    }),
    sanityFetch({ query: bottomCtaQuery }),
  ]);

  return <OfferPage service={service} galleryProjects={galleryProjects} contact={contact} />;
}
