'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Building2, MapPin, Phone, Mail } from 'lucide-react';

import type { BottomCtaQueryResult } from '@/sanity.types';

gsap.registerPlugin(ScrollTrigger);

// Leaflet touches `window` at import time → load the map client-only.
const ShowroomMap = dynamic(() => import('@/app/components/ShowroomMap'), { ssr: false });

/**
 * Shared contact + showroom/map block. Single source of truth for the company's
 * contact details: the `bottomCtaSection` singleton. Rendered both at the bottom
 * of the home page (inside `BottomCtaSection`) and as the final section of every
 * offer page (`/oferta/[slug]`), so the two look identical and edit in one place.
 */
export type ContactShowroomData = Pick<
  NonNullable<BottomCtaQueryResult>,
  | 'contactEyebrow'
  | 'contactNote'
  | 'contactPhone'
  | 'contactEmail'
  | 'showroomLabel'
  | 'showroomDescription'
  | 'showroomAddress'
  | 'officeLabel'
  | 'officeDescription'
>;

export default function ContactShowroom({
  contactEyebrow,
  contactNote,
  contactPhone,
  contactEmail,
  showroomLabel,
  showroomDescription,
  showroomAddress,
  officeLabel,
  officeDescription,
}: ContactShowroomData) {
  const container = useRef<HTMLDivElement>(null);

  const phone = contactPhone || '+48 661 242 507';
  const email = contactEmail || 'biuro@ccomplex.pl';
  // tel: links can't contain spaces; keep the leading + for international dialing.
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`;

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-showroom-reveal]', { y: 30, opacity: 0 });
      gsap.to('[data-showroom-reveal]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container.current,
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
          trigger: container.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: container },
  );

  return (
    <div ref={container} className="bg-bg-mid py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 md:grid-cols-2">
        {/* Left: contact + showroom text */}
        <div data-showroom-reveal>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
            {contactEyebrow || 'Kontakt bezpośredni'}
          </p>
          {showroomLabel && (
            <h3 className="font-heading text-3xl font-bold text-white">{showroomLabel}</h3>
          )}
          {contactNote && <p className="mt-4 font-body text-base text-silver">{contactNote}</p>}

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

          {/* Office — a separate entry below the showroom (meetings are by appointment). */}
          {(officeLabel || officeDescription) && (
            <div className="mt-8 border-t border-graphite pt-6">
              {officeLabel && (
                <h4 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
                  <Building2 size={18} className="text-accent" aria-hidden="true" />
                  {officeLabel}
                </h4>
              )}
              {officeDescription && (
                <p className="mt-2 font-body text-base text-silver">{officeDescription}</p>
              )}
            </div>
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
  );
}
