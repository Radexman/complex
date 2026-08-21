'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import type { AboutPageQueryResult } from '@/sanity.types';

type AboutPage = NonNullable<AboutPageQueryResult>;
type AboutHeroProps = Pick<AboutPage, 'heroHeadline' | 'heroSubheadline'>;

export default function AboutHero({ heroHeadline, heroSubheadline }: AboutHeroProps) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-hero-left]', { x: -30, opacity: 0 });
      gsap.set('[data-hero-right]', { x: 30, opacity: 0 });

      gsap.to('[data-hero-left], [data-hero-right]', {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
      });
    },
    { scope: container, dependencies: [heroHeadline] },
  );

  return (
    // pt-28 clears the fixed navbar, matching the /wycena and /oferta page heroes.
    // Backgrounds alternate deep/mid down the page; ProcessTimeline is shared and hardcodes
    // bg-bg-mid, so the surrounding sections are assigned around it.
    <section ref={container} className="border-b border-graphite bg-bg-deep pb-20 pt-28">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-2">
          <div data-hero-left>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
              Complex sp. z o.o.
            </p>
            <h1 className="font-heading text-6xl font-bold leading-none text-white md:text-7xl">
              {heroHeadline}
            </h1>
          </div>

          {heroSubheadline && (
            <div data-hero-right className="border-t border-accent/30 pt-6">
              <p className="font-body text-base leading-relaxed text-white/80">{heroSubheadline}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
