'use client';

import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Tabs } from '@ark-ui/react/tabs';
import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { stegaClean } from 'next-sanity';
import { X } from 'lucide-react';

import type {
  FeaturedProjectsQueryResult,
  FeaturedProjectsSectionQueryResult,
} from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';

gsap.registerPlugin(ScrollTrigger);

type Project = FeaturedProjectsQueryResult[number];
type ProjectCategory = Project['category'];

const ALL = 'all';

/** Polish labels keyed by category value. Order here drives the tab order. */
const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  'zadaszenia-aluminiowe': 'Zadaszenia aluminiowe',
  'zaluzje-tarasowe': 'Żaluzje tarasowe',
  'tarasy-kompozytowe': 'Tarasy kompozytowe',
  'tarasy-gresowe': 'Tarasy z płyt gresowych',
  'tarasy-drewniane': 'Tarasy drewniane',
  'elewacje-kompozytowe': 'Elewacje kompozytowe',
  'schody-modulowe': 'Schody modułowe',
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as ProjectCategory[];

function categoryLabel(category: ProjectCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const imageUrl = project.coverImage?.asset
    ? urlForImage(project.coverImage).width(800).height(600).fit('crop').quality(80).url()
    : undefined;

  return (
    <button
      type="button"
      data-project-card
      onClick={onOpen}
      className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl bg-bg-surface text-left"
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={project.coverImage?.alt || project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className="object-cover brightness-90 transition duration-300 group-hover:scale-[1.02] group-hover:brightness-100"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-80" />
      <div className="absolute inset-x-3 bottom-3">
        <p className="font-heading text-lg font-bold leading-tight text-white">{project.title}</p>
        <p className="mt-1 font-body text-sm text-silver">{project.city}</p>
      </div>
    </button>
  );
}

export default function FeaturedProjectsSection({
  data,
  projects,
}: {
  data: NonNullable<FeaturedProjectsSectionQueryResult>;
  projects: FeaturedProjectsQueryResult;
}) {
  const container = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<string>(ALL);
  const [selected, setSelected] = useState<Project | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const openProject = (project: Project) => {
    // No cover image → nothing to wait for, reveal immediately.
    setImageLoaded(!project.coverImage?.asset);
    setSelected(project);
  };

  const { eyebrow, headline, subheadline } = data;

  // Only show a tab for categories that actually have a featured project.
  const categories = useMemo(() => {
    const present = new Set(projects.map((p) => stegaClean(p.category)));
    return CATEGORY_ORDER.filter((category) => present.has(category));
  }, [projects]);

  const filtered = useMemo(() => {
    if (activeTab === ALL) return projects;
    return projects.filter((p) => stegaClean(p.category) === activeTab);
  }, [projects, activeTab]);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-fp-reveal]', { y: 30, opacity: 0 });
      gsap.to('[data-fp-reveal]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: container, dependencies: [data] },
  );

  // Re-run the card reveal whenever the filtered set changes (initial load + tab switch).
  useGSAP(
    () => {
      if (!container.current) return;

      gsap.fromTo(
        '[data-project-card]',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: '[data-fp-grid]',
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        },
      );
    },
    { scope: container, dependencies: [activeTab, projects] },
  );

  const selectedImageUrl = selected?.coverImage?.asset
    ? urlForImage(selected.coverImage).width(1600).quality(85).url()
    : undefined;

  return (
    <section ref={container} className="section-padding bg-bg-deep">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Header */}
        {eyebrow && (
          <p data-fp-reveal className="text-xs font-semibold uppercase tracking-widest text-accent">
            {eyebrow}
          </p>
        )}
        <h2 data-fp-reveal className="mt-2 font-heading text-4xl font-bold text-white md:text-5xl">
          {headline}
        </h2>
        {subheadline && (
          <p data-fp-reveal className="mt-3 max-w-xl font-body text-base text-silver">
            {subheadline}
          </p>
        )}

        {/* Category tabs */}
        <Tabs.Root
          value={activeTab}
          onValueChange={(details) => setActiveTab(details.value)}
          activationMode="manual"
          className="mt-8"
        >
          <Tabs.List data-fp-reveal className="flex flex-wrap gap-2">
            <Tabs.Trigger
              value={ALL}
              className="cursor-pointer rounded-full border border-graphite bg-bg-surface px-4 py-2 text-sm font-medium text-silver transition-all duration-200 hover:text-white data-[selected]:border-accent data-[selected]:bg-accent data-[selected]:text-black"
            >
              Wszystkie
            </Tabs.Trigger>
            {categories.map((category) => (
              <Tabs.Trigger
                key={category}
                value={category}
                className="cursor-pointer rounded-full border border-graphite bg-bg-surface px-4 py-2 text-sm font-medium text-silver transition-all duration-200 hover:text-white data-[selected]:border-accent data-[selected]:bg-accent data-[selected]:text-black"
              >
                {categoryLabel(category)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>

        {/* Project grid */}
        <div data-fp-grid className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project._id} project={project} onOpen={() => openProject(project)} />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog.Root
        open={selected !== null}
        onOpenChange={(details) => {
          if (!details.open) setSelected(null);
        }}
      >
        <Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md" />
          <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <Dialog.Content className="relative flex max-h-[90vh] w-full max-w-4xl flex-col items-center">
              <Dialog.CloseTrigger className="absolute -top-2 right-0 z-10 cursor-pointer text-white transition-colors hover:text-accent md:-right-2 md:-top-10">
                <X size={28} aria-hidden="true" />
                <span className="sr-only">Zamknij</span>
              </Dialog.CloseTrigger>
              {selectedImageUrl && !imageLoaded && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 h-9 w-9 -translate-y-1/2 animate-spin rounded-full border-2 border-white/30 border-t-white"
                />
              )}
              {selected && (
                <div
                  className={`flex flex-col items-center transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {selectedImageUrl && (
                    <Image
                      src={selectedImageUrl}
                      alt={selected.coverImage?.alt || selected.title}
                      width={1600}
                      height={1200}
                      onLoad={() => setImageLoaded(true)}
                      className="max-h-[85vh] w-auto rounded-xl object-contain"
                    />
                  )}
                  <div className="mt-4 text-center">
                    <Dialog.Title className="font-heading text-xl font-bold text-white">
                      {selected.title}
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 font-body text-sm text-silver">
                      {selected.city}
                    </Dialog.Description>
                  </div>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </section>
  );
}
