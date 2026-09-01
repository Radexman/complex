'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';

import type { ServiceBySlugQueryResult } from '@/sanity.types';

gsap.registerPlugin(ScrollTrigger);

type Service = NonNullable<ServiceBySlugQueryResult>;
type RelatedOffers = Service['relatedOffers'];

/**
 * Cross-links from one offer subpage to the related ones — e.g. „Zadaszenia
 * tarasowe” → „Akcesoria do zadaszeń”, since the accessories that go on a canopy
 * live on their own page.
 *
 * A separate section rather than part of `OfferGallery`: the gallery returns
 * `null` when a service has no projects yet, which would otherwise take the
 * cross-links down with it.
 *
 * The intro text is optional — an entry with only a label renders as a bare
 * button, which is what the terrace pages use.
 */
export default function OfferRelatedLinks({ relatedOffers }: { relatedOffers: RelatedOffers }) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-related-reveal]', { y: 24, opacity: 0 });

      gsap.to('[data-related-reveal]', {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: container.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: container, dependencies: [relatedOffers] },
  );

  // A reference can outlive its target (unpublished or deleted document), in
  // which case `target` resolves to null — drop those rather than link to
  // `/oferta/undefined`.
  const entries = relatedOffers?.filter((entry) => entry.target?.slug) ?? [];

  if (entries.length === 0) return null;

  return (
    <section ref={container} className="bg-bg-deep pb-20">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="flex flex-col gap-6 border-t border-graphite pt-10">
          {entries.map((entry) => (
            <div
              key={entry._key}
              data-related-reveal
              className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between"
            >
              {entry.text && (
                <p className="max-w-2xl font-heading text-lg font-bold text-white md:text-xl">
                  {entry.text}
                </p>
              )}
              <Link
                href={`/oferta/${entry.target!.slug}`}
                className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-6 py-3.5 font-heading text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
              >
                {entry.label}
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
