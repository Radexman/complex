'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';
import { stegaClean } from 'next-sanity';

import type { AllServicesQueryResult, OfertaPageQueryResult } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';

gsap.registerPlugin(ScrollTrigger);

type Service = AllServicesQueryResult[number];

function ServiceCard({ service, priority }: { service: Service; priority: boolean }) {
  const imageUrl = service.heroImage?.asset
    ? urlForImage(service.heroImage).width(900).height(675).fit('crop').quality(80).url()
    : undefined;

  return (
    <article
      data-offer-card
      className="group relative aspect-4/3 overflow-hidden rounded-xl bg-bg-surface"
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={service.heroImage?.alt || service.title}
          fill
          // The first-rendered card is the most likely LCP element now that
          // there's no dedicated hero cell.
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent transition-all duration-500 group-hover:from-black/90" />

      {/* Sits above the stretched card link's ::after overlay so it stays visible,
          but is not interactive — the whole card still opens the offer. */}
      {service.isNew && (
        <span className="pointer-events-none absolute left-6 top-6 z-10 rounded-full bg-accent px-3 py-1 font-heading text-xs font-semibold uppercase tracking-wide text-black">
          Nowość
        </span>
      )}

      {/* Spans the whole card (not just the bottom strip) so the stretched link's
          ::after — which positions against this, its nearest positioned ancestor —
          covers the entire card, image included. Content still sits at the bottom. */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <h2 className="font-heading text-xl font-bold leading-tight text-white">
          {/* Stretched link: the ::after overlay makes the whole card clickable while
              keeping the title as the anchor's accessible name (no nested anchors). */}
          <Link
            href={`/oferta/${service.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {service.title}
          </Link>
        </h2>
        {service.heroSubheadline && (
          <p className="mt-1 line-clamp-1 max-w-xl font-body text-sm text-white/70">
            {service.heroSubheadline}
          </p>
        )}
        {/* Action buttons. Siblings of the card link, never nested inside it —
            `z-10` lifts the row above the stretched ::after overlay so the
            buttons stay clickable. Revealed on hover from `md` up; always shown
            on touch widths, where there is no hover to reveal them. */}
        <div className="relative z-10 mt-4 flex flex-wrap gap-2 transition-opacity duration-300 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
          <Link
            href={`/oferta/${service.slug}`}
            // Same destination as the title link — kept out of the tab order so
            // keyboard users don't hit the card twice.
            tabIndex={-1}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 font-heading text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
          >
            Dowiedz się więcej
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          {service.relatedFormSlug && (
            <Link
              href={`/wycena/${stegaClean(service.relatedFormSlug)}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-heading text-xs font-semibold text-black transition-colors hover:bg-accent-hover"
            >
              Formularz wyceny
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function OfferIndexGrid({
  page,
  services,
}: {
  page: OfertaPageQueryResult;
  services: AllServicesQueryResult;
}) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-offer-hero-left]', { x: -30, opacity: 0 });
      gsap.set('[data-offer-hero-right]', { x: 30, opacity: 0 });
      gsap.set('[data-offer-card]', { y: 50, opacity: 0 });

      gsap.to('[data-offer-hero-left], [data-offer-hero-right]', {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.to('[data-offer-card]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: {
          trigger: '[data-offer-grid]',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: container, dependencies: [services] },
  );

  return (
    <div ref={container} className="min-h-screen bg-bg-deep">
      <header className="border-b border-graphite bg-bg-mid pb-16 pt-28 md:pb-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-end gap-8 px-6 md:grid-cols-2 md:gap-12 md:px-12">
          <div data-offer-hero-left>
            {page?.eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
                {page.eyebrow}
              </p>
            )}
            <h1 className="font-heading text-5xl font-bold leading-none text-white md:text-7xl">
              {page?.headline || 'Oferta'}
            </h1>
          </div>
          {page?.subheadline && (
            <div data-offer-hero-right className="border-t border-accent/30 pt-6">
              <p className="font-body text-base leading-relaxed text-silver">{page.subheadline}</p>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 pb-24 md:px-12">
        <div
          data-offer-grid
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service, index) => (
            <ServiceCard key={service._id} service={service} priority={index === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}
