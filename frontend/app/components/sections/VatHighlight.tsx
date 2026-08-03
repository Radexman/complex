'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Receipt } from 'lucide-react';

import type { VatHighlightQueryResult } from '@/sanity.types';

gsap.registerPlugin(ScrollTrigger);

type VatRate = NonNullable<NonNullable<VatHighlightQueryResult>['rates']>[number];

function RateCard({ rate }: { rate: VatRate }) {
  return (
    <div
      data-vat-reveal
      className={`rounded-xl border p-6 ${
        rate.isAdvantage ? 'border-accent bg-accent/10' : 'border-graphite bg-bg-surface opacity-80'
      }`}
    >
      <p
        className={`font-display text-5xl leading-none ${
          rate.isAdvantage ? 'text-accent' : 'text-silver'
        }`}
      >
        {rate.rate}
      </p>
      <p className="mt-3 font-heading text-base font-semibold text-white">{rate.label}</p>
      {rate.description && (
        <p className="mt-2 font-body text-sm leading-relaxed text-silver">{rate.description}</p>
      )}
    </div>
  );
}

/**
 * Compact band explaining the reduced VAT rate that applies when CComplex
 * supplies the materials. Rendered on the home page and on every offer page, so
 * it is deliberately one band rather than a full-height section.
 */
export default function VatHighlight({ data }: { data: NonNullable<VatHighlightQueryResult> }) {
  const container = useRef<HTMLElement>(null);
  const rates = data.rates ?? [];

  // The arrow only makes sense with exactly one expensive and one cheap option.
  const standard = rates.find((rate) => !rate.isAdvantage);
  const advantage = rates.find((rate) => rate.isAdvantage);
  const showArrow = rates.length === 2 && standard !== undefined && advantage !== undefined;

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-vat-reveal]', { y: 30, opacity: 0 });
      gsap.to('[data-vat-reveal]', {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: container, dependencies: [rates.length] },
  );

  return (
    <section ref={container} className="bg-bg-mid py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2">
        <div data-vat-reveal>
          {data.eyebrow && (
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-accent uppercase">
              <Receipt size={16} aria-hidden="true" />
              {data.eyebrow}
            </p>
          )}
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">{data.headline}</h2>
          {data.description && (
            <p className="mt-4 font-body text-base leading-relaxed text-silver">
              {data.description}
            </p>
          )}
          {data.ctaLabel && data.ctaHref && (
            <Link
              href={data.ctaHref}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
            >
              {data.ctaLabel}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>

        <div>
          {showArrow ? (
            // Ordered standard → advantage regardless of the CMS array order, so the
            // arrow always reads "from the expensive option to the cheap one".
            <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-[1fr_auto_1fr]">
              <RateCard rate={standard} />
              <div className="flex items-center justify-center" data-vat-reveal aria-hidden="true">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/15">
                  <ArrowRight
                    size={30}
                    strokeWidth={2.5}
                    className="rotate-90 text-accent sm:rotate-0"
                  />
                </span>
              </div>
              <RateCard rate={advantage} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {rates.map((rate) => (
                <RateCard key={rate._key} rate={rate} />
              ))}
            </div>
          )}
          {data.footnote && (
            <p className="mt-4 font-body text-xs leading-relaxed text-silver/70" data-vat-reveal>
              {data.footnote}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
