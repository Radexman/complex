'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { stegaClean } from 'next-sanity';
import { ArrowRight, FileText } from 'lucide-react';

import type { ServiceBySlugQueryResult } from '@/sanity.types';

gsap.registerPlugin(ScrollTrigger);

const FORM_LABELS: Record<string, string> = {
  zadaszenie: 'Formularz wyceny zadaszenia',
  zaluzje: 'Formularz wyceny żaluzji',
  taras: 'Formularz wyceny tarasu',
  schody: 'Formularz wyceny schodów',
};

type Service = NonNullable<ServiceBySlugQueryResult>;
type OfferFormCtaProps = Pick<
  Service,
  | 'formCtaHeadline'
  | 'formCtaSubheadline'
  | 'formCtaButtonLabel'
  | 'formCtaBullets'
  | 'relatedFormSlug'
>;

export default function OfferFormCta({
  formCtaHeadline,
  formCtaSubheadline,
  formCtaButtonLabel,
  formCtaBullets,
  relatedFormSlug,
}: OfferFormCtaProps) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-formcta-content]', { y: 40, opacity: 0 });
      gsap.set('[data-formcta-bar]', { scaleX: 0, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      tl.to('[data-formcta-bar]', {
        scaleX: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        transformOrigin: 'center',
      }).to(
        '[data-formcta-content]',
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 },
        '-=0.5',
      );
    },
    { scope: container, dependencies: [formCtaBullets] },
  );

  const formSlug = stegaClean(relatedFormSlug);

  if (!formSlug) return null;

  const formLabel = FORM_LABELS[formSlug];

  return (
    <section ref={container} className="relative overflow-hidden bg-bg-mid py-24">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-120 w-120 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div
          data-formcta-bar
          className="mb-16 h-px w-full bg-linear-to-r from-transparent via-accent/50 to-transparent"
          aria-hidden="true"
        />

        <span
          data-formcta-content
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-graphite bg-bg-surface px-4 py-1.5 text-sm text-silver"
        >
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          Bezpłatna wycena
        </span>

        {formCtaHeadline && (
          <h2
            data-formcta-content
            className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl"
          >
            {formCtaHeadline}
          </h2>
        )}

        {formCtaSubheadline && (
          <p data-formcta-content className="mx-auto mt-4 max-w-xl font-body text-lg text-silver">
            {formCtaSubheadline}
          </p>
        )}

        <div data-formcta-content className="mt-10 flex flex-col items-center gap-4">
          <Link
            href={`/wycena/${formSlug}`}
            className="inline-flex items-center gap-3 rounded-lg bg-accent px-10 py-5 text-base font-semibold text-black transition-colors hover:bg-accent-hover"
          >
            {formCtaButtonLabel || 'Wypełnij formularz wyceny'}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          {formLabel && (
            <span className="inline-flex items-center gap-2 text-sm text-silver">
              <FileText size={15} className="text-accent" aria-hidden="true" />
              Prowadzi do: <span className="font-semibold text-white">{formLabel}</span>
            </span>
          )}
        </div>

        {formCtaBullets && formCtaBullets.length > 0 && (
          <div data-formcta-content className="mt-6 flex flex-wrap justify-center gap-8">
            {formCtaBullets.map((bullet, index) => (
              <span key={index} className="flex items-center gap-2 text-sm text-silver">
                <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                {bullet}
              </span>
            ))}
          </div>
        )}

        <div
          data-formcta-bar
          className="mt-16 h-px w-full bg-linear-to-r from-transparent via-accent/50 to-transparent"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
