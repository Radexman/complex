'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { stegaClean } from 'next-sanity';
import { ShieldCheck } from 'lucide-react';

import type { AboutPageQueryResult } from '@/sanity.types';
import { BENEFIT_ICON_MAP } from '@/app/lib/benefitIcons';

gsap.registerPlugin(ScrollTrigger);

type AboutPage = NonNullable<AboutPageQueryResult>;
type AboutValuesProps = Pick<AboutPage, 'valuesEyebrow' | 'valuesHeadline' | 'values'>;

export default function AboutValues({
  valuesEyebrow,
  valuesHeadline,
  values,
}: AboutValuesProps) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-values-header]', { y: 30, opacity: 0 });
      gsap.set('[data-values-card]', { y: 40, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      tl.to('[data-values-header]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
      }).to(
        '[data-values-card]',
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.07 },
        '-=0.4',
      );
    },
    { scope: container, dependencies: [values] },
  );

  if (!values || values.length === 0) return null;

  return (
    <section ref={container} className="section-padding bg-bg-deep">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="text-center">
          {valuesEyebrow && (
            <p
              data-values-header
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent"
            >
              {valuesEyebrow}
            </p>
          )}
          {valuesHeadline && (
            <h2
              data-values-header
              className="font-heading text-4xl font-bold text-white md:text-5xl"
            >
              {valuesHeadline}
            </h2>
          )}
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = BENEFIT_ICON_MAP[stegaClean(value.icon)] ?? ShieldCheck;
            return (
              <div
                key={value._key}
                data-values-card
                className="rounded-xl border border-graphite bg-bg-surface p-6 transition-colors duration-300 hover:border-accent/40"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="text-accent" size={20} aria-hidden="true" />
                </span>
                <p className="mt-2 font-heading text-base font-semibold text-white">
                  {value.title}
                </p>
                <p className="mt-1 font-body text-sm leading-relaxed text-silver">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
