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

/**
 * Bento sizing. Cells are uniform squares on `md`+ so rows align deterministically
 * at any width (mismatched per-cell aspect ratios are what had to be reworked out of
 * OfferGallery). Two cells break the rhythm:
 *
 *  - the first card is a 2×2 hero (`aspect-auto` lets the grid span define its size);
 *  - a trailing card that would otherwise sit alone on its own row spans the full
 *    width as a cinematic banner, so the odd 7th offer reads as intentional.
 *
 * With the current 7 services this tiles a 3-col grid with no empty cells:
 * hero + 2 squares (rows 1–2), 3 squares (row 3), full-width banner (row 4).
 * Mobile is a plain single-column stack.
 */
function bentoSpan(index: number, total: number): 'hero' | 'banner' | 'square' {
  if (index === 0) return 'hero';
  // Cells consumed before this card: the hero takes 4, every other card takes 1.
  const cellsBefore = 4 + (index - 1);
  if (index === total - 1 && cellsBefore % 3 === 0) return 'banner';
  return 'square';
}

// The `md:` aspect ratio belongs here rather than on the base class: two competing
// `md:aspect-*` utilities resolve by stylesheet order, not by which one is "more
// specific", so a base `md:aspect-square` silently wins over the banner's ratio.
const SPAN_CLASSES: Record<ReturnType<typeof bentoSpan>, string> = {
  hero: 'md:col-span-2 md:row-span-2 md:aspect-auto',
  banner: 'md:col-span-3 md:aspect-21/6',
  square: 'md:aspect-square',
};

const TITLE_CLASSES: Record<ReturnType<typeof bentoSpan>, string> = {
  hero: 'text-2xl md:text-3xl',
  banner: 'text-3xl md:text-5xl',
  square: 'text-xl',
};

function ServiceCard({ service, span }: { service: Service; span: ReturnType<typeof bentoSpan> }) {
  const isWide = span !== 'square';
  // Banner cards are a wide letterbox; the rest crop close to square.
  const imageUrl = service.heroImage?.asset
    ? urlForImage(service.heroImage)
        .width(1400)
        .height(span === 'banner' ? 500 : 1000)
        .fit('crop')
        .quality(80)
        .url()
    : undefined;

  // Details are hidden on narrow cards from `md` up (no room), but shown on mobile
  // where every card is full-width anyway.
  const detailsClass = isWide ? '' : 'md:hidden';

  return (
    <article
      data-offer-card
      className={`group relative aspect-4/3 overflow-hidden rounded-xl bg-bg-surface sm:aspect-video ${SPAN_CLASSES[span]}`}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={service.heroImage?.alt || service.title}
          fill
          // The hero card is above the fold and is the page's LCP element.
          priority={span === 'hero'}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 66vw, 800px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent transition-all duration-500 group-hover:from-black/90" />

      {/* Quotation-form shortcut. A sibling of the card link (never nested inside it) —
          `z-10` lifts it above the card link's stretched ::after overlay. */}
      {service.relatedFormSlug && (
        <Link
          href={`/wycena/${stegaClean(service.relatedFormSlug)}`}
          className="absolute right-3 top-3 z-10 rounded-full bg-accent/90 px-3 py-1 font-heading text-xs font-semibold text-black opacity-0 transition-opacity duration-300 hover:bg-accent focus-visible:opacity-100 group-hover:opacity-100"
        >
          Formularz wyceny →
        </Link>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6">
        <h2 className={`font-heading font-bold leading-tight text-white ${TITLE_CLASSES[span]}`}>
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
          <p className={`mt-1 line-clamp-1 max-w-xl font-body text-sm text-white/70 ${detailsClass}`}>
            {service.heroSubheadline}
          </p>
        )}
        <span
          className={`mt-3 inline-flex items-center gap-1 font-heading text-xs font-semibold text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${detailsClass}`}
        >
          Dowiedz się więcej
          <ArrowRight size={14} aria-hidden="true" />
        </span>
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
        <div data-offer-grid className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard
              key={service._id}
              service={service}
              span={bentoSpan(index, services.length)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
