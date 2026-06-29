'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { Accordion } from '@ark-ui/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronDown } from 'lucide-react';

import type { ServiceBySlugQueryResult } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';

gsap.registerPlugin(ScrollTrigger);

type Service = NonNullable<ServiceBySlugQueryResult>;
type OfferBrandsProps = Pick<
  Service,
  'brandsEyebrow' | 'brandsHeadline' | 'brandsDescription' | 'brands'
>;
type Brand = NonNullable<Service['brands']>[number];

function BrandItem({ brand }: { brand: Brand }) {
  const specs = brand.specs?.filter(Boolean) ?? [];
  const imageUrl = brand.image?.asset
    ? urlForImage(brand.image).width(400).height(280).fit('crop').quality(80).url()
    : undefined;

  return (
    <Accordion.Item
      value={brand._key}
      data-brands-item
      className="overflow-hidden rounded-xl"
    >
      <Accordion.ItemTrigger className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-graphite bg-bg-surface px-6 py-5 outline-none transition-all duration-200 hover:border-accent/40 data-[state=open]:border-accent/60">
        <span className="text-left">
          <span className="block font-heading text-lg font-semibold text-white">{brand.name}</span>
          {brand.shortDescription && (
            <span className="mt-0.5 block font-body text-sm text-silver">
              {brand.shortDescription}
            </span>
          )}
        </span>
        <ChevronDown
          className="shrink-0 text-silver transition-all duration-200 group-hover:text-accent group-data-[state=open]:rotate-180"
          size={20}
          aria-hidden="true"
        />
      </Accordion.ItemTrigger>
      <Accordion.ItemContent className="overflow-hidden">
        <div className="px-6 pb-6 pt-2">
          <div className={imageUrl ? 'grid items-start gap-8 md:grid-cols-2' : ''}>
            <div>
              {brand.fullDescription && (
                <p className="font-body text-sm leading-relaxed text-silver">
                  {brand.fullDescription}
                </p>
              )}
              {specs.length > 0 && (
                <>
                  <p className="mb-2 mt-4 font-heading text-xs font-semibold uppercase tracking-wider text-white">
                    Specyfikacja
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {specs.map((spec, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 font-body text-sm text-silver"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={brand.image?.alt || brand.name}
                width={400}
                height={280}
                className="w-full rounded-lg object-cover"
              />
            )}
          </div>
        </div>
      </Accordion.ItemContent>
    </Accordion.Item>
  );
}

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

        <Accordion.Root collapsible multiple={false} className="mt-10 flex max-w-4xl flex-col gap-2">
          {brands.map((brand) => (
            <BrandItem key={brand._key} brand={brand} />
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
