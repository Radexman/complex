'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { stegaClean } from 'next-sanity';
import { ChevronDown, ChevronRight } from 'lucide-react';

import type { ServiceBySlugQueryResult } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';

type Service = NonNullable<ServiceBySlugQueryResult>;
type OfferHeroProps = Pick<
  Service,
  'heroImage' | 'heroHeadline' | 'heroSubheadline' | 'title' | 'relatedFormSlug'
>;

export default function OfferHero({
  heroImage,
  heroHeadline,
  heroSubheadline,
  title,
  relatedFormSlug,
}: OfferHeroProps) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from('[data-offer-animate]', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
      });
    },
    { scope: container },
  );

  const bgUrl = heroImage?.asset ? urlForImage(heroImage).width(2400).quality(80).url() : undefined;

  const formSlug = stegaClean(relatedFormSlug);

  return (
    <section ref={container} className="relative flex min-h-screen flex-col overflow-hidden">
      {bgUrl && (
        <Image
          src={bgUrl}
          alt={heroImage?.alt || ''}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pt-28 pb-20">
        <nav
          data-offer-animate
          aria-label="Ścieżka nawigacji"
          className="flex items-center gap-2 text-sm text-silver"
        >
          <Link href="/oferta" className="transition-colors hover:text-white">
            Oferta
          </Link>
          <ChevronRight size={14} className="text-graphite" aria-hidden="true" />
          <span className="text-white">{title}</span>
        </nav>
        <h1
          data-offer-animate
          className="mt-6 max-w-4xl text-balance font-heading text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl"
        >
          {heroHeadline}
        </h1>
        {heroSubheadline && (
          <p data-offer-animate className="mt-4 max-w-xl font-body text-lg text-silver">
            {heroSubheadline}
          </p>
        )}
        {formSlug && (
          <div data-offer-animate>
            <Link
              href={`/wycena/${formSlug}`}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 text-base font-semibold text-black transition-colors hover:bg-accent-hover"
            >
              Bezpłatna wycena
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </div>
      <ChevronDown
        size={28}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white/50"
        aria-hidden="true"
      />
    </section>
  );
}
