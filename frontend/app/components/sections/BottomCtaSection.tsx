'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { stegaClean } from 'next-sanity';

import type { BottomCtaQueryResult } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';

import ContactShowroom from './ContactShowroom';

gsap.registerPlugin(ScrollTrigger);

/**
 * Splits the headline so the `accent` substring renders in the accent color.
 * Strips stega metadata before matching (same pattern as HeroSection).
 */
function renderHeadline(headline: string, accent?: string | null) {
  const cleanHeadline = stegaClean(headline);
  const cleanAccent = accent ? stegaClean(accent) : undefined;
  if (!cleanAccent || !cleanHeadline.includes(cleanAccent)) {
    return cleanHeadline;
  }
  const [before, ...rest] = cleanHeadline.split(cleanAccent);
  const after = rest.join(cleanAccent);
  return (
    <>
      {before}
      <span className="text-accent">{accent}</span>
      {after}
    </>
  );
}

export default function BottomCtaSection({ data }: { data: NonNullable<BottomCtaQueryResult> }) {
  const container = useRef<HTMLElement>(null);

  const {
    backgroundImage,
    eyebrow,
    headline,
    headlineAccent,
    subheadline,
    primaryCtaLabel,
    primaryCtaHref,
    secondaryCtaLabel,
    secondaryCtaHref,
    bullets,
  } = data;

  const bgUrl = backgroundImage?.asset
    ? urlForImage(backgroundImage).width(2400).quality(80).url()
    : undefined;

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-cta-reveal]', { y: 40, opacity: 0 });
      gsap.to('[data-cta-reveal]', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: '[data-cta-block]',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: container, dependencies: [data] },
  );

  return (
    <section ref={container} className="bg-bg-deep">
      {/* CTA block */}
      <div
        data-cta-block
        className="relative flex min-h-[50vh] items-center justify-center overflow-hidden py-16"
      >
        {bgUrl && (
          <Image
            src={bgUrl}
            alt={backgroundImage?.alt || ''}
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/70" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          {eyebrow && (
            <span
              data-cta-reveal
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-graphite bg-bg-surface px-4 py-1.5 text-sm text-silver"
            >
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              {eyebrow}
            </span>
          )}

          <h2
            data-cta-reveal
            className="font-heading text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl"
          >
            {renderHeadline(headline, headlineAccent)}
          </h2>

          {subheadline && (
            <p data-cta-reveal className="mx-auto mt-6 max-w-2xl font-body text-lg text-silver">
              {subheadline}
            </p>
          )}

          <div
            data-cta-reveal
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            {primaryCtaLabel && primaryCtaHref && (
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 text-base font-semibold text-black transition-colors hover:bg-accent-hover"
              >
                {primaryCtaLabel}
                <span aria-hidden="true">→</span>
              </Link>
            )}
            {secondaryCtaLabel && secondaryCtaHref && (
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center rounded-lg border border-graphite bg-bg-surface px-8 py-4 text-base font-semibold text-white transition-colors hover:border-accent hover:text-accent"
              >
                {secondaryCtaLabel}
              </Link>
            )}
          </div>

          {bullets && bullets.length > 0 && (
            <div data-cta-reveal className="mt-8 flex flex-wrap justify-center gap-6">
              {bullets.map((bullet, i) => (
                <span key={i} className="flex items-center gap-2 text-sm text-silver">
                  <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                  {bullet}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Showroom / Map block — shared with the offer pages */}
      <ContactShowroom
        contactEyebrow={data.contactEyebrow}
        contactNote={data.contactNote}
        contactPhone={data.contactPhone}
        contactEmail={data.contactEmail}
        showroomLabel={data.showroomLabel}
        showroomDescription={data.showroomDescription}
        showroomAddress={data.showroomAddress}
      />
    </section>
  );
}
