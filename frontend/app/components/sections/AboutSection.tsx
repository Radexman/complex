'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { stegaClean } from 'next-sanity';
import { Gem, Target, Wrench, Award, type LucideIcon } from 'lucide-react';

import type { AboutSection as AboutSectionType } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';

gsap.registerPlugin(ScrollTrigger);

type AboutBadgeType = NonNullable<AboutSectionType['badges']>[number];

const ICON_MAP: Record<string, LucideIcon> = {
  gem: Gem,
  target: Target,
  wrench: Wrench,
  award: Award,
};

function AboutBadge({ badge }: { badge: AboutBadgeType }) {
  const { icon, title, description } = badge;
  const Icon = ICON_MAP[stegaClean(icon ?? '')] ?? Gem;

  return (
    <div data-about-reveal className="flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15">
        <Icon className="text-accent" size={20} aria-hidden="true" />
      </span>
      <div>
        {title && <p className="font-heading font-semibold text-white">{title}</p>}
        {description && (
          <p className="mt-1 font-body text-xs leading-relaxed text-silver">{description}</p>
        )}
      </div>
    </div>
  );
}

export default function AboutSection({ data }: { data: AboutSectionType }) {
  const container = useRef<HTMLElement>(null);
  const { cardImage, cardContent, eyebrow, headline, description, badges } = data;

  const imageUrl = cardImage?.asset
    ? urlForImage(cardImage).width(1000).quality(80).url()
    : undefined;

  const paragraphs = description
    ? description.split(/\n{2,}/).filter((paragraph) => paragraph.trim().length > 0)
    : [];

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-about-reveal]', { y: 30, opacity: 0 });

      gsap.to('[data-about-reveal]', {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: container, dependencies: [data] },
  );

  return (
    <section ref={container} className="section-padding bg-bg-deep">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {imageUrl && (
            <div data-about-reveal className="relative">
              <div className="relative aspect-4/5 overflow-hidden rounded-2xl">
                <Image
                  src={imageUrl}
                  alt={cardImage?.alt || stegaClean(headline)}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              {cardContent && (
                <div className="glass absolute -bottom-7 -right-7 max-w-xs rounded-2xl p-6">
                  <p className="font-display text-4xl leading-none text-accent">
                    {cardContent.title}
                  </p>
                  <p className="mt-2 font-body text-sm leading-relaxed text-silver">
                    {cardContent.description}
                  </p>
                </div>
              )}
            </div>
          )}
          <div>
            {eyebrow && (
              <p
                data-about-reveal
                className="text-xs font-semibold uppercase tracking-widest text-accent"
              >
                {eyebrow}
              </p>
            )}
            <h2
              data-about-reveal
              className="mt-4 font-heading text-4xl font-bold leading-tight text-white md:text-5xl"
            >
              {headline}
            </h2>
            {paragraphs.length > 0 && (
              <div className="mt-6 space-y-4">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    data-about-reveal
                    className="font-body text-base leading-relaxed text-silver"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
            {badges && badges.length > 0 && (
              <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                {badges.map((badge) => (
                  <AboutBadge key={badge._key} badge={badge} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
