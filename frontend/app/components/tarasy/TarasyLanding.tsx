'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';

import type { TarasyPageQueryResult, TerraceServicesQueryResult } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';

gsap.registerPlugin(ScrollTrigger);

type TerraceService = TerraceServicesQueryResult[number];

/** Fixed display order for the three terrace categories. */
const TERRACE_ORDER = ['tarasy-kompozytowe', 'tarasy-gresowe', 'tarasy-drewniane'];

/**
 * Bento sizing: the first card becomes a 2×2 hero on `md`+ (its `aspect-auto` lets
 * the grid span define its size); the other two stack as squares in the third column.
 * Mobile is a plain single-column square stack. Same proven pattern as OfferGallery.
 */
function bentoClass(index: number): string {
  return index === 0 ? 'md:col-span-2 md:row-span-2 md:aspect-auto' : '';
}

function TerraceCard({ service, className }: { service: TerraceService; className: string }) {
  const imageUrl = service.heroImage?.asset
    ? urlForImage(service.heroImage).width(1200).height(1200).fit('crop').quality(80).url()
    : undefined;

  return (
    <Link
      href={`/oferta/${service.slug}`}
      data-terrace-card
      className={`group relative aspect-square overflow-hidden rounded-xl bg-bg-surface ${className}`}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={service.heroImage?.alt || service.title}
          fill
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent transition-all duration-500 group-hover:from-black/90" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <h2 className="font-heading text-2xl font-bold leading-tight text-white md:text-3xl">
          {service.title}
        </h2>
        {service.heroSubheadline && (
          <p className="mt-1 line-clamp-2 max-w-md font-body text-sm text-white/70">
            {service.heroSubheadline}
          </p>
        )}
        <span className="mt-3 inline-flex items-center gap-1 font-heading text-sm font-semibold text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Zobacz ofertę
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export default function TarasyLanding({
  page,
  services,
}: {
  page: TarasyPageQueryResult;
  services: TerraceServicesQueryResult;
}) {
  const container = useRef<HTMLDivElement>(null);

  const sorted = [...services].sort(
    (a, b) => TERRACE_ORDER.indexOf(a.slug) - TERRACE_ORDER.indexOf(b.slug),
  );

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-tarasy-hero]', { y: 30, opacity: 0 });
      gsap.set('[data-terrace-card]', { y: 50, opacity: 0 });

      gsap.to('[data-tarasy-hero]', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
      });

      gsap.to('[data-terrace-card]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: '[data-terrace-grid]',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: container, dependencies: [services] },
  );

  return (
    <div ref={container} className="min-h-screen bg-bg-deep pt-28">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <header className="max-w-3xl">
          {page?.eyebrow && (
            <p
              data-tarasy-hero
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent"
            >
              {page.eyebrow}
            </p>
          )}
          <h1
            data-tarasy-hero
            className="font-heading text-4xl font-bold leading-tight text-white md:text-6xl"
          >
            {page?.headline || 'Tarasy'}
          </h1>
          {page?.subheadline && (
            <p data-tarasy-hero className="mt-5 max-w-2xl font-body text-base text-silver md:text-lg">
              {page.subheadline}
            </p>
          )}
        </header>

        <div
          data-terrace-grid
          className="mt-12 grid grid-cols-1 gap-4 pb-24 md:grid-cols-3"
        >
          {sorted.map((service, index) => (
            <TerraceCard key={service._id} service={service} className={bentoClass(index)} />
          ))}
        </div>
      </div>
    </div>
  );
}
