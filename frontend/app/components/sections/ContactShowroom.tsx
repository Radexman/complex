'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { CalendarClock, MapPin, Phone, Mail } from 'lucide-react';

import type { BottomCtaQueryResult } from '@/sanity.types';
import ServiceAreaNotice from '@/app/components/ui/ServiceAreaNotice';
import ProjectLightbox, { type LightboxProject } from '@/app/components/ui/ProjectLightbox';
import { urlForImage } from '@/sanity/lib/utils';

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
  | 'mapAddress'
  | 'serviceAreaLabel'
  | 'serviceAreaDescription'
  | 'showroomGallery'
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
  mapAddress,
  serviceAreaLabel,
  serviceAreaDescription,
  showroomGallery,
}: ContactShowroomData) {
  const container = useRef<HTMLDivElement>(null);
  const [openPhoto, setOpenPhoto] = useState<LightboxProject | null>(null);

  const phone = contactPhone || '+48 661 242 507';
  const email = contactEmail || 'biuro@ccomplex.pl';
  const gallery = (showroomGallery ?? []).filter((photo) => photo.asset);
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
    // `scroll-mt-20` clears the fixed navbar when the /#kontakt anchor lands here.
    <div id="kontakt" ref={container} className="scroll-mt-20 bg-bg-mid py-20">
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

          {showroomDescription && (
            <p className="mt-8 font-body text-base text-silver">{showroomDescription}</p>
          )}
          {showroomAddress && (
            <p className="mt-4 flex items-center gap-2 font-body text-sm text-white">
              <MapPin size={16} className="text-accent" aria-hidden="true" />
              {showroomAddress}
            </p>
          )}

          {/* Office — the prominent notice: visits are by prior appointment only. */}
          {(officeLabel || officeDescription) && (
            <div className="mt-8 flex gap-3 rounded-lg border-l-4 border-accent bg-accent/10 p-4">
              <CalendarClock size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                {officeLabel && (
                  <h4 className="font-heading text-base font-bold text-white">{officeLabel}</h4>
                )}
                {officeDescription && (
                  <p className="mt-1 font-body text-sm text-silver">{officeDescription}</p>
                )}
              </div>
            </div>
          )}

          <ServiceAreaNotice label={serviceAreaLabel} description={serviceAreaDescription} />

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
        </div>

        {/* Right: Leaflet map, with the exposition photos beneath it */}
        <div data-map-reveal>
          <div className="h-80 w-full overflow-hidden rounded-xl border border-graphite">
            <ShowroomMap address={mapAddress ?? undefined} />
          </div>

          {/* Hidden entirely until the client uploads a photo. */}
          {gallery.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {gallery.map((photo) => (
                <button
                  key={photo._key}
                  type="button"
                  onClick={() =>
                    setOpenPhoto({
                      _id: photo._key,
                      title: showroomLabel || 'Ekspozycja',
                      city: showroomAddress || '',
                      coverImage: photo,
                    })
                  }
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-graphite"
                >
                  <Image
                    src={urlForImage(photo).width(600).height(600).fit('crop').quality(80).url()}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 768px) 33vw, 180px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reuses the project lightbox rather than adding a second full-screen dialog. */}
      <ProjectLightbox project={openPhoto} onClose={() => setOpenPhoto(null)} />
    </div>
  );
}
