'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { stegaClean } from 'next-sanity';
import { MapPin, Phone, Mail } from 'lucide-react';

import type { BottomCtaQueryResult } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';

gsap.registerPlugin(ScrollTrigger);

// Leaflet touches `window` at import time → load the map client-only.
const ShowroomMap = dynamic(() => import('@/app/components/ShowroomMap'), { ssr: false });

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
    contactEyebrow,
    contactNote,
    contactPhone,
    contactEmail,
    showroomLabel,
    showroomDescription,
    showroomAddress,
  } = data;

  const phone = contactPhone || '+48 661 242 507';
  const email = contactEmail || 'biuro@ccomplex.pl';
  // tel: links can't contain spaces; keep the leading + for international dialing.
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`;

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

      gsap.set('[data-showroom-reveal]', { y: 30, opacity: 0 });
      gsap.to('[data-showroom-reveal]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '[data-showroom-block]',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      gsap.set('[data-map-reveal]', { x: 20, opacity: 0 });
      gsap.to('[data-map-reveal]', {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '[data-showroom-block]',
          start: 'top 80%',
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

      {/* Showroom / Map block */}
      <div data-showroom-block className="bg-bg-mid py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 md:grid-cols-2">
          {/* Left: contact + showroom text */}
          <div data-showroom-reveal>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
              {contactEyebrow || 'Kontakt bezpośredni'}
            </p>
            {showroomLabel && (
              <h3 className="font-heading text-3xl font-bold text-white">{showroomLabel}</h3>
            )}
            {contactNote && (
              <p className="mt-4 font-body text-base text-silver">{contactNote}</p>
            )}

            {/* Preferred contact buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-base font-semibold text-black transition-colors hover:bg-accent-hover"
              >
                <Phone size={18} aria-hidden="true" />
                {phone}
              </a>
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-graphite bg-bg-surface px-6 py-3.5 text-base font-semibold text-white transition-colors hover:border-accent hover:text-accent"
              >
                <Mail size={18} aria-hidden="true" />
                {email}
              </a>
            </div>

            {showroomDescription && (
              <p className="mt-8 font-body text-base text-silver">{showroomDescription}</p>
            )}
            {showroomAddress && (
              <p className="mt-4 flex items-center gap-2 font-body text-sm text-white">
                <MapPin size={16} className="text-accent" aria-hidden="true" />
                {showroomAddress}
              </p>
            )}
          </div>

          {/* Right: Leaflet map */}
          <div
            data-map-reveal
            className="h-80 w-full overflow-hidden rounded-xl border border-graphite"
          >
            <ShowroomMap />
          </div>
        </div>
      </div>
    </section>
  );
}
