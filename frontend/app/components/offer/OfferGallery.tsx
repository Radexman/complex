'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import type { GalleryProjectsByCategoryQueryResult } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';
import ProjectLightbox from '@/app/components/ui/ProjectLightbox';

gsap.registerPlugin(ScrollTrigger);

type GalleryProject = GalleryProjectsByCategoryQueryResult[number];

/**
 * Bento sizing. Every cell is a uniform square so rows align deterministically at
 * any width; the first cell becomes a 2×2 hero on `md`+ (its `aspect-auto` lets the
 * grid span define its size instead of the square ratio). With 6 projects this fills
 * a perfect 3×3 block. Mobile stays a plain uniform 2-column square grid.
 */
function bentoClass(index: number): string {
  return index === 0 ? 'md:col-span-2 md:row-span-2 md:aspect-auto' : '';
}

function GalleryCell({
  project,
  className,
  onOpen,
}: {
  project: GalleryProject;
  className: string;
  onOpen: () => void;
}) {
  const imageUrl = project.coverImage?.asset
    ? urlForImage(project.coverImage).width(1200).height(1200).fit('crop').quality(80).url()
    : undefined;

  return (
    <button
      type="button"
      data-gallery-cell
      onClick={onOpen}
      className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-bg-surface text-left ${className}`}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={project.coverImage?.alt || project.title}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
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
}: {
  projects: GalleryProjectsByCategoryQueryResult;
  categoryLabel: string;
}) {
  const container = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<GalleryProject | null>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-gallery-header]', { y: 30, opacity: 0 });
      gsap.set('[data-gallery-cell]', { y: 50, opacity: 0 });

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
      }).to(
        '[data-gallery-cell]',
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06 },
        '-=0.3',
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

        {/* One square grid: 2-col on mobile, 3-col on md+ with a 2×2 hero (first cell). */}
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {projects.map((project, index) => (
            <GalleryCell
              key={project._id}
              project={project}
              className={bentoClass(index)}
              onOpen={() => setSelected(project)}
            />
          ))}
        </div>
      </div>

      <ProjectLightbox project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
