'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from 'lucide-react';

import type { GalleryProjectsByCategoryQueryResult } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';
import ProjectLightbox from '@/app/components/ui/ProjectLightbox';

gsap.registerPlugin(ScrollTrigger);

type GalleryProject = GalleryProjectsByCategoryQueryResult[number];

function GalleryCell({ project, onOpen }: { project: GalleryProject; onOpen: () => void }) {
  const imageUrl = project.coverImage?.asset
    ? urlForImage(project.coverImage).width(600).height(600).fit('crop').quality(80).url()
    : undefined;

  return (
    <button
      type="button"
      data-gallery-cell
      onClick={onOpen}
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-bg-surface text-left"
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={project.coverImage?.alt || project.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}
      {/* Hover-only darkening overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {/* Hover-only city label */}
      <span className="absolute bottom-3 left-3 font-heading text-sm font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {project.city}
      </span>
    </button>
  );
}

export default function OfferGallery({
  projects,
  categoryLabel,
  footerText,
  facebookUrl,
}: {
  projects: GalleryProjectsByCategoryQueryResult;
  categoryLabel: string;
  footerText?: string | null;
  facebookUrl?: string | null;
}) {
  const container = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<GalleryProject | null>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-gallery-header]', { y: 30, opacity: 0 });
      gsap.set('[data-gallery-cell]', { y: 50, opacity: 0 });
      gsap.set('[data-gallery-footer]', { y: 20, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      tl.to('[data-gallery-header]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
      })
        .to(
          '[data-gallery-cell]',
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06 },
          '-=0.3',
        )
        .to(
          '[data-gallery-footer]',
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 },
          '-=0.2',
        );
    },
    { scope: container, dependencies: [projects] },
  );

  if (!projects || projects.length === 0) return null;

  return (
    <section ref={container} className="section-padding bg-bg-deep">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        {/* Header (left-aligned) */}
        <div>
          <p
            data-gallery-header
            className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent"
          >
            Nasze realizacje
          </p>
          <h2
            data-gallery-header
            className="font-heading text-3xl font-bold text-white md:text-4xl"
          >
            Galeria — {categoryLabel}
          </h2>
        </div>

        {/* Flat uniform square grid — smaller, more, and equal-sized cells (client
            request: her photos aren't consistent quality, so no hero cell to hide). */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {projects.map((project) => (
            <GalleryCell key={project._id} project={project} onOpen={() => setSelected(project)} />
          ))}
        </div>

        {(footerText || facebookUrl) && (
          <div data-gallery-footer className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            {footerText && <p className="font-body text-sm text-silver">{footerText}</p>}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 font-heading text-sm font-medium text-accent transition-colors hover:text-accent-hover"
              >
                Zobacz nas na Facebooku
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            )}
          </div>
        )}

        <Link
          data-gallery-footer
          href="/realizacje"
          className="group mt-8 inline-flex items-center gap-1.5 font-heading text-sm font-medium text-accent transition-colors hover:text-accent-hover"
        >
          Zobacz wybrane realizacje
          <ArrowUpRight
            size={18}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      <ProjectLightbox project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
