'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import type { FaqPageQueryResult } from '@/sanity.types';

type FaqHeroProps = Pick<NonNullable<FaqPageQueryResult>, 'eyebrow' | 'headline' | 'subheadline'>;

export default function FaqHero({ eyebrow, headline, subheadline }: FaqHeroProps) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-faq-hero-left]', { x: -30, opacity: 0 });
      gsap.set('[data-faq-hero-right]', { x: 30, opacity: 0 });

      gsap.to('[data-faq-hero-left], [data-faq-hero-right]', {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
      });
    },
    { scope: container, dependencies: [headline] },
  );

  return (
    // pt-28 clears the fixed navbar, matching the /o-nas and /oferta headers.
    <header ref={container} className="border-b border-graphite bg-bg-mid pb-16 pt-28 md:pb-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-end gap-8 px-6 md:grid-cols-2 md:gap-12 md:px-12">
        <div data-faq-hero-left>
          {eyebrow && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
              {eyebrow}
            </p>
          )}
          <h1 className="font-heading text-5xl font-bold leading-none text-white md:text-7xl">
            {headline}
          </h1>
        </div>
        {subheadline && (
          <div data-faq-hero-right className="border-t border-accent/30 pt-6">
            <p className="font-body text-base leading-relaxed text-silver">{subheadline}</p>
          </div>
        )}
      </div>
    </header>
  );
}
