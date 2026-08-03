'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';
import { stegaClean } from 'next-sanity';

import type { WycenaPageQueryResult } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';

gsap.registerPlugin(ScrollTrigger);

type WycenaPage = NonNullable<WycenaPageQueryResult>;
type FormCard = NonNullable<WycenaPage['forms']>[number];

/**
 * Same bento sizing rules as the offer index (`OfferIndexGrid`): uniform squares
 * on `md`+ so rows align at any width, with the first card as a 2×2 hero and a
 * lone trailing card widened into a banner. With the four quotation forms this
 * tiles a 3-column grid exactly: hero (2×2) + 2 squares, then a full-width banner.
 */
function bentoSpan(index: number, total: number): 'hero' | 'banner' | 'square' {
  if (index === 0) return 'hero';
  const cellsBefore = 4 + (index - 1);
  if (index === total - 1 && cellsBefore % 3 === 0) return 'banner';
  return 'square';
}

// The `md:` aspect ratio lives only here — two competing `md:aspect-*` utilities
// resolve by stylesheet order, so a base ratio would silently beat the banner's.
const SPAN_CLASSES: Record<ReturnType<typeof bentoSpan>, string> = {
  hero: 'md:col-span-2 md:row-span-2 md:aspect-auto',
  banner: 'md:col-span-3 md:aspect-21/6',
  square: 'md:aspect-square',
};

const TITLE_CLASSES: Record<ReturnType<typeof bentoSpan>, string> = {
  hero: 'text-2xl md:text-4xl',
  banner: 'text-2xl md:text-4xl',
  square: 'text-xl',
};

function FormCardTile({ card, span }: { card: FormCard; span: ReturnType<typeof bentoSpan> }) {
  const href = `/wycena/${stegaClean(card.formSlug)}`;
  const imageUrl = card.image?.asset
    ? urlForImage(card.image)
        .width(1400)
        .height(span === 'banner' ? 500 : 1000)
        .fit('crop')
        .quality(80)
        .url()
    : undefined;

  return (
    <article
      data-wycena-card
      className={`group relative aspect-4/3 overflow-hidden rounded-xl bg-bg-surface sm:aspect-video ${SPAN_CLASSES[span]}`}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={card.image?.alt || card.title}
          fill
          priority={span === 'hero'}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 66vw, 800px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/10 transition-all duration-500 group-hover:from-black/90" />

      {card.badge && (
        <span className="absolute top-4 left-4 rounded-full bg-accent px-3 py-1 font-heading text-xs font-semibold text-black">
          {card.badge}
        </span>
      )}

      {/* Spans the whole tile (not just the bottom strip) so the stretched link's
          ::after — which positions against this, its nearest positioned ancestor —
          covers the entire card, image included. Content still sits at the bottom. */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <h2 className={`font-heading leading-tight font-bold text-white ${TITLE_CLASSES[span]}`}>
          {/* Stretched link — the whole tile is clickable while the title stays
              the anchor's accessible name (no nested anchors). */}
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {card.title}
          </Link>
        </h2>
        {card.description && (
          <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-white/70">
            {card.description}
          </p>
        )}
        {/* Sibling of the card link, never nested inside it — `z-10` lifts it above
            the stretched ::after so it takes the click. Same destination as the
            title link, so it stays out of the tab order. */}
        <div className="relative z-10 mt-4 flex transition-opacity duration-300 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
          <Link
            href={href}
            tabIndex={-1}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-heading text-xs font-semibold text-black transition-colors hover:bg-accent-hover"
          >
            Wypełnij formularz
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function WycenaIndexGrid({ page }: { page: WycenaPage }) {
  const container = useRef<HTMLDivElement>(null);
  const forms = page.forms ?? [];

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-wycena-hero-left]', { x: -30, opacity: 0 });
      gsap.set('[data-wycena-hero-right]', { x: 30, opacity: 0 });
      gsap.set('[data-wycena-card]', { y: 50, opacity: 0 });

      gsap.to('[data-wycena-hero-left], [data-wycena-hero-right]', {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.to('[data-wycena-card]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: {
          trigger: '[data-wycena-grid]',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: container, dependencies: [forms.length] },
  );

  return (
    <div ref={container} className="min-h-screen bg-bg-deep">
      <header className="border-b border-graphite bg-bg-mid pt-28 pb-16 md:pb-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-end gap-8 px-6 md:grid-cols-2 md:gap-12 md:px-12">
          <div data-wycena-hero-left>
            {page.eyebrow && (
              <p className="mb-3 text-xs font-semibold tracking-widest text-accent uppercase">
                {page.eyebrow}
              </p>
            )}
            <h1 className="font-heading text-5xl leading-none font-bold text-white md:text-7xl">
              {page.headline || 'Wycena'}
            </h1>
          </div>
          {page.subheadline && (
            <div data-wycena-hero-right className="border-t border-accent/30 pt-6">
              <p className="font-body text-base leading-relaxed text-silver">{page.subheadline}</p>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 pb-24 md:px-12">
        <div data-wycena-grid className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {forms.map((card, index) => (
            <FormCardTile key={card._key} card={card} span={bentoSpan(index, forms.length)} />
          ))}
        </div>
      </div>
    </div>
  );
}
