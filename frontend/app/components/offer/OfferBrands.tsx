'use client';

import { useRef } from 'react';
import { Accordion } from '@ark-ui/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { BrandItem } from './BrandItem';
import type { Service } from './brandTypes';

gsap.registerPlugin(ScrollTrigger);

type OfferBrandsProps = Pick<
  Service,
  'brandsEyebrow' | 'brandsHeadline' | 'brandsDescription' | 'brands'
>;

export default function OfferBrands({
  brandsEyebrow,
  brandsHeadline,
  brandsDescription,
  brands,
}: OfferBrandsProps) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-brands-header]', { y: 30, opacity: 0 });
      gsap.set('[data-brands-item]', { y: 20, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      tl.to('[data-brands-header]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
      }).to(
        '[data-brands-item]',
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.08 },
        '-=0.3',
      );
    },
    { scope: container, dependencies: [brands] },
  );

  if (!brands || brands.length === 0) return null;

  return (
    <section ref={container} className="section-padding bg-bg-mid">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="max-w-2xl">
          <p
            data-brands-header
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent"
          >
            {brandsEyebrow || 'Producenci i systemy'}
          </p>
          {brandsHeadline && (
            <h2 data-brands-header className="font-heading text-4xl font-bold text-white">
              {brandsHeadline}
            </h2>
          )}
          {brandsDescription && (
            <p data-brands-header className="mt-3 max-w-2xl font-body text-base text-silver">
              {brandsDescription}
            </p>
          )}
        </div>

        <Accordion.Root
          collapsible
          multiple={false}
          className="mt-10 flex max-w-4xl flex-col gap-2"
        >
          {brands.map((brand) => (
            <BrandItem key={brand._key} brand={brand} />
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
