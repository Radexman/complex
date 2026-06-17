'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { stegaClean } from 'next-sanity';
import {
  ArrowUpRight,
  Boxes,
  House,
  Layers,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Wind,
  type LucideIcon,
} from 'lucide-react';

import type { OfferSection as OfferSectionType } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';

gsap.registerPlugin(ScrollTrigger);

type OfferCardType = NonNullable<OfferSectionType['cards']>[number];

const ICON_MAP: Record<string, LucideIcon> = {
  'layers': Layers,
  'sliders-horizontal': SlidersHorizontal,
  'sparkles': Sparkles,
  'sun': Sun,
  'wind': Wind,
  'shield': Shield,
  'house': House,
  'boxes': Boxes,
};

function cardHref(card: OfferCardType, fallback: string): string {
  const slug = stegaClean(card.offerSlug ?? '');
  return slug ? `/oferta/${slug}` : fallback;
}

function OfferCard({
  card,
  featured,
  fallbackHref,
}: {
  card: OfferCardType;
  featured: boolean;
  fallbackHref: string;
}) {
  const Icon = ICON_MAP[stegaClean(card.icon ?? '')] ?? Layers;
  const imageUrl = card.image?.asset
    ? urlForImage(card.image)
        .width(featured ? 1400 : 900)
        .quality(80)
        .url()
    : undefined;

  return (
    <Link
      href={cardHref(card, fallbackHref)}
      data-offer-card
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-graphite bg-bg-surface p-6 transition-colors duration-300 hover:border-accent/50 md:p-7 ${
        featured ? 'min-h-110 md:col-span-2 lg:row-span-2 lg:min-h-0' : 'min-h-60 lg:min-h-0'
      }`}
    >
      {imageUrl && (
        <>
          <Image
            src={imageUrl}
            alt={card.image?.alt || stegaClean(card.title)}
            fill
            sizes={featured ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 1024px) 100vw, 33vw'}
            className="object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-110"
          />
          <div
            aria-hidden="true"
            className={`absolute inset-0 ${
              featured
                ? 'bg-linear-to-t from-black/85 via-black/40 to-black/10'
                : 'bg-linear-to-t from-black/90 via-black/55 to-black/35'
            }`}
          />
        </>
      )}
      <span
        aria-hidden="true"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 translate-y-1 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
      >
        <ArrowUpRight size={18} />
      </span>
      {!featured && (
        <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 backdrop-blur-sm transition-colors duration-300 group-hover:bg-accent/25">
          <Icon
            className="text-accent transition-all duration-300 group-hover:brightness-125"
            size={20}
            aria-hidden="true"
          />
        </div>
      )}
      <div className="relative z-10 mt-auto pt-6">
        {featured && (
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/15 backdrop-blur-sm">
              <Icon className="text-accent" size={16} aria-hidden="true" />
            </span>
            <span className="font-heading text-sm font-medium text-accent">Wyróżnione</span>
          </div>
        )}
        <h3
          className={`font-heading font-bold text-white transition-colors duration-300 group-hover:text-accent ${
            featured ? 'text-3xl lg:text-4xl' : 'text-2xl'
          }`}
        >
          {card.title}
        </h3>
        {card.description && (
          <p className={`mt-2 font-body text-sm text-silver ${featured ? 'max-w-md' : ''}`}>
            {card.description}
          </p>
        )}
        {featured && card.badges && card.badges.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {card.badges.map((badge, index) => (
              <span
                key={index}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-body text-xs text-white backdrop-blur-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function OfferSection({ data }: { data?: OfferSectionType }) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-offer-header]', { y: 30, opacity: 0 });
      gsap.set('[data-offer-card]', { y: 40, opacity: 0 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: container.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        })
        .to('[data-offer-header]', {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.1,
        })
        .to(
          '[data-offer-card]',
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.1 },
          '-=0.4',
        );
    },
    { scope: container, dependencies: [data] },
  );

  if (!data) return null;

  const { eyebrow, headline, subheadline, ctaLabel, ctaHref } = data;
  const ordered = [...(data.cards ?? [])].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  );

  return (
    <section ref={container} className="section-padding bg-bg-mid">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            {eyebrow && (
              <p
                data-offer-header
                className="text-xs font-semibold uppercase tracking-widest text-accent"
              >
                {eyebrow}
              </p>
            )}
            <h2
              data-offer-header
              className="mt-4 font-heading text-4xl font-bold text-white md:text-5xl"
            >
              {headline}
            </h2>
            {subheadline && (
              <p data-offer-header className="mt-4 font-body text-base text-silver">
                {subheadline}
              </p>
            )}
          </div>
          <Link
            data-offer-header
            href={ctaHref}
            className="group inline-flex shrink-0 items-center gap-1.5 font-heading text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            {ctaLabel}
            <ArrowUpRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        {ordered.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3 lg:min-h-170">
            {ordered.map((card, index) => (
              <OfferCard
                key={card._key}
                card={card}
                featured={index === 0 && Boolean(card.featured)}
                fallbackHref={ctaHref}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
